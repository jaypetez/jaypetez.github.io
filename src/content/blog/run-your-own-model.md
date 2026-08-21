---
title: 'Keep the personal stuff local. Rent the frontier for the rest.'
description: 'Open models got good enough for the work that involves my own data. What I run at home, what I still send out, and the hardware it takes.'
pubDate: 2026-08-21
tags: ['local-llm', 'privacy', 'homelab']
---

The second machine in my office exists so that certain questions never leave
the building. It is not exotic: a couple of used 24 GB cards, too many fans,
and [agent-gpu](https://github.com/jaypetez/agent-gpu) in front of them so
everything on my network reaches a model through one address. Most days it
handles the tagging, summarizing, drafting, and retrieval that make up the
bulk of what I actually automate, and I stopped thinking about the bill for
that work over a year ago.

The bill is not why I built it. I built it because I noticed I was making a
decision dozens of times a day without ever framing it as one: this thing I am
about to paste into a chat box, am I willing for it to exist on someone else's
disk. Bank statements. A medical letter. The half of a performance review I
hadn't finished. Source code with credentials still sitting in the fixtures.
The answer was usually "not really", and I pasted it anyway, because the good
model was over there and the friction of doing anything else was real.

Running your own model collapses that friction. It doesn't make the model
smarter and it doesn't replace the frontier for problems that need the
frontier. It changes which answer is the lazy one.

<figure>
<pre role="img" aria-label="A decision diagram: a thing I want answered splits on whether my own data is in it. If yes, it goes to a model I run at home and stays there. If no, it goes to a metered frontier API.">
        a thing I want answered
                   |
         is my own data in it?
          |                 |
         yes                no
          |                 |
          v                 v
  +---------------+ +---------------+
  | model I run   | | frontier API  |
  | stays home    | | tokens leave  |
  +---------------+ +---------------+
</pre>
<figcaption>fig 1 &middot; the only routing rule I actually follow</figcaption>
</figure>

## What actually leaves the house

The paranoid version of this argument is both popular and wrong, so let me not
make it. Nobody at a frontier lab is reading your chats. The retention
policies are mostly reasonable, the security teams are better than yours, and
I send plenty of work to hosted models every week.

The narrower problem is that the terms are theirs, and terms change. In August
2025 Anthropic [updated its consumer
terms](https://www.anthropic.com/news/updates-to-our-consumer-terms) so that
Free, Pro, and Max conversations could be used for training if you allow it,
with retention stretching from thirty days to five years when you do.
Commercial and API customers were untouched. Whatever you make of the change
itself, notice that it landed on accounts opened years earlier: the thing you
agreed to in 2023 was not the thing you were running under in 2026.

Litigation moves faster than policy. During the New York Times case OpenAI was
ordered to [preserve output log
data](https://openai.com/index/response-to-nyt-data-demands/) that its own
thirty-day deletion would otherwise have removed, temporary and deleted chats
included. The order was [narrowed that
October](https://www.engadget.com/ai/openai-no-longer-has-to-preserve-all-of-its-chatgpt-data-with-some-exceptions-192422093.html),
but the carve-out while it stood is the part worth reading twice: Enterprise,
Edu, and zero-data-retention contracts were exempt. Consumers were not. Your
delete button was never the binding constraint. Someone else's discovery
dispute was.

That gap is the one I looked at from the other side [when I wrote about the
clouds owning compliance](/writing/the-moat-is-the-datacenter/). The serious
guarantees do exist, they are enforced by mechanism rather than promise, and
they are sold to organizations with procurement departments. If you are one
person with a laptop, the strongest guarantee available to you is that the
data never left.

## Four jobs I keep at home

Retrieval over my own documents is what I would set up first if I were
starting again. Notes going back years, a mail archive, scanned letters, the
PDFs every institution insists on sending instead of data. Embedding that
corpus locally and keeping the index on the same disk means I can ask
questions across all of it without uploading my life to somebody's search
product. The model doing the answering is not the interesting part. The index
is, and the index is the thing you would least want to hand over.

<figure>
<pre role="img" aria-label="A dotted boundary labelled my house contains the whole retrieval pipeline: notes, mail, PDFs and journals feed into local embedding, then an index on my own disk, then a local model that answers. Nothing crosses the boundary.">
  ...................................
  :  my house                       :
  :                                 :
  :   notes, mail, PDFs, journals   :
  :                |                :
  :                v                :
  :         embed, locally          :
  :                |                :
  :                v                :
  :      index on my own disk       :
  :                |                :
  :                v                :
  :      local model answers it     :
  :.................................:
</pre>
<figcaption>fig 2 &middot; retrieval, with nothing crossing the line</figcaption>
</figure>

Coding is where the split is sharpest, and I have landed somewhere
unfashionable: hosted models for hard implementation work, local ones for
anything touching a repository I cannot show you.
[sidekick](https://github.com/jaypetez/sidekick) speaks MCP, so pointing it at
a local model instead of an API is a config change rather than a rewrite. For
reading code, summarizing a diff, writing the boring test, or answering "where
does this actually get called", a 27B model on a 24 GB card is genuinely fine.

Then the always-on work, where the economics stop being close.
[glean](https://github.com/jaypetez/glean) wakes up every morning, pulls
feeds, scrapes, searches, runs all of it through a model, and delivers a
digest. That is thousands of calls a month whose value per call is low and
whose volume never drops, which is exactly the shape that makes metered
inference irritating. On my own hardware the marginal cost of running it twice
as often is some electricity, which is why glean now does several things I
would never have justified at a per-token price.

The last category is the one that made me buy the second card.
[stride](https://github.com/jaypetez/stride) reads my whole Strava history to
decide what I should run next, which means it holds resting heart rate,
weight, sleep, and every route I have ever taken from my own front door. I am
not claiming a hosted model would misuse that. I am saying I would rather the
question never arise, and the same goes for the medical letters, the tax
documents, and the things you write down while working out what you think.

## What the hardware costs

VRAM decides everything, because a model that doesn't fit in it runs at a
speed you won't tolerate. The lever you have is quantization: storing weights
at roughly four bits instead of sixteen, which cuts the footprint by about
three quarters and costs a small amount of quality that, in daily use, I
notice far less than the parameter count I can now afford.

<figure>
<pre role="img" aria-label="A ladder of VRAM tiers: 8 GB fits 4B models and feels like a toy, 12 GB fits 8B and is useful, 16 GB runs gpt-oss-20b as a real assistant, 24 GB runs 27B and 32B dense models as a daily driver, and 48 GB runs 70B with long context.">
  VRAM    fits at 4-bit      feels like
  ----    -------------      ----------
   8 GB   4B, 8B is tight    a toy
  12 GB   8B, 14B is tight   useful
  16 GB   gpt-oss-20b        real assistant
  24 GB   27B, 32B dense     daily driver
  48 GB   70B, big context   few limits
</pre>
<figcaption>fig 3 &middot; the ladder, and where it stops hurting</figcaption>
</figure>

The other number is memory bandwidth, which sets how fast tokens come out
once the model fits, and it is mostly a function of how wide the memory bus
is. That is why an [RTX
3090](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/)
is still the card I point people at five years on: 24 GB of GDDR6X on a
384-bit bus, at a used price well under anything current carrying the same
memory. A second one is the cheapest honest route to larger models and to
serving more than one thing at a time.

What runs there has improved sharply in the last year.
[Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B) is dense, Apache 2.0,
and fits a 24 GB card at four-bit with room for real context.
[gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b) ships natively
quantized to MXFP4 and runs in about 16 GB, which puts a competent reasoning
model on hardware plenty of people already bought for games.

For software, start with [Ollama](https://ollama.com): it pulls a model, picks
a quantization, and gives you an OpenAI-shaped API in about a minute. Move to
[llama.cpp](https://github.com/ggml-org/llama.cpp) when you want to decide
exactly how layers get split. Move to
[vLLM](https://github.com/vllm-project/vllm) when several requests arrive at
once, because continuous batching is the difference between a personal toy and
something a household can share.

<figure>
<pre role="img" aria-label="A single always-on box: gpu zero with 24 GB holds the model, gpu one with 24 GB holds embeddings, and the disk holds the index. It is reachable on the LAN only, with nothing exposed to the internet.">
  +-----------------------------+
  |  one box, on all the time   |
  |                             |
  |  gpu 0   24 GB   the model  |
  |  gpu 1   24 GB   embeddings |
  |  disk     2 TB   the index  |
  +-----------------------------+
                 |
     LAN only, nothing exposed
</pre>
<figcaption>fig 4 &middot; the whole thing, physically</figcaption>
</figure>

The cost that caught me out is that the box is on all the time. Idle draw on a
two-card machine is real money over a year, and if it sits untouched for
twenty-three hours a day you are paying rent on capacity you barely use. I run
mine anyway because the scheduled jobs justify it. If all you want is a chat
window at 9pm, wake-on-LAN and a short script beat leaving it warm.

## Where the frontier still wins

All of that should be read next to the part I keep having to concede. Epoch
measures the best open-weight models running [about four months behind the
closed frontier](https://epoch.ai/data-insights/open-closed-eci-gap), and
notes that open models tend to score worse on private benchmarks than public
ones, which suggests the true gap is wider than the headline number. Four
months also understates the practical distance, because the model you are
comparing against runs on hardware you cannot buy at a context length your
card cannot hold.

So the hard problems still go out. Long multi-file refactors, planning across
a codebase I don't know well, genuinely novel reasoning, and the work where
being ten percent better compounds over an hour of agent time. I don't expect
that to change soon, and I would be suspicious of anyone telling you a 27B
model on your desk substitutes for the best thing available.

But the split is nowhere near even, and that is what people miss when they
hear "local model". Counted by requests rather than by difficulty, most of
what I run is not hard. It is bulk. Bulk is where local wins, and bulk is also
where nearly all of my personal data lives.

## Start with one box

If you are going to do this, don't start where I started, which was buying
hardware and then looking for something to point it at. Install Ollama on
whatever GPU is already in your machine, pull a model that fits, and move
exactly one real workflow onto it. Not a benchmark. Something you would
otherwise have typed into a chat box, ideally something you felt a flicker of
hesitation about typing into a chat box. A week of that teaches you more than
any amount of reading about quantization, this post included.

The rest follows the work. If the first workflow sticks you will find the
second and the third, and somewhere around the fourth you will want more VRAM,
which is the point where spending money becomes an informed decision instead
of a hobby purchase. [ollama-mobile](https://github.com/jaypetez/ollama-mobile)
exists because I got there and then wanted the same models from my phone.

My guess is that the capability gap keeps mattering less for personal work
every year, while the reasons to keep personal data at home stay exactly where
they are. I might be wrong about how fast the models close. I don't think I'm
wrong about which direction the data should travel.

---

Worth reading before you spend anything: [Epoch on the open-closed
gap](https://epoch.ai/data-insights/open-closed-eci-gap), [Anthropic's
consumer terms
update](https://www.anthropic.com/news/updates-to-our-consumer-terms),
[OpenAI's response to the Times data
demands](https://openai.com/index/response-to-nyt-data-demands/), and the
model cards for [Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B) and
[gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b).
