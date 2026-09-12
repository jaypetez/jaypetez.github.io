# The anti-slop pass

Two things to understand before using this list, or it will make the writing worse.

**These are frequencies, not fingerprints.** Humans write "furthermore". Humans use the rule of
three. The signal is density and uniformity, not presence. Almost everything below is a budget.

**The word lists rot fastest, and the structural rules last.** Wikipedia's editors now track three
distinct eras of model vocabulary: `delve` and `tapestry` in 2023, `fostering` and `pivotal` in
2024, `showcasing` and `highlighting` in 2025. Chasing that list is chasing a moving target. The
rules in sections 4 and 5, about structure and substance, are the ones that will still be true in
two years. Weight them accordingly.

And the standing warning: **do not overcorrect.** Sprinkled typos, parentheses standing in for
every em dash, and compulsive sentence fragments are already recognisable as *anti*-AI affectation.
Trading one uniform for another is not a win.

---

## 1. Words to cut on sight

Near-zero legitimate use in this kind of writing:

delve, delve into, tapestry, a testament to, underscores, showcasing, boasts, nestled, in the heart
of, myriad, plethora, multifaceted, vibrant, seamless, leverage (as a verb), synergy, paradigm
shift, game-changer, unleash, elevate, foster, fostering, cutting-edge, groundbreaking,
revolutionize, navigate (metaphorical), landscape (metaphorical), realm, in the realm of, arena,
arsenal, beacon, symphony, catapult, moves the needle, secret sauce, unlock value, drive impact,
deep dive, meticulous, intricate, intricacies, interplay, pivotal, garner, bolstered, indelible
mark, valuable insights.

The empirical backbone for the strongest three is Kobak et al., *Science Advances* 2025, which
measured excess vocabulary across 14.2 million PubMed abstracts: `delve` appears 25 to 28 times
more often than the pre-model baseline, `underscores` 13.8 times, `showcasing` around 10.

Meter rather than ban, because they have real uses: across, additionally, comprehensive, crucial,
enhancing, exhibited, insights, notably, particularly, within. More than about two per 500 words
collectively is a smell.

## 2. Sentence templates

The negation-reframe family is the most burned construction in English right now. Budget: **zero**.

- "It's not X, it's Y."
- "Not just X, but Y." / "Not only X but also Y."
- "X isn't about Y, it's about Z."
- "Not X. Not Y. Just Z."
- "The result? Devastating." (the self-answered rhetorical question)
- "Forget X. Think Y."

Also zero:

- False ranges where no scale exists: "from innovation to implementation to cultural
  transformation."
- "Think of it as a highway for data." The patronising analogy.
- "Imagine a world where", "Picture this", "Ever wondered".
- "Here's the kicker", "Here's the thing", "Let's break this down", "Let's dive in".
- "In today's fast-paced world", "In a world where", "In today's digital age".
- "It's worth noting that", "It's important to note".
- "Despite its challenges, X continues to thrive." Concede then dismiss.
- "In conclusion", "To sum up", "Ultimately, the future of X depends on".

## 3. Grammatical tics

- **Copula avoidance.** Replacing `is` with *serves as, stands as, represents, functions as,
  marks*; replacing `has` with *boasts, features, offers, maintains*. Measured as a drop of over
  10% in `is`/`are` frequency post-2022. If `is` works, write `is`.
- **Participial tails.** Sentences ending in a comma and a present participle that adds nothing:
  "..., highlighting its importance", "..., reflecting broader trends", "..., further cementing its
  role". Delete the clause; the sentence loses nothing. Budget zero.
- **Vague connection.** "associated with", "in connection with", "widely regarded as", where a
  direct claim would do. He was the CEO. Say that.
- **Hedge stacks.** "it could be argued that", "one might consider", "some would say". One hedge
  per claim at most. If you cannot name the uncertainty specifically, drop the hedge and make the
  claim.
- **Synonym cycling.** Refusing to repeat a noun: "the dashboard... the interface... the portal...
  the analytics hub." Repeat the noun. It is fine.
