---
title: "Frontier labs don't have a moat. Their landlords do."
description: 'Open weights sit months behind the frontier at a tenth of the price, yet enterprise spend went the other way. On why the durable moat is infrastructure.'
pubDate: 2026-08-19
tags: ['ai', 'strategy', 'infrastructure', 'open-source']
---

In May 2023 a leaked Google memo declared "we have no moat, and neither does
OpenAI." Three years on, the memo looks right about the models and wrong about
the business — and the gap between those two things is where the next decade of
this industry gets decided.

The models did commoditize. The best open-weights models now trail the closed
frontier by [about four months on Epoch's capability
index](https://epoch.ai/data-insights/open-closed-eci-gap), and the [UK AI
Security Institute measures a 4–7 month
lag](https://www.aisi.gov.uk/blog/how-far-behind-the-frontier-are-leading-open-weight-models-on-cyber)
on cyber tasks — narrower than a year ago. On [Artificial Analysis's
intelligence-versus-price
chart](https://artificialanalysis.ai/articles/recent-open-weights-model-launches),
nine of the thirteen models on the Pareto frontier are open weights, at
somewhere between a fifth and a thirtieth of frontier API prices. Kimi, GLM,
and DeepSeek are genuinely good, and on developer-facing routers open models
are now a [majority of token
volume](https://openrouter.ai/blog/insights/the-open-weight-models-that-matter-june-2026/).

And yet the commoditization thesis predicted price collapse and lab implosion,
and instead 2026 delivered Anthropic at a $65B revenue run rate, OpenAI above
$40B, and both heading toward IPOs. Something in the "no moat" story doesn't
add up, and I don't think it's the benchmarks.

## The paradox that explains everything

Here's the datapoint I keep coming back to. While open-weights models were
closing the capability gap and Chinese open models were peaking at [46% of
tokens routed through
OpenRouter](https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html),
[Menlo Ventures' enterprise
survey](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)
found open-weights' share of enterprise LLM API spend *falling*, from 19% to
11%. Chinese open models — the ones actually at the frontier of open weights —
sit at roughly 1% of enterprise usage.

Capability went up and to the right; enterprise adoption went the other way.
That only looks like a paradox if you believe enterprises buy benchmarks. They
don't. They buy things a benchmark never measures: FedRAMP authorization, zero
data retention they can enforce with a policy rather than trust in a blog
post, a vendor who published a safety framework before shipping, someone to
sue, and — above all — a procurement path that doesn't require onboarding a
new counterparty. A model that scores three points lower but arrives through
an already-negotiated contract wins almost every time.

## Multi-model isn't a prediction anymore

The second thing the data settles: the single-vendor future is already dead.
[a16z's CIO survey](https://a16z.com/leaders-gainers-and-unexpected-winners-in-the-enterprise-ai-arms-race/)
has 81% of large enterprises running three or more model families, 37% running
five or more, with "different models are better at different things" as the
stated reason. Spend share is whiplashing — OpenAI went from 50% of enterprise
API spend in 2023 to 27%, Anthropic from 12% to 40% — and a market where the
leader changes that fast is structurally a portfolio market, because every CIO
who lived through one swing now architects for the next one.

The tells are everywhere. Microsoft, holder of a ~$13B OpenAI stake, [added
Claude to Microsoft 365
Copilot](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/24/expanding-model-choice-in-microsoft-365-copilot/).
Perplexity runs GPT, Claude, and Gemini in parallel and synthesizes. Every
serious coding tool ships a model picker. And this August, Stripe agreed to
pay over $7B for OpenRouter — a company whose entire product is *making models
interchangeable*. When a payments giant pays seven billion dollars for the
switching layer, the market has told you what it thinks the durable position
is, and it isn't any particular model.

## Follow the revenue through the datacenter

So if capability depreciates in months and customers hold portfolios, where
does defensibility actually live? Follow how the money physically moves.

By [SemiAnalysis's
numbers](https://newsletter.semianalysis.com/p/anthropic-growth-and-bedrock-mix),
over 40% of Anthropic's revenue now arrives through Bedrock, Foundry, and
Vertex — the hyperscaler shelves — and that share is rising. The reasons are
mundane, which is exactly why they're durable:

| What the enterprise needs | Who provides it |
| --- | --- |
| FedRAMP High / IL5 authorization | The cloud, not the lab — Claude got there [via Bedrock GovCloud](https://www.anthropic.com/news/claude-in-amazon-bedrock-fedramp-high) |
| Enforceable zero data retention | [Service control policies on Bedrock](https://aws.amazon.com/blogs/security/enforce-zero-data-retention-on-amazon-bedrock-with-bedrock-projects-and-service-control-policies/), Azure's approval-gated ZDR |
| EU data residency post-AI Act | Sovereign clouds — AWS just stood up a [€7.8B EU-only region](https://tech-insider.org/bedrock-vs-azure-ai-foundry-vs-vertex-ai-2026/) |
| Procurement without a new vendor | Model spend draws down existing EDP/MACC commitments |

That last row is the quiet killer. When Bedrock usage counts against a
committed-spend agreement the company signed two years ago, buying a frontier
model requires no security review, no new master services agreement, no
budget line. The hyperscaler already won the trust negotiation; the model just
rides it. And with EU AI Act enforcement — real fines — [live as of this
month](https://www.dlapiper.com/en-us/insights/publications/2025/08/latest-wave-of-obligations-under-the-eu-ai-act-take-effect),
the value of buying models inside a compliance-managed platform only goes up.

The labs know this, which is why the deal flow of the last twelve months looks
the way it does: OpenAI committing $250B to Azure while diversifying into
Oracle, CoreWeave, and AWS; Anthropic deliberately tri-cloud across Trainium,
TPUs, and Azure; Claude becoming the only frontier model sold on all three
hyperscalers. Every one of those deals trades margin for shelf space and
guaranteed compute. The labs are becoming anchor tenants in someone else's
mall — extraordinary tenants, but tenants.

## What's actually left for the labs

I don't think the labs are doomed — $65B run rates are not a rounding error —
but I think their durable assets are narrower than their valuations imply:

- **Locked-in compute.** Demand for training compute exceeds what the grid can
  add by an order of magnitude; whoever pre-bought gigawatts owns a real,
  physical moat for a few years. But it's a moat made of other people's
  datacenters, and it expires.
- **The agentic workload.** Claude Code owning half the AI-coding market shows
  a lab can own a *workflow* rather than a model. Workflows have switching
  costs; raw completions don't. This is the strongest lab-native moat going —
  and MCP going cross-vendor shows how fast even that layer gets standardized.
- **Post-training know-how.** RL environments and reward design don't leak in
  a weights file. Real, but it's a six-month head start renewed by burning
  billions, not a wall.

Each of those is a rent that decays. The hyperscaler position — compliance
certifications, sovereign regions, enterprise contracts, the power hookups
themselves — compounds instead.

## Where I land

The future is multi-model: portfolios of frontier and open-weights models,
routed by task, bought overwhelmingly through the two or three clouds an
enterprise already trusts. Frontier labs keep a franchise by being on every
shelf and owning the workflows that sit above the model — not by the model
itself, whose lead is now a reliably four-month-wide, rapidly refilling ditch.
The open-weights labs win developers and lose procurement. And the durable
moat — the one that will still be collecting tolls in 2035 — belongs to
whoever guarantees an auditor, a regulator, and a CISO a quiet night: mostly
the hyperscalers, cutting decade-long deals with everyone on both sides of
the open/closed divide.

The model is the SKU. The cloud is the store. Stores outlive products.

---

Further reading: [Epoch AI on the open–closed
gap](https://epoch.ai/data-insights/open-closed-eci-gap), [Menlo Ventures'
State of Generative AI in the
Enterprise](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/),
[a16z's enterprise AI survey](https://a16z.com/leaders-gainers-and-unexpected-winners-in-the-enterprise-ai-arms-race/),
and [SemiAnalysis on Anthropic's channel
mix](https://newsletter.semianalysis.com/p/anthropic-growth-and-bedrock-mix).
