---
title: 'Your agent graph is a claim about what you understand'
description: 'Loops are forgiving and graphs are not. Notes on when an agent system actually earns the complexity of explicit structure.'
pubDate: 2026-07-31
updatedDate: 2026-08-19
tags: ['agents', 'architecture', 'graphs']
---

There's a recurring argument in agent design about whether to orchestrate
with a loop or a graph, and most of it talks past the actual trade.

A loop is forgiving. Prompt, act, observe, repeat, with a stop condition. You
can start one before you understand the problem, and the agent absorbs the
parts you didn't model. A graph won't let you do that. Declaring nodes and
edges means stating, up front, what the units of work are and how they depend
on each other. If you don't know yet, the graph is where that ignorance
becomes visible.

That's the trade. A graph is a claim about what you already understand, and
if the claim is wrong you've bought yourself a distributed-systems problem
you didn't previously have.

## Two graphs, not one

The framing that helped me most is that there are really two graphs, and
conflating them is why "should I use a graph?" is such a muddled question.

The **org graph** is stable. Long-lived agents with named roles, persistent
context, fixed dependencies. It answers who owns what. A researcher agent
that handles a thousand different research tasks over a year is one node in
the org graph, accumulating domain context the whole time.

The **work graph** is disposable: task nodes spawned for one request, edges
that split and merge as the shape of the work becomes clear, then the whole
thing expires.

Most of the over-engineered agent systems I've seen had a rigid work graph.
The chaotic ones tend to have no org graph at all, so every request
re-derives who should be doing what, from scratch, in a prompt.

## Where this bites in practice

I don't want to argue this abstractly, so: two of my own projects, one of
each kind.

[glean](https://github.com/jaypetez/glean) pulls signal from RSS, scraping,
search, and APIs, runs it through an LLM, and delivers on a schedule. That's
a pipeline (fetch, process, deliver), and a pipeline is a graph you don't
have to call a graph. Linear, one path, nothing to orchestrate.

Except the fan-in. Four sources produce overlapping, sometimes contradictory
claims about the same event, arriving at different times and at different
levels of trustworthiness. The moment you have concurrent writers to one
piece of state, you need a **reducer**: an explicit policy for how updates
combine.

```python
def merge_findings(existing: list[Finding], incoming: list[Finding]) -> list[Finding]:
    """Fan-in from four sources. Dedupe on claim, keep the best-sourced version."""
    by_claim: dict[str, Finding] = {f.claim_id: f for f in existing}

    for finding in incoming:
        current = by_claim.get(finding.claim_id)
        if current is None or finding.source_rank < current.source_rank:
            by_claim[finding.claim_id] = finding
        elif finding.source_rank == current.source_rank:
            # Same tier disagreeing is a signal, not noise. Keep both and flag it.
            current.conflicts.append(finding)

    return list(by_claim.values())
```

If you don't write that function, you still have a merge policy. It's
last-write-wins, chosen by accident, and it means the order your HTTP
responses arrive in quietly decides what you believe. That, more than any
diagram, is what graph vocabulary buys you: "reducer" named a decision glean
was already making, badly, without me noticing.

[agent-gpu](https://github.com/jaypetez/agent-gpu) is the other shape. It
routes inference across remote GPU-backed Ollama nodes. The org graph is the
fleet: stable, known, each box with its own capabilities and memory ceiling.
The work graph is per-request routing across it. The failure mode the graph
literature warns about is entirely real there. A node going down doesn't just
fail its own work, it starves everything downstream that was waiting on that
result, so edges need failure policy (retry, fall back, escalate, abort)
decided per edge, not globally.

## The case against, which is stronger than it looks

Every layer of orchestration structure is a place bugs hide and a cost users
pay in latency and token spend. And the best evidence for the loop camp is
sitting in your terminal: coding agents like Claude Code and Codex CLI handle
a genuinely enormous share of real engineering work with prompt, act,
observe, repeat, good tool access, and a verification step. No DAG, no
supervisor, no replanner. If graphs were required for hard multi-step work,
that wouldn't be true.

Graphs also make debugging worse before they make it better. A loop that
misbehaves has one transcript. A graph that misbehaves has a state object
mutated by several nodes across several turns, and the bug is frequently a
missing edge: context that never flowed to a node that needed it, producing
an output that's wrong in a way that looks plausible.

## The signals I actually trust

The test I've settled on isn't "is this complicated?", since complicated
tasks are what loops are for. It's whether any of these hold:

- Parallelism across specialisations. Not parallel work, parallel
  expertise, where each branch needs different context loaded.
- State that outlives the session, which drags in checkpointing to a store
  and resume semantics whether you wanted them or not.
- A hard constraint that must actually hold, enforced in routing code
  instead of asked for in a prompt.
- A verifier that differs per branch. One loop has one definition of done.

I'm honestly not certain the last one belongs; with enough prompt discipline
you can fake per-branch verifiers inside a single loop, and I've done it. The
other three I'd defend.

The third is the one I'd underline. There's a real difference between
`if state["risk_level"] == "high": return "human_review"` and a system prompt
politely requesting escalation on risky actions. The first is enforced. The
second is a suggestion to a probabilistic system, and someday you'll find out
the difference.

## If you've decided you need one

The mechanics worth getting right, in rough order of how often I've seen
them skipped:

- Type the shared state; it's the interface between nodes. Untyped, every
  node defensively receives the whole transcript and you've rebuilt one big
  prompt with extra steps.
- Write reducers for anything two nodes can touch (see above).
- Hard constraints go in the routing function, never in a prompt.
- Checkpoint if the work can be interrupted, needs human approval, or runs
  long enough to fail halfway.
- Make side effects before an interrupt idempotent, because resume replays,
  and a non-idempotent send-email node will send twice.
- Not every node should be an agent. Known business rules stay deterministic
  functions; the cheapest way to make a graph tractable is to have fewer of
  its nodes be stochastic.

## Build the loop first

A graph is a hypothesis about the structure of the work. Writing it down is
valuable precisely because it can be wrong in a way a loop never can be. A
loop absorbs the mismatch and produces something mediocre. A graph with wrong
edges fails visibly, which is annoying, and useful.

So build the loop first. Let it run against real work until it fails in a way
that has a shape. Then draw the graph you learned.

---

Further reading: the [graphs-versus-loops
debate](https://explainx.ai/blog/graphs-vs-loops-agentic-ai-debate-linear-andrew-ng-2026),
[graph engineering for multi-agent
organisations](https://www.explainx.ai/blog/graph-engineering-ai-agents-multi-agent-organizations-2026),
and [LangGraph's concrete
mechanics](https://www.analyticsvidhya.com/blog/2026/07/graph-engineering/)
for state, reducers, and checkpointing.
