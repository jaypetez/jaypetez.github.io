---
title: 'Nobody writes a good prompt cold. Something has to ask you first.'
description: 'The context that makes a model useful is the context you never think to type. Why I built an interviewer that drags it out of you first.'
pubDate: 2026-09-13
tags: ['prompting', 'llm', 'tools']
---

I asked a model to plan six weeks of running for me and got back something
that could have been written for anyone with legs. It wasn't wrong. It was
generic in the particular way that makes you close the tab.

The fault was mine, and it wasn't laziness. Everything that would have made
that answer useful was sitting in my head and none of it made it into the
box: the two sessions a week I actually protect, the calf that goes at around
thirty miles, the fact that [stride](https://github.com/jaypetez/stride) has
eighteen months of my history in it and I never thought to say so. I typed
four lines because four lines felt like the whole question.

That gap is the one I keep falling into, and I don't think it's a capability
problem any more. You can't describe what you've stopped noticing. The
standard advice is to be more specific, which is close to useless, because
the specifics you're missing are the ones that are invisible to you by
definition. So I built [ideaforge](https://github.com/jaypetez/ideaforge). It
asks you one question at a time until it has the things you'd never have
typed, then writes the prompt you should have given in the first place. It
runs in the browser on your own key and you can
[try it](https://jaypetez.github.io/ideaforge/) without installing anything.

## The missing context is missing on purpose

Psychology has had a name for this since 1989: the [curse of
knowledge](https://en.wikipedia.org/wiki/Curse_of_knowledge), the difficulty
of modelling someone who doesn't already know what you know. Once the calf
injury is a fact of your life it stops being information. It's just the
weather, and you don't brief people on the weather.

Models are not good at digging it out of you.
[CLAM](https://arxiv.org/abs/2212.07769) put the finding plainly back in
2022: language models rarely ask users to clarify an ambiguous question and
instead just answer it, incorrectly. That was several model generations ago
and the behaviour has softened since, though not as much as you'd hope, and
the default is still to answer. Some of that is training. Some of it is that
ambiguity is the normal case rather than the exception: the
[AmbigQA](https://arxiv.org/abs/2004.10645) authors found more than half the
questions in a standard open-domain benchmark were ambiguous, and those were
questions people wrote deliberately, for a dataset, with time to think. The
ones you fire off at four in the afternoon are worse.

A checklist doesn't fix this, which I know because I used one for a while. A
checklist can only ask what its author thought of. The reason an interview
works is that the third question can be built out of your answer to the
second, so it reaches things nobody could have listed in advance.

## Stopping is the hard part

The obvious version of this is about thirty lines of code: loop, ask a
question, feed the answer back, let the model say when it has enough. That
version is useless, and it's useless for a reason worth sitting with.

Ask a model whether it has enough information and it says yes. It says yes
after two questions and it says yes after twenty. Self-assessment is exactly
the thing you can't delegate to the component being assessed, which is the
same argument I made about [agent harnesses a few weeks
ago](/writing/nobody-wants-to-build-the-harness/): the parts of the system
that refuse to trust the model are the parts doing the work.

So in ideaforge the model doesn't get to decide. Seven dimensions are
tracked, each mapping one-to-one onto a section of the document that gets
written at the end, which is what turns coverage into a testable question
instead of a feeling. Could I write the constraints section without inventing
anything? That has an answer. Each dimension sits at thin, partial or
covered, and promotion to covered is refused unless the model can produce a
verbatim quote from you supporting it.

<figure>
<pre role="img" aria-label="The coverage gate. The model claims a dimension is covered, and the claim only counts if it can quote the user saying so. If it can, the level rises by one. If it cannot, nothing moves.">
    the model says: this one is covered
                     |
                     v
        can it quote you saying so?
          |                     |
         yes                    no
          |                     |
          v                     v
     up one level         nothing moves
</pre>
<figcaption>fig 1 &middot; the only claim the interview trusts</figcaption>
</figure>

Around that sits a ratchet. Coverage never falls, it rises at most one level
per dimension per turn, and at most two dimensions can move in a single turn.
The clamping matters more than the gate does. A model asserting covered three
turns running while the ratchet quietly refuses every one of them is a model
making no progress, and that pattern is a better exit signal than anything it
says about itself. The interview ends when there is genuinely enough to write
from.

Loosen any of it and the thing stops early and hands you a confident, empty
prompt, which is the failure I was trying to get away from.

## The version of this that is just a prompt

You can already ask any chatbot to interview you. I did exactly that for
months with a saved prompt and it half worked, so I want to be straight about
how much of this is an app and how much is a paragraph of instructions.

Two things broke. The first is that it never stopped, for all the reasons
above. The second is subtler and I only understood it later: a long
conversation is a bad container for the answer. A 2025 study simulated [more
than 200,000 conversations](https://arxiv.org/abs/2505.06120) and found that
every leading model it tested, open weights and closed, did significantly
worse when a task was revealed across several turns instead of stated at
once: an average drop of 39% across six generation tasks. Models commit early
on thin information and then can't climb back out.

That's an awkward result for a tool built around a multi-turn interview, and
I think it's the argument for the shape it has. The interview is for
gathering. Its output isn't the conversation, it's one consolidated prompt
you paste into a fresh context with everything present from the first token.
The chat is a good place to find out what the work is and the worst place to
do it.

The rest is unglamorous. It keeps going when the model is unreachable, from a
built-in bank of twenty-one questions, and the export says so rather than
pretending otherwise. The key is encrypted in IndexedDB on your device and
goes to exactly one host, the provider you picked, which is also the only
host the page's CSP will talk to. That is a weaker guarantee than [running
the model yourself](/writing/run-your-own-model/) and I'd rather say so than
dress it up. There are no dependencies, so there's no build step and nothing
in the supply chain to trust.

What I'm least sure about is durability. Models are getting better at asking
unprompted, and a frontier model told to interview you does a respectable job
today. If that keeps improving, the interviewing is a feature of the model
and the useful residue here is just the stopping rule.

## Who ends up doing the asking

The prediction I'll commit to: elicitation stops being something users are
told to do and becomes something products do to them. Not another prompt
library, not another guide to writing better instructions, but an interview
sitting in front of the expensive call, because the cheapest way to improve
any model's output is still to stop it guessing at things you already know.

I might be wrong about whether that belongs in a separate tool. I don't think
I'm wrong that the binding constraint is the paragraph you didn't write.

The test is cheap enough to run yourself. Take something you have real
context on and were about to describe in four lines, and answer questions
about it for ten minutes first. If nothing surfaces that you weren't going to
mention, ignore all of this.

---

Worth reading if you want the underlying work: [LLMs Get Lost In Multi-Turn
Conversation](https://arxiv.org/abs/2505.06120),
[CLAM](https://arxiv.org/abs/2212.07769),
[AmbigQA](https://arxiv.org/abs/2004.10645), Anthropic's [be clear and
direct](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct),
and their [context engineering
guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
