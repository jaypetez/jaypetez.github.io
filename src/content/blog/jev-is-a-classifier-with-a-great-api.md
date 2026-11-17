---
title: "Jev is a classifier with a great API. That's why it's a hit."
description: 'TypeSafe sells yes, no, and pick-one for almost nothing. Its headline numbers fall apart in its own footnotes. The excitement holds up anyway.'
pubDate: 2026-10-09
tags: ['ai', 'llm', 'strategy', 'benchmarks']
---

The rank stage in [glean](https://github.com/jaypetez/glean) asks a model one
question about every item it fetches: how relevant is this, from zero to
one? Anything under `min_relevance` gets dropped. If the answer won't parse,
the item scores zero and gets dropped anyway. Text in, one number out, and
the number decides what I end up reading.

That kind of call is the entire product TypeSafe AI shipped on 15
September, and today [TechCrunch
reported](https://techcrunch.com/2026/10/09/the-maker-of-non-text-ai-model-jev-valued-at-7-5b-just-weeks-after-launch/)
that the company raised $870 million at a $7.5 billion valuation, led by
Andreessen Horowitz with Sequoia and DCVC. That's 24 days after launching a
model that can't write a sentence.

I've read the launch post, the docs, the company's own eval page, and every
independent test of Jev I could find. My read is that Jev is a very good
zero-shot text classifier behind a very well designed API. The model is the
least new thing about it. What changed is the price of asking a yes-or-no
question, and that turns out to matter more to working developers than
another few points of intelligence.

## What you get for $0.042

The API has one endpoint. You send a `state`, which is any text or JSON you
want judged, and a map of questions, each one of three types. A `noul` is
yes or no and comes back as a probability. A `choice` picks from up to 255
options you define and returns a probability for each. A `score` rates
against a rubric of two to ten levels and returns a weighted value that can
land between them. That's the whole surface, per the [API
reference](https://docs.typesafe.ai/api.md).

<figure>
<pre role="img" aria-label="One Jev call. A state, the text of a support message, goes in with three typed questions: a yes or no, a choice between three teams, and a five-level score. The model jev-1.13.0 answers in 70 to 500 milliseconds with a probability, a probability per team, and a weighted score. No text comes back.">
 state     "Help! My payouts have been
            failing for 3 days."
 questions
   is_urgent  noul    yes or no
   team       choice  billing, auth, api
   severity   score   five levels
                 |
                 v
         +--------------+
         |  jev-1.13.0  |   70 to 500 ms
         +--------------+
                 |
                 v
   is_urgent  0.95
   team       billing 0.8, auth 0.1, ...
   severity   3.4, between levels 3 and 4
</pre>
<figcaption>fig 1 &middot; the docs example, with two more questions</figcaption>
</figure>

The [models page](https://docs.typesafe.ai/models.md) fills in the rest.
There's one model, `jev-1.13.0`. It takes text only, up to 64k tokens a
request. The same weights serve every account, with no fine-tuning on your
data. Input costs $0.042 per million tokens and output is free, which is
easy to offer when the output is a handful of floats.

What TypeSafe won't tell you is what the model is. The [launch
post](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
mentions "a new model architecture, parallel sampler" and a training method
it calls Reinforcement Learning for Calibrated Decisions, or RLCD.
TechCrunch was told it's transformer-based, "not a large language model",
and trained "exclusively on synthetic data", and reported that outside
observers suspect an open-weight LLM underneath. Asked on [Latent
Space](https://www.latent.space/p/jev) whether RLCD was published, Diogo
Almeida, the CEO, said "No, not yet." He also said "I probably shouldn't
talk too much about the insides of ML." There's no parameter count, no base
model, no paper. Fabio Akita [noticed
something](https://akitaonrails.com/en/2026/09/16/why-things-like-typesafe-ai-dont-interest-me/)
I'd have missed: RLCD is already the name of a [2023
paper](https://arxiv.org/abs/2307.12950), Reinforcement Learning from
Contrastive Distillation, by a different team doing a different thing.

"System One" is Kahneman's name for fast, automatic judgement, against the
slow, deliberate System 2. Researchers had been borrowing the pair for a
while: Ping Yu, Jason Weston and colleagues published [Distilling System 2
into System 1](https://arxiv.org/abs/2407.06023) in July 2024, two months
before o1 made the reasoning model a product. A company selling only the
fast half was always coming.

## The numbers are in their own footnotes

The home page says Jev is "193.6x Faster, 444.6x Cheaper", with an
asterisk: "based on workflows for System One tasks". Those workflows live
on [evals.typesafe.ai](https://evals.typesafe.ai/), and the page rewards
reading slowly.

TypeSafe built four workflows (security incidents, agent trace
observability, invoice processing, customer service) and ran them through
Jev and eight LLMs. Accuracy there means agreement with the average answer
of GPT-6 Astra and Claude Fable 5.1 at high thinking. There's no human
answer key, and the page says plainly that rather than debate the harness
or the labels, "we assume that the code is correct."

Jev scores 67.8% at $0.0004 and 0.4 seconds a case. [VKTR's launch
coverage](https://www.vktr.com/ai-platforms/chatgpt-cocreator-launches-typesafe-ai-with-jev/)
names the baselines: "193x faster than Claude Sonnet 5", which took 78.1
seconds a case, and "444x less than Claude Opus 5", which cost $0.1761, the
most expensive workflow on the page. The speed headline and the cost
headline come from two different models.

The question a buyer would actually ask is what the cheapest model with
the same score costs, and TypeSafe's own page answers it. The model it
calls luna scored a point lower at $0.0033 a case, so Jev is about 8 times
cheaper than that and 32 times faster. Against terra, which matched Jev to
a tenth of a point, it's 76 times cheaper and 25 times faster.

<figure>
<svg role="img" aria-label="A scatter chart of TypeSafe's own eval results for nine model configurations, plotting agreement with frontier-model labels against cost per case on a log scale. Jev sits far to the left at 67.8 percent and $0.0004 a case. Terra and Sonnet 5 score the same at about $0.03 and $0.12. Opus 5 scores 73.1 percent at $0.18 and is the baseline for the 444x claim. Against terra the gap is 76x." viewBox="0 0 340 288" width="340" height="288" font-size="13">
  <line class="chart-grid" x1="40" y1="201.4" x2="330" y2="201.4"/>
  <text x="34" y="205.9" text-anchor="end">55%</text>
  <line class="chart-grid" x1="40" y1="166.8" x2="330" y2="166.8"/>
  <text x="34" y="171.3" text-anchor="end">60%</text>
  <line class="chart-grid" x1="40" y1="132.2" x2="330" y2="132.2"/>
  <text x="34" y="136.7" text-anchor="end">65%</text>
  <line class="chart-grid" x1="40" y1="97.5" x2="330" y2="97.5"/>
  <text x="34" y="102" text-anchor="end">70%</text>
  <line class="chart-grid" x1="40" y1="62.9" x2="330" y2="62.9"/>
  <text x="34" y="67.4" text-anchor="end">75%</text>
  <text x="4" y="50">agreement</text>
  <line class="chart-rule" x1="40" y1="236" x2="330" y2="236"/>
  <line class="chart-rule" x1="40" y1="236" x2="40" y2="240"/>
  <text x="40" y="254" text-anchor="middle">$0.0001</text>
  <line class="chart-rule" x1="122.9" y1="236" x2="122.9" y2="240"/>
  <text x="122.9" y="254" text-anchor="middle">$0.001</text>
  <line class="chart-rule" x1="205.7" y1="236" x2="205.7" y2="240"/>
  <text x="205.7" y="254" text-anchor="middle">$0.01</text>
  <line class="chart-rule" x1="288.6" y1="236" x2="288.6" y2="240"/>
  <text x="288.6" y="254" text-anchor="middle">$0.1</text>
  <text x="185" y="280" text-anchor="middle">cost per case, log scale</text>
  <line class="chart-rule" x1="89.9" y1="22" x2="308.9" y2="22"/>
  <line class="chart-rule" x1="308.9" y1="18" x2="308.9" y2="69.1"/>
  <text x="199.4" y="16" text-anchor="middle">444x cheaper than Opus 5</text>
  <line class="chart-rule" x1="89.9" y1="46" x2="245.7" y2="46"/>
  <line class="chart-rule" x1="245.7" y1="42" x2="245.7" y2="105.1"/>
  <text x="167.8" y="40" text-anchor="middle">76x cheaper than terra</text>
  <line class="chart-rule" x1="89.9" y1="18" x2="89.9" y2="104.8"/>
  <g>
    <title>luna: 66.8% agreement, $0.0033 and 12.9 s per case</title>
    <circle class="chart-hit" cx="165.8" cy="119.7" r="12"/>
    <circle class="chart-mark" cx="165.8" cy="119.7" r="4"/>
  </g>
  <text x="156.8" y="124.2" text-anchor="end">luna</text>
  <g>
    <title>DS v4 flash: 64.4% agreement, $0.0059 and 51.9 s per case</title>
    <circle class="chart-hit" cx="186.7" cy="136.3" r="12"/>
    <circle class="chart-mark" cx="186.7" cy="136.3" r="4"/>
  </g>
  <text x="186.7" y="153.3" text-anchor="middle">DS v4 flash</text>
  <g>
    <title>Haiku 4.5: 53.6% agreement, $0.0195 and 12.5 s per case</title>
    <circle class="chart-hit" cx="229.7" cy="211.1" r="12"/>
    <circle class="chart-mark" cx="229.7" cy="211.1" r="4"/>
  </g>
  <text x="238.7" y="215.6">Haiku 4.5</text>
  <g>
    <title>terra: 67.9% agreement, $0.0304 and 10.1 s per case</title>
    <circle class="chart-hit" cx="245.7" cy="112.1" r="12"/>
    <circle class="chart-mark" cx="245.7" cy="112.1" r="4"/>
  </g>
  <text x="236.7" y="116.6" text-anchor="end">terra</text>
  <g>
    <title>DS v4 pro: 65.5% agreement, $0.0413 and 86.5 s per case</title>
    <circle class="chart-hit" cx="256.8" cy="128.7" r="12"/>
    <circle class="chart-mark" cx="256.8" cy="128.7" r="4"/>
  </g>
  <text x="256.8" y="145.7" text-anchor="middle">DS v4 pro</text>
  <g>
    <title>sol: 74.1% agreement, $0.0836 and 23.3 s per case</title>
    <circle class="chart-hit" cx="282.1" cy="69.2" r="12"/>
    <circle class="chart-mark" cx="282.1" cy="69.2" r="4"/>
  </g>
  <text x="273.1" y="73.7" text-anchor="end">sol</text>
  <g>
    <title>Sonnet 5: 67.8% agreement, $0.1174 and 78.1 s per case</title>
    <circle class="chart-hit" cx="294.3" cy="112.8" r="12"/>
    <circle class="chart-mark" cx="294.3" cy="112.8" r="4"/>
  </g>
  <text x="294.3" y="129.8" text-anchor="middle">Sonnet 5</text>
  <g>
    <title>Opus 5: 73.1% agreement, $0.1761 and 37.8 s per case</title>
    <circle class="chart-hit" cx="308.9" cy="76.1" r="12"/>
    <circle class="chart-mark" cx="308.9" cy="76.1" r="4"/>
  </g>
  <text x="308.9" y="93.1" text-anchor="middle">Opus 5</text>
  <g>
    <title>Jev: 67.8% agreement, $0.0004 and 0.4 s per case</title>
    <circle class="chart-hit" cx="89.9" cy="112.8" r="12"/>
    <circle class="chart-mark chart-key" cx="89.9" cy="112.8" r="5"/>
  </g>
  <text class="chart-name" x="80.9" y="117.3" text-anchor="end">Jev</text>
</svg>
<figcaption>fig 2 &middot; TypeSafe's own numbers, workflow runs only</figcaption>
</figure>

Seventy-six times cheaper at the same score is still a very good number.
It's just a different number from the one on the home page, and the
multiples drift everywhere else too: the launch post says "40x-200x"
faster, the chart on the home page works out to 171x cheaper and 75x
faster, and Vercel's blog rounds to 194 and 445.

To TypeSafe's credit, the launch post admits most of this itself. It
expects its results are "on the higher end of real world gains". The evals
were "generally run from our laptops on the West Coast". The workflows were
written by people on its own model team, so "some bias could exist". On
price: "We can't prove it isn't subsidized." I'd rather read that than a
benchmark table with nothing in the footnotes. But nobody quoting 444x on X
was quoting the footnotes.

Then there's "Zero Hallucinations". The launch post explains how the zero
got onto the chart: "Our number is not empirical. Schema matching is
guaranteed, thus we can confidently add 0% into the plots." That's true and
nearly empty. If the only things a model may say are yes and no, it can't
say anything else. It can still say no when the answer is yes, at 0.93, in
perfectly valid JSON. On [Hacker
News](https://news.ycombinator.com/item?id=49717558), jacobgold put it in
one line: "it can't emit an invalid type, but it can still emit a
completely wrong valid value." Armin
Ronacher's version, to TechCrunch, was that it "delegates the hallucination
problem a little bit to the user."

<figure>
<pre role="img" aria-label="Why zero hallucinations is true by construction. Asked whether an invoice is a duplicate, Jev can only answer yes or no. The truth is yes and Jev says no with probability 0.93. The answer is valid JSON and a valid type, isn't counted as a hallucination, and is wrong.">
  is this invoice a duplicate?
  +-------------------------------+
  | the only answers jev can give |
  |                               |
  |     yes              no       |
  |      ^               ^        |
  +------|---------------|--------+
         |               |
     the truth      jev says no,
                    p = 0.93
  -------------------------------
  valid json                  yes
  valid type                  yes
  counted as hallucination     no
  correct                      no
</pre>
<figcaption>fig 3 &middot; what a 0% hallucination rate measures</figcaption>
</figure>

Constrained output isn't new either. OpenAI shipped [Structured
Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/)
in August 2024, and every model behind it has been free of type errors in
exactly the same sense since.

The claim I'd most like to be true is calibration, because it's the one
that would make Jev different from a classifier you trained yourself.
"Calibrated: higher confidence means higher accuracy," says the launch
post. A calibrated 0.8 is right four times in five, and if that holds you
can set thresholds and send the unsure cases to a person or a bigger model
without guessing. The [docs
primer](https://docs.typesafe.ai/introduction/machine-learning-primer.md)
defines calibration carefully. I couldn't find anywhere TypeSafe measures
it: no expected calibration error, no reliability diagram, no Brier score.
Its own [list of known
weaknesses](https://docs.typesafe.ai/model-jaggedness/jev-1.13.md) admits
that score levels "are weak in numerical calibration", and that Jev "leans
toward the option that comes first", the same position bias [Zheng et
al.](https://arxiv.org/abs/2309.03882) found in LLMs answering multiple
choice in 2023.

The one independent measurement I found points the wrong way. A [phishing
benchmark](https://github.com/anisselbd/jev-phishing-bench) published on
17 September put Jev's expected calibration error at 0.154 against 0.097
for Claude Haiku 4.5, so on that set Haiku's probabilities were the more
honest ones. And when TypeSafe compares against LLMs, its [own
adapter](https://github.com/typesafe-ai/system-one-adapter-python) gets an
LLM's probabilities by asking the model to write them down. Verbalized
confidence is a known weak spot: [Xiong et
al.](https://arxiv.org/abs/2306.13063) found at ICLR 2024 that models
stating their confidence "tend to be overconfident". TypeSafe's comparison
uses exactly that method.

## Why the excitement is earned anyway

None of that explains 1,989 points on Hacker News, an API that briefly fell
over from demand, or Vercel reporting that "by hour 24, nearly 13% of paid
teams were using it" on [its
gateway](https://vercel.com/blog/ai-gateway-jev-model-launch). Developers
can read a footnote. What they're reacting to is the call.

Sebastian Raschka's [history of
classifiers](https://magazine.sebastianraschka.com/p/classifier-history-and-jev)
is the fairest thing I've read on Jev. He ran it over the 25,000-review IMDb
test set and got 96.47% for $0.65 in total, where a fine-tuned ModernBERT
gets about 95%. His conclusion is that "Jev doesn't seem to offer anything
fundamentally new", and in the same piece he calls it "the ChatGPT moment
for classification". Both are right. Zero-shot classification has existed
since at least 2019, when [Yin et al.](https://arxiv.org/abs/1909.00161)
framed it as entailment, and
[bart-large-mnli](https://huggingface.co/facebook/bart-large-mnli) has been
a one-line download for years. [SetFit](https://arxiv.org/abs/2209.11055)
got you a decent classifier from eight labelled examples a class in 2022.
Every one of those still asks you to pick a model, host it, and usually
label something. Jev asks you to write the question in English and send
it. ChatGPT's jump over GPT-3 was mostly the same kind of jump.

The independent tests say it's good and occasionally the best thing
available. Red Hat's Rob Geada, Mac Misiura and Shelton Cyril [benchmarked
it against purpose-built
guardrails](https://developers.redhat.com/articles/2026/10/02/benchmarking-ai-decision-models-against-traditional-guardrails)
on 2 October. On content safety Jev came first, at 86.2%, where a
125M-parameter Granite Guardian model managed 80.3% in 33 milliseconds. On
prompt injection it came fourth at 86.35%, behind a DeBERTa-v3 model that
scored 89.01% in 54 milliseconds to Jev's 348. Their overall verdict was
cool: they "did not find that decision models produced faster, cheaper, or
higher-quality answers compared with LLM-as-a-judge." At Every, Dan Shipper
ran it over [twelve writing samples seeded with seven
defects](https://every.to/also-true-for-humans/mini-vibe-check-typesafe-s-jev-judged-everything-i-ve-written-in-0-7-seconds).
Jev caught six in a median 0.35 seconds; Fable 5.1 caught all seven in
8.83.

The result I keep coming back to is in that phishing benchmark. Asked one
question, is this phishing, Jev managed 62.6% against Haiku's 81.3%. Then
the author split the question into five signals and had Jev answer all of
them in one call, with a logistic regression on top.

<figure>
<pre role="img" aria-label="The decomposed phishing setup. One email goes into a single Jev call with five yes or no questions: sender domain mismatch, free hosting, a lure, urgency, and a generic sender. The five probabilities feed a logistic regression that decides phishing or not. On held-out emails this scored 95.0 percent, against 93.2 for Haiku 4.5 asked the same five questions and 91.8 for a two-feature regex.">
                one email
                    |
                    v
   +--------------------------------+
   | one call, five noul questions  |
   |  sender domain mismatched?     |
   |  link on free hosting?         |
   |  is there a lure?              |
   |  is it urgent?                 |
   |  is the sender generic?        |
   +--------------------------------+
                    |
         five numbers, 0 to 1
                    |
                    v
          logistic regression
                    |
                    v
            phishing, or not
   --------------------------------
   jev, five questions        95.0%
   haiku 4.5, five questions  93.2%
   regex, two features        91.8%
</pre>
<figcaption>fig 4 &middot; the same model, asked better questions</figcaption>
</figure>

Those are scores on the held-out half. The gap to Haiku wasn't significant
(p = 0.063). The gap to the regex was.
And the jump from 62.6% to 95.0% came from the shape of the questions. The
model didn't change. It's the same lesson I keep relearning about
[harnesses](/writing/nobody-wants-to-build-the-harness/), and a cheap, fast
yes-or-no call is what makes that kind of decomposition affordable. Five
questions per email at LLM prices adds up. At $0.042 per million input
tokens it rounds to nothing. Andrej Karpathy, quoted by [The
Register](https://www.theregister.com/devops/2026/09/23/shut-up-and-calculate-jevs-new-ai-primitives-for-coders/5298431),
said Jev "revealed latent demand [...] that was under-invested into because
of a race to higher intelligence." I think that's right, and notice that
it's a claim about the market.

## Where I land

I haven't run Jev. Everything above is other people's measurement, and the
independent tests are small. The phishing set is synthetic, and its own
author notes that it "largely separates by construction", which is how a
regex gets to 91.8%. Red Hat's first place on content safety is real and I
can't explain it away. And if TypeSafe publishes RLCD and the calibration
holds up across domains, I'm wrong that the model is ordinary, because
honest probabilities from a zero-shot model would be worth far more than a
fast classifier.

Here's my bet. Decision endpoints become a commodity within a year. OpenAI
[launched a Decisions
API](https://fortune.com/2026/10/08/jev-an-ai-for-making-quick-decisions-has-been-a-viral-hit-in-silicon-valley-but-openai-is-hot-on-its-heels/)
on 6 October, three weeks after Jev, running GPT-6 Luna "without further
training" at $0.10 per million input tokens. Amazon's Strands Labs had
already [open-sourced Strands Decider
2B](https://techcrunch.com/2026/10/01/amazon-releases-its-own-jev-clone-as-decision-models-flood-the-web/),
built on Qwen3.5-2B and small enough to run locally. By October 2027 I
expect every major model API to have a decisions endpoint priced within a
factor of two of Jev's, and I'd point glean's rank stage at whichever one
runs on my own hardware. That's the shelf argument I made about [the
frontier labs](/writing/the-moat-is-the-datacenter/), and it lands harder on
a company whose product fits in one endpoint.

The hype is aimed at the right thing, which is cheap typed judgement, and
that's arriving whether or not TypeSafe is the one selling it. The $7.5
billion is a bet that RLCD is real. I'd want to see the reliability diagram
first.

---

The load-bearing sources: TypeSafe's [launch
post](https://typesafe.ai/blog/introducing-system-one-models-and-jev) and
[eval page](https://evals.typesafe.ai/), read together; its [known
weaknesses](https://docs.typesafe.ai/model-jaggedness/jev-1.13.md);
[Sebastian Raschka on where Jev sits in the history of
classifiers](https://magazine.sebastianraschka.com/p/classifier-history-and-jev);
[Red Hat's guardrail
benchmark](https://developers.redhat.com/articles/2026/10/02/benchmarking-ai-decision-models-against-traditional-guardrails);
the [phishing benchmark](https://github.com/anisselbd/jev-phishing-bench),
for the decomposition result and the only calibration number I found; and
[Fabio Akita's skeptical
read](https://akitaonrails.com/en/2026/09/16/why-things-like-typesafe-ai-dont-interest-me/).
