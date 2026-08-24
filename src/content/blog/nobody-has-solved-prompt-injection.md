---
title: 'Nobody has solved prompt injection. Stop shipping agents that need it solved.'
description: 'The attacks got real this year. The defenses that hold up subtract capabilities instead of stacking classifiers, and almost no product wants to subtract.'
pubDate: 2026-08-23
tags: ['agents', 'security', 'harnesses']
---

Every morning [glean](https://github.com/jaypetez/glean) feeds a language
model a few hundred documents written by strangers: RSS entries, scraped
pages, search snippets. Statistically, some of that text has contained
"ignore your previous instructions" by now, and I have no idea whether the
model obeyed, because I've never had a reason to check. There's nothing
secret in its context to steal, and the only place its output can go is a
schema check and then a feed that I read. If an attacker fully hijacks the
model, what they win is the ability to put one weird summary in front of me
at breakfast.

That's not because I did anything clever. It's because glean accidentally
has the shape that [Simon Willison named the lethal
trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), minus
two of the three legs. An agent becomes a data-theft machine when it
combines access to private data, exposure to untrusted content, and a way to
communicate out. glean has exactly one leg: the untrusted content. Remove
any leg and the attack has nowhere to go.

The same Raspberry Pi runs Claude Code with my GitHub credentials and an
open network, which is all three legs at once, and the difference in how I
treat the two systems is the subject of this post. Because a year of real
incidents has convinced me of something the vendors mostly won't say
directly: prompt injection is not getting solved at the model layer, and
every defense that has actually held up is an exercise in removing
capabilities rather than detecting attacks.

## The year the attacks stopped being hypothetical

For a long time the standard rebuttal was that prompt injection was a
conference-talk threat with no bodies. That rebuttal is gone.

[EchoLeak](https://arxiv.org/abs/2509.10540) (CVE-2025-32711, June 2025) was
the first zero-click exploit against a production LLM system: one crafted
email, no user interaction, and Microsoft 365 Copilot would pull internal
files into context and exfiltrate them to an attacker's server. The chain is
worth reading because of what it walked through on the way out: Microsoft's
XPIA prompt-injection classifier, link redaction, and a content security
policy, each bypassed in turn. All three trifecta legs were present, so the
attacker only needed patience.

In January 2026, [RyotaK of GMO Flatt Security
reported](https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/)
that Anthropic's Claude Code GitHub Action would trust any account whose
name ended in `[bot]`, no permission check. Combine that with instructions
hidden in a public GitHub issue that the action picks up for triage, and an
unauthenticated attacker could read the workflow's environment variables out
of the runner and escalate toward pushing code into repositories that
consume the action. Anthropic fixed the bypass in four days and paid a
$4,800 bounty. The part that stays with me is the entry point: opening an
issue. That's the whole attack surface a public repo hands to the planet.

In March, [Oasis Security published "Claudy
Day"](https://www.oasis.security/blog/claude-ai-prompt-injection-data-exfiltration-vulnerability):
invisible HTML in a `claude.ai/new?q=` link, so the pre-filled prompt the
user sees isn't the prompt the model gets, chained with the Files API as an
exfiltration channel for conversation history, from a default out-of-the-box
session. Reported responsibly, injection vector patched. Same week, [two
backdoored LiteLLM wheels landed on
PyPI](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/)
after the TeamPCP crew stole a maintainer's credentials by first
compromising Trivy, the security scanner in LiteLLM's own CI. The payload
harvested credentials, tried to spawn privileged Kubernetes pods, and
installed a systemd backdoor. That one isn't prompt injection at all, and I
include it deliberately: an LLM gateway is a box that holds every model API
key an organization owns, which means agent plumbing is now
high-value infrastructure, and it's being attacked like it.

If you want the aggregate picture instead of anecdotes, [OWASP's State of
Agentic AI Security and
Governance](https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/)
maps prompt injection into six of the ten categories in its agentic Top 10,
and its advisory counts put popular agent frameworks among the most-patched
software anywhere: 57 security advisories for n8n, 22 for Claude Code.

## Why the model won't be the fix

The root cause hasn't moved in four years: a language model receives the
system prompt, the user's request, and whatever text came back from a tool
as one undifferentiated stream of tokens. Instructions and data share a
channel. Everything else is consequences.

The industry's favorite response is a classifier in front of the model, and
the numbers those products advertise are the tell. Willison's [line about
guardrail vendors](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
is the right frame: they claim to catch 95% of attacks, and in application
security 95% is a failing grade. We don't accept SQL injection defenses
that work most of the time, because the attacker gets unlimited retries
against a static target and only needs one success. EchoLeak is the
existence proof: it went through a classifier built by Microsoft
specifically to stop cross-prompt injection. And the academic result that
should end the argument, from the ["attacker moves second"
work](https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/),
is that adaptive attacks reliably defeat published defenses once the
attacker gets to see them. A probabilistic filter in front of a
deterministic vulnerability is a speed bump with a marketing budget.

I want to be careful not to overclaim here. Models have gotten measurably
more resistant to the naive attacks, and the labs run serious red teams.
But resistance is a rate, and the trifecta only needs the rate to be
nonzero.

## The defenses that work are subtractions

Look at what has actually held up and a pattern emerges: none of it detects
attacks. All of it removes a capability so the attack has no route, and
then lets the model be as gullible as it wants inside the fence.

The cleanest formulation is [Meta's Agents Rule of
Two](https://ai.meta.com/blog/practical-ai-agent-security/): an agent gets
at most two of untrusted input, sensitive data, and the ability to change
state or communicate out. Want the third? A human enters the loop.
It's the trifecta turned from a diagnosis into a design rule, and it's
checkable at design time from nothing more than the agent's tool list. When
I evaluate an MCP server now, that's the entire first pass: which legs does
this add, and to an agent that already has which others.

glean is what the rule looks like when you're lucky enough to afford it
fully. One leg, no policy engine, no classifier, nothing to tune, and the
[whole distrustful harness around
it](/writing/nobody-wants-to-build-the-harness/) gets to worry about
quality instead of theft.

When the task genuinely needs all three legs, the serious answer so far is
[CaMeL, from
DeepMind](https://arxiv.org/pdf/2503.18813): a privileged model plans the
task from the trusted request and never sees untrusted data; a quarantined
model reads the untrusted data and never gets tools; a custom interpreter
runs the plan while tracking which values came from where and checking a
policy before every tool call. On the AgentDojo benchmark it [eliminates
nearly all injection
attacks](https://simonwillison.net/2025/Apr/11/camel/) while keeping most
task performance. The catch is honest and large: somebody has to write the
policies, and if the policy prompts a human too often, the human starts
approving on autopilot and you've rebuilt the vulnerability out of meat.

And for coding agents there's the blunt version: a kernel-enforced fence.
[Anthropic's sandbox for Claude
Code](https://www.anthropic.com/engineering/claude-code-sandboxing) is
filesystem isolation plus network isolation, both required, because either
one alone leaves an exfiltration path. Inside the fence the agent runs
free, which is why it cut permission prompts by 84% in their internal use
while making injection strictly less profitable. Notice what the sandbox
doesn't do: it makes no attempt to figure out whether the agent has been
injected. The kernel doesn't care what the model believes.

This is the same argument as [the harness
post](/writing/nobody-wants-to-build-the-harness/), wearing a different
hat. The security layer is more harness: unglamorous, mostly subtractive,
absent from the demo, and the difference between an agent you can expose
to the internet and one you can't. It gets skipped for the same budget
reasons, except the failure mode isn't a bad PR merged, it's your
conversation history in someone else's files bucket.

## Where I land

The prediction: within a couple of years, "which leg is missing" becomes a
standard design-review question for agents, the way "where does user input
cross a trust boundary" became one for web apps, and the tooling follows,
computing an agent's trifecta exposure straight from its tool manifest.
Products that insist on all three legs at once will either adopt
CaMeL-shaped interpreters or keep a human gate on the outbound path, and
the ones that do neither will keep supplying the incident reports.

The part I keep turning over is whether model progress eventually retires
this. Maybe instruction hierarchies and better training push obedience to
injected text down to genuinely rare. I've gone back and forth, and where I
land is that it doesn't change the design math: a rate is not a guarantee,
the attacker adapts to whatever the rate is, and capability subtraction is
the only defense in this space that gives you a property you can state
without a benchmark behind it. I'd rather own a fence than a probability.
The fence also never gets smarter, which is exactly the point.

---

The load-bearing sources: [Willison's lethal
trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), the
[EchoLeak paper](https://arxiv.org/abs/2509.10540), [Flatt Security on
poisoning Claude
Code](https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/),
[Datadog on the LiteLLM
compromise](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/),
the [CaMeL paper](https://arxiv.org/pdf/2503.18813), [Meta's Agents Rule of
Two](https://ai.meta.com/blog/practical-ai-agent-security/), and
[Anthropic on
sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing).
