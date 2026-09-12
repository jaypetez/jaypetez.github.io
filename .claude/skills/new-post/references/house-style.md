# House style

Measured from the five posts already on the site, not invented. When a rule here disagrees with
your instinct, the posts win; go read one.

## Mechanics

- **Hard-wrap prose by hand at 76 columns.** Markdown is in `.prettierignore`, so nothing will
  reflow it for you and nothing will complain. Lines carrying a long URL are allowed to run over.
- **No em dashes. No en dashes. No ` -- `.** There are zero in the entire corpus. Where you want
  one, the site uses a comma, a colon, or a full stop. This is the single most recognisable thing
  about the prose here, and it is also the cheapest AI tell to remove.
- Contractions throughout. "doesn't", "won't", "I've".
- No emoji. No bold-led bullet lists. Recent posts contain no code fences at all.
- HTML entities in figure captions (`&middot;`, `&mdash;`), not literal Unicode.
- American-or-British spelling is not policed, but be consistent within a post.

## Length and shape

- **1,100 to 2,100 words.** The longest post on the site is 2,087.
- **Three to five `##` sections.** Sentence case. Usually a full declarative claim rather than a
  noun phrase: "Why the model won't be the fix", "What actually leaves the house", "Where I land",
  "Start with one box". Never "Introduction", "Conclusion", "Key takeaways".
- Sections are deliberately unequal. One may run 600 words and the next 150.
- No `h3`. The posts do not nest.

## The arc

Every post on the site follows roughly this, and it works:

1. **Open on something concrete.** A machine in a room, a program that runs every morning, a
   specific thing that happened. Usually anchored to one of the author's own repos:
   [glean](https://github.com/jaypetez/glean), [sidekick](https://github.com/jaypetez/sidekick),
   [stride](https://github.com/jaypetez/stride),
   [agent-gpu](https://github.com/jaypetez/agent-gpu),
   [ollama-mobile](https://github.com/jaypetez/ollama-mobile). Never a definition, never a
   rhetorical question, never "in today's world".
2. **State the claim early**, usually at the end of the second or third paragraph, and state it
   flatly. The reader should know by paragraph three what they are being asked to believe.
3. **Evidence, densely linked.** Primary sources inline, in the sentence that uses them, with
   enough detail that the reader could check. Name the paper, the date, the number.
4. **Steelman the other side properly**, in its own section or its own long paragraph. Not a
   sentence of throat-clearing.
5. **Concede something real** near the end. "I want to be careful not to overclaim here." "I might
   be wrong about how fast the models close." The concession has to cost something or it reads as
   false modesty, which is worse than none.
6. **Land it.** The last section is often called "Where I land" or similar and gives a prediction
   with a time horizon, plus the thing the author keeps turning over.

## Linking

- Inline, in prose, on the words that carry the claim. Not a link dump.
- Internal cross-links are root-relative with a trailing slash:
  `/writing/nobody-wants-to-build-the-harness/`. Every internal link is crawled by the
  built-output test, so a typo fails the build.
- **Close with a `---` rule and one unheaded paragraph of load-bearing sources.** Phrased as
  "The load-bearing sources:" or "Worth reading before you spend anything:" and then the links in
  running prose. No bullet list, no heading.

## Voice

- First person, opinionated, willing to be wrong in public.
- Concrete over abstract in every instance. Not "significant cost savings" but "I stopped thinking
  about the bill for that work over a year ago."
- Say the unfashionable thing when you believe it, and label it: "I have landed somewhere
  unfashionable."
- Do not perform balance. The posts take sides and then deal honestly with the cost of doing so.
- Personal claims stay at the level the existing posts already make: what the author runs, what
  they built, what they decided. Do not invent biography, employers, colleagues, or numbers about
  the author's own career.

## Worked frontmatter

```markdown
---
title: "Frontier labs don't have a moat. Their landlords do."
description: 'Open models are months behind at a tenth of the price, yet enterprise spend went the other way. Why I think the durable moat belongs to the clouds.'
pubDate: 2026-08-19
tags: ['ai', 'strategy', 'infrastructure', 'open-source']
---

## The first heading is always h2
```

Double quotes when the title contains an apostrophe, single quotes otherwise. `pubDate` unquoted.
Everything on one line.
