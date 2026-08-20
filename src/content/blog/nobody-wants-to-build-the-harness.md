---
title: 'Everyone wants autonomous agents. Nobody wants to build the harness.'
description: 'Big tech is racing to take humans out of the loop. The teams getting real gains invested in evals, verification, and token discipline first.'
pubDate: 2026-08-19
tags: ['agents', 'harnesses', 'productivity']
---

glean has run unattended every morning for months. Not because the model in
the middle is smart, but because everything around it refuses to trust it:
schema checks on every extraction, [a reducer that decides which source to
believe](/writing/agentic-graph-engineering/), retries with the failure
pasted back into context, and a rule that anything malformed gets dropped
instead of delivered. The model is maybe a fifth of that codebase. The other
four fifths is the reason I can sleep while it runs.

I bring this up because the same shape, scaled up enormously, is now the
loudest story in big tech. Pichai says [75% of new code at Google is
AI-generated](https://www.fastcompany.com/91531519/google-ceo-says-75-of-the-companys-code-is-ai-generated)
and engineer-approved. Nadella put Microsoft at [20 to
30%](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)
a year earlier. Anthropic says [over 80% of code merged into its own
codebase](https://venturebeat.com/technology/anthropic-says-80-of-its-new-production-code-is-now-authored-by-claude-how-your-enterprise-can-keep-up)
is authored by Claude Code. In February OpenAI published a post literally
titled ["Harness
engineering"](https://openai.com/index/harness-engineering/), about a team of
three growing to seven that shipped roughly a million lines of production
code in five months without writing it by hand. There's a word now for the
layer that makes this possible. The harness: everything around the model
that isn't the model. Tools, sandbox, context management, the loop,
verification. Goldman Sachs is [running fleets of
Devin](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html)
next to its 12,000 developers. Job boards grew a new title, agent
infrastructure engineer, more or less overnight.

I believe most of this. The wave is real and I'd bet on it continuing. What
I don't believe is the way most teams are riding it, which is to treat "no
human in the loop" as the goal itself, reach for it first, and skip the
systems that make it survivable. Autonomy is coming out of the budget as a
headline. The harness is supposed to come out of somebody's spare time.

## What the measurements keep saying

Hold the executive claims next to the independent numbers and the gap is
almost comical. Pichai's own pairing is the cleanest example: 75% of code
AI-generated, but the productivity claim he attaches to it is [about a 10%
increase in engineering
capacity](https://www.aol.com/sundar-pichai-says-ai-making-141602216.html).
A [Stanford study of roughly 100,000
developers](https://proxify.io/articles/stanford-study-of-100000-developers-on-engineering-productivity)
found AI lifts code volume 30 to 40% but rework eats most of it: net gains
around 15 to 20%, falling to 5 to 10% on complex legacy work. [METR's
randomized
trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
is still the most uncomfortable datapoint anyone has produced: experienced
open-source developers using early-2025 tools were 19% slower on real tasks
in their own repos, while estimating afterward that AI had made them 20%
faster. Sixteen developers, so hold it loosely, but nobody has produced a
rigorous result pointing the other way.

The system-level data says the bottleneck just moved. [DORA
2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
found AI adoption now correlates with higher throughput and with worse
delivery stability, at the same time. [Faros
telemetry](https://www.faros.ai/blog/ai-software-engineering) across 10,000+
developers: high-AI teams merged 98% more PRs, but review time went up 91%,
PR size went up 154%, 31% of PRs merged with no review at all, and org-level
DORA metrics didn't improve. More code went in one end; the organization
didn't ship meaningfully better software out the other.

And the reliability numbers explain why the demo doesn't transfer.
[tau-bench](https://arxiv.org/pdf/2406.12045) found a GPT-4o agent passing a
retail task 61% of the time in one run, but under 25% when required to
succeed eight times in a row. CMU's
[TheAgentCompany](https://mlq.ai/news/carnegie-mellon-study-finds-ai-agents-fail-at-office-tasks-nearly-70-of-the-time/)
gave agents realistic office tasks; the best completed about 30%, and one
faked completion by renaming a user to pretend the right colleague had been
contacted. A demo is pass@1. Production is pass^8. Almost every agentic
pilot I read about is evaluated at pass@1 and deployed as if that were the
same number.

The corporate scoreboard looks exactly like you'd predict from the above.
[S&P Global found 42% of
companies](https://www.ciodive.com/news/AI-project-fail-data-SPGlobal/742590/)
abandoned most of their AI initiatives in 2025, up from 17% the year before.
[Gartner expects over 40% of agentic AI projects
cancelled](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
by the end of 2027 and coined "agent washing" for the vendor side. MIT's
viral 95%-of-pilots-show-no-return number has soft methodology, and I'd
still bet the direction is right, because it agrees with everything
measured more carefully.

My favorite failure, because it's so legible, is [the Replit agent that
deleted a production
database](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure)
during an explicit code freeze, then fabricated about 4,000 fake user
profiles and misreported what it had done. The model misbehaved, sure. But
the actual failure is that the system offered a destructive path with no
gate on it. That's not a model problem. That's a harness problem, and it was
entirely foreseeable.

## The part nobody budgets for

Here's what makes the underinvestment so strange: the evidence that the
harness is where the performance lives keeps getting stronger. Recent
benchmark work measuring the same model across different harnesses found
[accuracy gaps up to roughly 6x](https://arxiv.org/pdf/2606.25447). Same
weights, same prompts available, six times the outcome difference from the
scaffolding. Cursor now says it [re-tunes its harness for every new frontier
model](https://cursor.com/blog/continually-improving-agent-harness). When
Anthropic built its multi-agent research system, the [published
finding](https://simonwillison.net/2025/Jun/14/multi-agent-research-system/)
was that token usage alone explained 80% of performance variance. The model
matters. The stuff around it matters comparably, and it's the part you
actually control.

What the deployments that work have in common is boring, which I suspect is
the problem. OpenAI's harness-engineering post is mostly about repository
structure, CI, and lint rules: giving the agent ground truth to bang
against. That's the [generator-verifier
gap](https://www.emergentmind.com/topics/generation-verification-gap-gv-gap)
in practice. An agent with a compiler, a test suite, and a linter can check
its own work and self-correct; an agent with none of those just generates
confidently into the void, and self-critique without ground truth amplifies
confidence rather than correctness.

Evals are the other half, and they're the thing teams skip most reliably.
Public benchmarks won't save you: the ["SWE-Bench
Illusion"](https://arxiv.org/abs/2506.12286) paper found models locating
buggy files at 76% on benchmark repos and 53% on unseen ones, which is the
polite way of saying the score was partly memorized. [Hamel Husain's
line](https://hamel.dev/blog/posts/evals-faq/) is the one I'd staple to the
wall: the bottleneck isn't eval tooling, it's the signal, meaning somebody
senior sitting down with real transcripts and deciding what good looks like
on your task distribution. Nobody wants that job. It's slow, it doesn't
demo, and it's the single highest-leverage thing on the roadmap.

The strongest counterexample to the failure statistics makes the same
point from the other direction. The biggest verified agentic win on record
is still [Amazon Q migrating tens of thousands of internal Java
apps](https://press.aboutamazon.com/2024/12/new-amazon-q-developer-capabilities-accelerate-large-scale-transformations-of-legacy-workloads),
which Amazon values at 4,500 developer-years and $260M a year. Look at what
it actually was: one narrow, verifiable task, drowning in ground truth
(does it compile, do the tests pass), with humans approving the output. The
least glamorous autonomous system imaginable, and the most valuable.

## The token bill arrives either way

Skipping the harness doesn't even save money, because an unharnessed agent
is expensive in direct proportion to how lost it is. The loop re-sends
accumulated context on every step, so cost compounds with trajectory
length; a wandering agent pays quadratically for its own confusion. The
whole industry repriced around this in one twelve-month stretch: [Cursor's
June 2025 move away from unlimited
plans](https://cursor.com/blog/june-2025-pricing) and the refunds that
followed, [Anthropic's weekly rate
limits](https://techcrunch.com/2025/07/28/anthropic-unveils-new-rate-limits-to-curb-claude-code-power-users/)
for people running Claude Code around the clock, Replit's shift to
effort-based pricing with users reporting weekly bills bigger than their
old monthly ones. The [FinOps Foundation's 2026
survey](https://www.linuxfoundation.org/press/state-of-finops-survey-ai-value-and-skills-top-priorities-as-finops-matures-across-technology-value-98-manage-ai-90-saas-64-licensing-48-data-center-1)
found 73% of organizations exceeded their AI cost projections, with average
enterprise AI budgets going from $1.2M to $7M in two years.

The teams that keep budgets sane use the same tools that improve quality,
which shouldn't be surprising because they're the same discipline.
[Cost-of-pass](https://arxiv.org/pdf/2504.13359) is the metric that
matters: dollars per correct outcome, not per token. Routing easy steps to
cheap models [cuts cost by 85% while keeping 95% of
quality](https://www.pondhouse-data.com/blog/saving-costs-with-llm-routing)
in the published results. Cache reads are a tenth the price of fresh input
tokens. None of this is exotic. It's metering, routing, and caching, the
same unglamorous work every other production system needed. Half the reason
agent-gpu exists is that sending every request to the biggest model is a
money fire even at homelab scale; at big-tech scale the fire just has more
zeroes.

## Where I think this lands

The prediction I'm willing to commit to: within two years, the companies
showing measurable agent impact will be the ones where "no human in the
loop" is a per-task earned status, granted when the evals clear a bar and
the cost-of-pass math closes, and revoked when they don't. Autonomy as an
output of the system, not a setting on it. The teams that configured
autonomy first are the raw material for Gartner's cancellation statistic,
and the rehiring wave that follows every walked-back AI-first memo suggests
the correction is already running.

The part I'm genuinely unsure about is how much of the scaffolding
survives the models getting better. METR's own data has agent task horizons
doubling every several months, and it's possible a chunk of today's harness
engineering is a temporary crutch. I've gone back and forth on this while
writing. Where I land, for now: verification and evals aren't crutches,
they're how you know anything about a stochastic system at all, and I can't
see a capability level that makes wanting to know obsolete. The loop I'd
build today looks a lot like the one running glean: small, checkable,
distrustful, and cheap. It just does more than it did last year.

---

The load-bearing sources: [METR's developer
RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/),
the [DORA 2025
report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report),
OpenAI's ["Harness engineering"](https://openai.com/index/harness-engineering/),
[tau-bench](https://arxiv.org/pdf/2406.12045), and Anthropic's [context
engineering
guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
