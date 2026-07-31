---
title: 'Your agent graph is a claim about what you understand'
description: 'Graphs make agent topology explicit — which is the whole point and the whole cost. On when a graph actually earns its complexity.'
pubDate: 2026-07-31
tags: ['agents', 'architecture', 'graphs']
---

There's a recurring argument in agent design about whether to orchestrate with a
loop or a graph, and most of it misses what's actually being traded.

A loop is forgiving. Prompt, act, observe, repeat, with a stop condition. You can
start one before you understand the problem, and the agent absorbs the parts you
didn't model. A graph won't let you do that. Declaring nodes and edges means
stating, up front, what the units of work are and how they depend on each other —
and if you don't know yet, the graph is where that ignorance becomes visible.

That's the whole trade. Not "structure good, loops naive." A graph is a claim
about what you already understand, and making a claim you can't support is how
you buy a distributed-systems problem you didn't previously have.

## Two graphs, not one

The framing that helped me most is that there are really two graphs, and
conflating them is why "should I use a graph?" is such a muddled question.

The **org graph** is stable. Long-lived agents with named roles, persistent
context, fixed dependencies. It answers *who owns what*. A researcher agent that
handles a thousand different research tasks over a year is one node in the org
graph, accumulating domain context the whole time.

The **work graph** is disposable. Task nodes spawned for one request, edges that
split and merge as the shape of the work becomes clear, then the whole thing
expires. It answers *what needs doing right now*.

Most systems that feel over-engineered have a rigid work graph. Most systems that
feel chaotic have no org graph at all — every request re-derives who should be
doing what, from scratch, in a prompt.

## Where this bites in practice

I don't want to argue this abstractly, so: two of my own projects, one of each kind.

[glean](https://github.com/jaypetez/glean) pulls signal from RSS, scraping,
search, and APIs, runs it through an LLM, and delivers on a schedule. That's a
pipeline — fetch, process, deliver — and a pipeline is a graph you don't have to
call a graph. Linear, one path, nothing to orchestrate.

Except the fan-in. Four sources produce overlapping, sometimes contradictory
claims about the same event, arriving at different times and at different levels
of trustworthiness. The moment you have concurrent writers to one piece of state,
you need a **reducer**: an explicit policy for how updates combine.

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

You either write that function or you don't. If you don't, you still have a merge
policy — it's last-write-wins, chosen by accident, and it means the ordering of
your HTTP responses silently decides what you believe. *That's* the reason to
reach for graph vocabulary here: not to draw a diagram, but because "reducer" names
a decision that was already being made badly.

[agent-gpu](https://github.com/jaypetez/agent-gpu) is the other shape. It routes
inference across remote GPU-backed Ollama nodes. The org graph is the fleet —
stable, known, each box with its own capabilities and memory ceiling. The work
graph is per-request routing across it. And the failure mode the graph literature
warns about is entirely real there: a node going down doesn't just fail its own
work, it starves everything downstream that was waiting on that result. Edges
need failure policy — retry, fall back, escalate, abort — decided per edge, not
globally.

## The case against, which is stronger than it looks

> Every layer of orchestration structure is a place bugs hide and a cost users pay
> in latency and token spend.

The best evidence for the loop camp is sitting in your terminal. Coding agents
like Claude Code and Codex CLI handle a genuinely enormous share of real
engineering work with prompt → act → observe → repeat, good tool access, and a
verification step. No DAG. No supervisor. No replanner. If graphs were required
for hard multi-step work, that wouldn't be true.

Graphs also make debugging worse before they make it better. A loop that misbehaves
has one transcript. A graph that misbehaves has a state object mutated by several
nodes across several turns, and the bug is frequently a *missing edge* — context
that never flowed to a node that needed it, producing an output that's wrong in a
way that looks plausible.

## The signals that actually justify one

Here's the test I've settled on. Not "is this complicated?" — complicated tasks are
what loops are for. It's whether any of these are true:

| Signal | Why a loop can't do it |
| --- | --- |
| Parallelism across **specialisations** | Not parallel work — parallel *expertise*, where each branch needs different context |
| State that outlives the session | Requires checkpointing to a store, and resume semantics |
| A hard constraint that must hold | Enforced in routing code, not asked for in a prompt |
| A verifier that differs per branch | One loop has one definition of done |

If it's one job with one verifier, it's a loop. Say so and move on.

That third row is the one I'd underline. There's a real difference between
`if state["risk_level"] == "high": return "human_review"` and a system prompt
politely requesting escalation on risky actions. One is a guarantee. The other is
a strong suggestion to a probabilistic system, and you will eventually find out
which.

## If you've decided you need one

The mechanics worth getting right, in rough order of how often I've seen them
skipped:

- **Type the shared state.** It's the interface between nodes. Untyped, every node
  defensively receives the whole transcript and you've rebuilt one big prompt with
  extra steps.
- **Write reducers for anything two nodes can touch.** See above.
- **Put hard constraints in the routing function**, never in a prompt.
- **Checkpoint** if the work can be interrupted, needs human approval, or runs long
  enough to fail halfway.
- **Make side effects before an interrupt idempotent.** Resume replays; a
  non-idempotent send-email node will send twice.
- **Not every node should be an agent.** Known business rules stay deterministic
  functions. A node is a bounded unit of work, not necessarily a model call — and
  the cheapest way to make a graph tractable is to have fewer of its nodes be
  stochastic.

## The actual point

A graph is a hypothesis about the structure of the work. Writing it down is
valuable precisely because it can be wrong in a way a loop never can — a loop just
absorbs the mismatch and produces something mediocre, while a graph with wrong
edges fails visibly.

So build the loop first. Let it run against real work until it fails in a way that
has a shape. Then draw the graph you learned, and not before.

---

Further reading: the [graphs-versus-loops
debate](https://explainx.ai/blog/graphs-vs-loops-agentic-ai-debate-linear-andrew-ng-2026),
[graph engineering for multi-agent
organisations](https://www.explainx.ai/blog/graph-engineering-ai-agents-multi-agent-organizations-2026),
and [LangGraph's concrete
mechanics](https://www.analyticsvidhya.com/blog/2026/07/graph-engineering/) for
state, reducers, and checkpointing.
