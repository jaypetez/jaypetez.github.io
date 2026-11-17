---
title: 'CI minutes were priced for humans'
description: 'Agents push code all night, and GitHub bills every push by the minute. How I would run Actions on my own hardware with ARC and two Helm charts.'
pubDate: 2026-11-16
tags: ['agents', 'infrastructure', 'homelab', 'ci']
---
This morning an agent cleared the open pull requests on this site. Two
GitHub Actions bumps, a handful of npm bumps, a search feature that had to
be rebased onto a main branch that had moved under it, and one older PR that
went red because a post written after it broke a test it added. Every push
kicked off the same three jobs: tests on Node 22, tests on Node 24, and a
build. A Dependabot rebase is a push. A fix is a push. A merge to main is a
push that runs the whole thing again before it deploys. The skill that
drives this,
[dependabot-sweep](https://github.com/jaypetez/jaypetez.github.io/tree/main/.claude/skills/dependabot-sweep),
found 26 open PRs across five of my repositories the first time it ran, and
it is happy to work through all of them while I am asleep.

None of that cost me anything, because these repositories are public and
GitHub runs standard runners for public repositories free. But I watched the
checks tick by and did the arithmetic for the private version of the same
morning, and it was the first time the Actions bill felt like it was
measuring the wrong thing.

Here is the claim. GitHub's per-minute pricing was designed around a person
pushing a few times a day, and AI-native work breaks that assumption: the
number of CI runs now scales with how many agents you point at a codebase,
not with how many people you employ. If you have spare cores anywhere, the
answer is to run your own runners, and the cleanest way I know to do that is
the Actions Runner Controller on Kubernetes, installed with two Helm charts.

## The meter runs on the wrong unit

The pricing is not unreasonable on its face. On 1 January 2026 GitHub [cut
hosted runner
prices](https://docs.github.com/en/billing/reference/actions-runner-pricing)
by up to 39%, and a standard two-core Linux minute went from $0.008 to
$0.006. Plans still include a monthly allowance of free minutes. For a team
of humans who open a pull request or two a day each, that is a rounding
error next to their salaries, which is exactly the population the model was
built for.

Two details stop being rounding errors once agents are doing the pushing.
The first is that GitHub rounds every job up to the next whole minute. The
three jobs on this site each finish in thirty to forty seconds, so a run
uses about a minute and a half of compute and bills three. Agents like
small, fast, parallel jobs, because a quick red signal is what lets a fix
loop converge, and the rounding punishes precisely that shape.

The second is volume. A human treats CI as a gate they pass once or twice
per change. An agent treats it as a compiler. It pushes, reads the failure,
pushes again. The dependabot-sweep skill allows three fix attempts per PR
before it gives up, and that is a conservative harness; plenty of agent
setups will happily loop ten times on a flaky test. I wrote about why the
loop is the product in [the harness
post](/writing/nobody-wants-to-build-the-harness/). The bill is the other
side of that coin: every iteration of a loop that is supposed to be cheap
goes through a meter. Per-minute pricing meters the one thing agents made
cheap to produce.

Try the arithmetic for a small private project, with numbers I am making up
but that I do not think are generous. A fifteen-minute test suite on two
cores costs $0.09 a run. Four agents, each landing ten PRs a day and pushing
eight times per PR, is 320 runs, or about $29 a day. Agents do not keep
office hours, so call it thirty days: roughly $860 a month, for one
repository, before anyone has bought a larger runner. Now flip it around.
One two-core runner that is busy every minute of a thirty-day month is
43,200 minutes, which GitHub would bill at $259.20. Eight of them is
$2,073.60. A used sixteen-core box that can hold eight two-core runners
costs about one month of that on the secondhand market, and then it costs
electricity.

<aside class="pull" aria-hidden="true">

Per-minute pricing meters the one thing agents made cheap to produce.

</aside>

Hardware is a flat cost, and a flat cost is what you want under a workload
whose volume you have stopped controlling by hand.

## Two charts and a listener

The [Actions Runner
Controller](https://github.com/actions/actions-runner-controller) is
GitHub's own Kubernetes operator for self-hosted runners. It went through a
rewrite a few years ago, and the current design, runner scale sets, is the
one worth using. It is still moving: [release
0.15.0](https://github.blog/changelog/2026-10-01-actions-runner-controller-release-0-15-0/)
shipped on 1 October with reliability and observability work for scale sets.

It comes as two Helm charts, both published as OCI artifacts on ghcr.io. The
first, `gha-runner-scale-set-controller`, is the operator, and you install
it once per cluster. The second, `gha-runner-scale-set`, is a pool of
runners, and you install it once per pool: one for a repository, an
organization, or a class of job that needs a GPU.

```
helm install arc \
  --namespace arc-systems --create-namespace \
  oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set-controller

helm install arc-runners \
  --namespace arc-runners --create-namespace \
  -f values.yaml \
  oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set
```

The values file carries the part that matters. `githubConfigUrl` points at
the repository or organization the pool serves. `githubConfigSecret` names a
Kubernetes secret holding credentials, and those should be a GitHub App's
ID, installation ID, and private key rather than a personal access token,
because an App's permissions are scoped and its tokens are short-lived.
`minRunners: 0` lets the pool scale to nothing when no work is queued, and
`maxRunners` is your ceiling, which is the setting that turns a runaway
agent from a bill into a queue. A workflow opts in with `runs-on:
arc-runners`, the name of the Helm release.

<figure>
<pre role="img" aria-label="ARC architecture: a listener pod in the cluster holds an outbound connection to GitHub. When jobs are queued it tells the controller, which starts one ephemeral runner pod per job and deletes each pod when its job ends.">
  GitHub Actions service
           ^
           | outbound HTTPS only,
           | long poll for jobs
           |
  +--------+---------+    +--------------+
  | listener pod     |----| controller   |
  | one per pool     |    | one/cluster  |
  +------------------+    +------+-------+
                                 |
             +-------------------+
             |  one pod per job,
             v  deleted after it
  +--------+ +--------+ +--------+
  | runner | | runner | | runner |
  +--------+ +--------+ +--------+
</pre>
<figcaption>Nothing inbound, and nothing that survives a job</figcaption>
</figure>

Two properties of that design are why I would choose it over a long-lived
runner on a box under a desk. The first is that it needs no inbound
connectivity. Each pool gets a listener pod that holds a long-poll session
open to GitHub and asks for work, so the cluster can sit behind NAT on a
home network with no port forwarded and no webhook endpoint exposed. The
second is that every runner is ephemeral. A pod takes exactly one job and is
deleted when the job ends, so nothing a job writes to disk, and nothing a
compromised dependency leaves behind, is there for the next job to find.

The sharp edges are real and you will hit them in the first hour. The
default runner image is deliberately thin, nothing like the kitchen-sink
Ubuntu image GitHub hosts, so workflows that assumed a preinstalled
toolchain need explicit setup steps or a custom image of your own. Jobs that
build containers need `containerMode` set: `dind` runs a privileged Docker
daemon beside each runner, which is simple and a meaningful loosening of
isolation, while `kubernetes` mode runs job containers as their own pods and
needs a persistent volume for the work directory. And caches that were warm
on GitHub's network start cold on yours until you put something like a
registry mirror in front of them.

## The case for paying

The strongest argument against all of this is that your time is not free,
and it is a good argument. Hosted runners are clean machines that someone
else patches, scales, secures, and pages for at three in the morning.
Running a Kubernetes cluster to save a few hundred dollars a month is a bad
trade for a team with nobody who wants to own a cluster, and I would not
tell a three-person startup to adopt one for CI alone. If you already run
Kubernetes, the trade looks very different, because ARC is two charts on
infrastructure you are paying attention to anyway.

There is also a security argument, and it points somewhere specific. GitHub
[recommends](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
using self-hosted runners only with private repositories, because a pull
request from a fork can run arbitrary code on your machine. Ephemeral pods
shrink that risk without removing it. A job still runs on your network, next
to whatever else is on your network. For public repositories the hosted
runners are free and isolated, which is why this site's CI still runs on
them and will keep doing so.

And the price could move again in either direction. In December 2025 GitHub
announced a $0.002-per-minute platform charge on self-hosted runner minutes
in private repositories, starting in March, and then [postponed
it](https://www.theregister.com/2025/12/17/github_charge_dev_own_hardware/)
within days after the response it got. As far as I can tell it has no new
date. If it comes back, owning the hardware still beats renting it at a
third of the hosted rate, but it means GitHub has noticed the same thing I
have and would like a cut of the minutes it doesn't run.

## Where I land

I might be wrong about how fast this matters. My own agent work runs mostly
against public repositories, where the meter reads zero, and the arithmetic
above is a model rather than an invoice. It is entirely possible that GitHub
reprices again, or that agent harnesses get smarter about running only the
tests a change touches, and the volume problem fades before most teams feel
it.

But I do not think per-minute billing survives contact with fleets of agents
in its current form. Within two years I expect either flat-rate or
concurrency-priced plans for CI from at least one of the large forges, or
self-hosted runners becoming the default for any team that lets agents push.
Until then, if there are idle cores in your office or a cluster you already
run, put two charts on it, set `minRunners` to zero and `maxRunners` to
something you can afford to lose, and let the agents push as often as they
like.

The thing I keep turning over is that every pricing model encodes a guess
about who the customer is. CI minutes were priced for humans, and the humans
are increasingly not the ones pushing.

---

The load-bearing sources: GitHub's [Actions runner pricing
reference](https://docs.github.com/en/billing/reference/actions-runner-pricing),
the [actions-runner-controller
repository](https://github.com/actions/actions-runner-controller) and its
[0.15.0 release
notes](https://github.blog/changelog/2026-10-01-actions-runner-controller-release-0-15-0/),
GitHub's [security hardening
guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
on self-hosted runners and forks, and [The Register's
report](https://www.theregister.com/2025/12/17/github_charge_dev_own_hardware/)
on the postponed self-hosted charge.