- **Significance adverbs**: quietly, deeply, fundamentally, truly, genuinely, profoundly.
  "Quietly" in particular is used to inject importance a sentence has not earned.
- **Anaphora runs.** Three consecutive sentences opening the same way.
- **Invented concept labels in clusters**: "the supervision paradox", "the acceleration trap". One
  coinage in a piece is an idea. Three is a tic.

## 4. Structure

- **The fractal summary.** The intro says what is coming, the body says it, the conclusion says it
  again, and the pattern repeats at every heading. No section may open by announcing its own
  contents. Just say the thing.
- **The signposted conclusion.** Any final section called "Conclusion", "Final thoughts", "Key
  takeaways", "Looking ahead", "Challenges and future directions". If a summary is genuinely
  useful, put it at the top.
- **Uniform section length.** Every `##` running three paragraphs, every paragraph four sentences.
  Let sections be as long as their subject deserves and no longer.
- **Uniform sentence length.** Models cluster hard in the 12 to 18 word band. The check is
  burstiness: standard deviation divided by mean of sentence word counts, which should sit at 0.4
  or above and ideally 0.5 to 0.7. Achieve it the honest way, by following a long winding sentence
  with a short one, not by chopping at random.
- **Transition stacking.** furthermore, moreover, additionally, that said, on the other hand. At
  most one paragraph in four may open with a formal connector. Nobody says "furthermore" out loud.
- **Tricolon autopilot.** Three adjectives, three parallel clauses. At most one per 200 to 400
  words, and never two in a row.
- **Bullet shredding.** Prose that should argue gets cut into parallel bullets. A list is for items
  that are genuinely enumerable and order-independent. Anything with causal flow is a paragraph.
- **Parallel headings.** Five sections all shaped "Why X matters". Vary the grammar.
- **Em dash density.** Machine prose runs around 10.6 per thousand words against roughly 3.2 for
  human essays. On this site the budget is zero; see `house-style.md`.

## 5. Substance

This is the layer that actually matters, and the one a script cannot check for you.

- **Vague attribution.** "Experts argue", "studies show", "industry reports suggest", "observers
  have noted". Name the person, the paper, and the date, or cut the claim. Budget zero.
- **The deletion test.** Delete each paragraph. If the piece loses no retrievable fact, the
  paragraph was filler. If more than a third of your sentences survive deletion without loss,
  the draft is padding.
- **Stakes inflation.** "fundamentally reshape how we think about", "unprecedented",
  "transformative".
- **Engineered one-liners.** Sentences built to be screenshotted that carry no information.
- **Pre-defending against objections nobody raised**, and belabouring the uncontroversial.
- **False vulnerability.** "And yes, I'll admit I'm biased here." Either be specific about the bias
  or say nothing.
- **Balanced endings that commit to nothing.** Take the position.

## 6. What to do instead

- **Point at something.** A name, a number, a date, a quote, in most paragraphs. The deepest
  problem with model prose is that it has nothing to point at. Not "several major publishers" but
  "Springer Nature, in its 2025 policy".
- **Specific uncertainty beats generic hedging.** Not "results may vary" but "I have only tested
  this on Postgres 16, and I would bet it breaks on 14."
- **Disagree with someone named.** Not "some critics argue".
- **Anecdotes need friction.** The thing that went wrong, the error message, the hours lost, who
  said what.
- **Let a digression stay** if it is interesting. Models never digress.
- **Vary how sections end.** Some on a question, some mid-thought, some on a flat statement.
- **The pub test.** Would you say this sentence out loud to a colleague? If not, rewrite it.

---

Sources worth reading rather than summarising: Wikipedia's
[Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), which is the
most complete and actively maintained catalog; [tropes.fyi](https://tropes.fyi/) for the structural
patterns; [Kobak et al. on excess
vocabulary](https://www.science.org/doi/10.1126/sciadv.adt3813) for the measured frequencies; and
Colin Gorrie's [rhetorical analysis](https://www.deadlanguagesociety.com/p/rhetorical-analysis-ai)
for why models reach for antithesis and tricolon in the first place.
