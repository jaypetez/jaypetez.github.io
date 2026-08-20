---
title: "Frontier labs don't have a moat. Their landlords do."
description: 'Open models are months behind at a tenth of the price, yet enterprise spend went the other way. Why I think the durable moat belongs to the clouds.'
pubDate: 2026-08-19
tags: ['ai', 'strategy', 'infrastructure', 'open-source']
---

Most of the inference I run at home goes through open-weights models. That's
what [agent-gpu](https://github.com/jaypetez/agent-gpu) is for: route requests
across a few GPU boxes running Ollama and stop thinking about API bills. For
bulk work, the tagging and summarization that makes up most of what I actually
automate, open models stopped being a compromise a while ago.

So I'm predisposed to agree when people argue the frontier labs are in
trouble, and the capability data mostly backs them up. [Epoch measures the
best open models about four months behind the closed
frontier](https://epoch.ai/data-insights/open-closed-eci-gap). The [UK AI
Security Institute puts the lag at four to seven
months](https://www.aisi.gov.uk/blog/how-far-behind-the-frontier-are-leading-open-weight-models-on-cyber)
on cyber tasks, narrower than a year ago. On [Artificial Analysis's
intelligence-per-dollar
chart](https://artificialanalysis.ai/articles/recent-open-weights-model-launches),
nine of the thirteen models on the Pareto frontier are open weights, priced at
a fifth to a thirtieth of the frontier APIs. The leaked 2023 Google memo ("we
have no moat, and neither does OpenAI") called all of this three years early.

And yet Anthropic ended July at a $65B revenue run rate, OpenAI is above
$40B, and both are heading toward IPOs. Commodities don't produce numbers
like that. Somewhere the no-moat story has a hole in it.

## The number that doesn't fit

[Menlo Ventures' enterprise
survey](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)
found open models' share of enterprise LLM API spend falling from 19% to 11%
over the same stretch in which they nearly closed the capability gap. Chinese
open models, the ones actually at the open frontier, sit around 1% of
enterprise usage. Meanwhile on OpenRouter, [Chinese open models peaked at 46%
of routed
tokens](https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html).
Developers went one way. Enterprises went the other.

I don't think that's a paradox. I think it's what buying software at a big
company actually looks like, and benchmark charts just don't model it.

Take a bank that wants a model in a customer-facing workflow. The questions
that decide the purchase are: is this FedRAMP authorized, can our auditors
see a zero-data-retention guarantee enforced by policy rather than promised
in a blog post, did the vendor publish a safety framework before shipping,
and who do we sue when it goes wrong. A model that scores three points lower
on some index but clears those questions wins far more often than the
leaderboard says it should.

This is also where the labs quietly lose control of their own distribution,
because the entity that clears those questions is usually not the lab. Claude
got FedRAMP High [through Bedrock on
GovCloud](https://www.anthropic.com/news/claude-in-amazon-bedrock-fedramp-high).
Zero data retention on AWS is enforced with [service control
policies](https://aws.amazon.com/blogs/security/enforce-zero-data-retention-on-amazon-bedrock-with-bedrock-projects-and-service-control-policies/),
an AWS mechanism, not an Anthropic one. EU data residency runs through
sovereign regions like the EU-only cloud AWS stood up in January for €7.8B.
And the purchase itself usually draws down a committed-spend agreement (an
EDP on AWS, a MACC on Azure) that the company negotiated years ago, so adding
a frontier model needs no new vendor onboarding, no new security review, no
new budget line. The cloud already won the trust argument. The model rides
along.

The revenue is starting to show it. By [SemiAnalysis's
numbers](https://newsletter.semianalysis.com/p/anthropic-growth-and-bedrock-mix),
over 40% of Anthropic's revenue now arrives through Bedrock, Foundry, and
Vertex rather than its own front door, and that share is rising. With [EU AI
Act enforcement live as of this
month](https://www.dlapiper.com/en-us/insights/publications/2025/08/latest-wave-of-obligations-under-the-eu-ai-act-take-effect),
real fines included, I'd expect it to keep rising. Compliance is a product.
The clouds are the ones selling it, and every model on the shelf pays rent.

## Multi-model already happened

This half of the argument barely needs making anymore. [a16z's CIO
survey](https://a16z.com/leaders-gainers-and-unexpected-winners-in-the-enterprise-ai-arms-race/)
has 81% of large enterprises running three or more model families, 37%
running five or more. Enterprise spend share whiplashed from OpenAI at 50% in
2023 down to 27% while Anthropic went from 12% to 40%. Microsoft, which owns
roughly $13B of OpenAI, [added Claude to Microsoft 365
Copilot](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/24/expanding-model-choice-in-microsoft-365-copilot/)
anyway. And in August, Stripe agreed to pay over $7B for OpenRouter, a
company whose entire product is making models interchangeable.

You could argue with any one of those facts. Together they describe a market
that has already decided to treat models as a portfolio, routed per task and
swapped when the leaderboard flips. Every CIO who lived through one share
swing now architects for the next one.

## What the labs keep

I'm not writing the labs' obituary; a $65B run rate is not what dying looks
like. They hold three real assets, and they're worth taking one at a time.

Pre-bought compute is the first. Training demand exceeds what the grid can
add by an order of magnitude, so whoever locked in gigawatts early (OpenAI's
$250B Azure commitment plus Oracle and CoreWeave, Anthropic spread across
Trainium, TPUs, and Azure) owns something physical and genuinely scarce. But
notice whose datacenters those are. The moat is leased.

Workflows are the second. Claude Code reportedly holds about half the
AI-coding market, and a workflow has switching costs in a way a completion
endpoint never will. Of the three this is the one I take most seriously, and
also the one I'm least sure about: MCP made tool integrations portable across
vendors in about a year, and I can see agent harnesses commoditizing the same
way. Ask me again in twelve months.

Post-training know-how is the third. RL environments and reward design don't
leak in a weights file. That's real, but the open labs replicate it on
roughly the same four-month schedule as everything else, and a head start you
renew by spending billions a year is a strange thing to call a moat.

So, the actual prediction: by 2030 every large company runs a portfolio of
frontier and open models, buys nearly all of it through whichever one or two
clouds already passed its audits, and the clouds collect a toll on every
token from both sides of the open/closed divide. The labs that stay enormous
will be the ones that accepted being products on someone else's shelf, the
way Claude already is on all three clouds. I might be wrong about which labs
make it. I don't think I'm wrong about the shelf.

---

If you want the underlying data: [Epoch on the open–closed
gap](https://epoch.ai/data-insights/open-closed-eci-gap), [Menlo's enterprise
survey](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/),
[a16z's CIO
survey](https://a16z.com/leaders-gainers-and-unexpected-winners-in-the-enterprise-ai-arms-race/),
and [SemiAnalysis on Anthropic's channel
mix](https://newsletter.semianalysis.com/p/anthropic-growth-and-bedrock-mix).
