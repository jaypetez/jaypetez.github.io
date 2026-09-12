---
title: "Anyone can produce the code now. Get paid for knowing when it's wrong."
description: 'Entry-level hiring fell off a cliff and the advice got worse. What is scarce now is the judgement to tell almost-right from right, and that is learnable.'
pubDate: 2026-09-12
tags: ['careers', 'ai', 'hiring']
---

A model wrote the deduplication for [glean](https://github.com/jaypetez/glean)
and I merged it, because it was correct. It normalised each entry's URL,
hashed the result, and skipped anything it had seen before. Clean function,
good name, a test that passed.

Part of normalising was stripping the query string, which is the right call
for tracking parameters and the wrong call for the handful of sites that
still put the article ID in the query string. Those feeds collapsed to one
item each. I didn't notice for two weeks, because a digest that is missing
things looks exactly like a quiet news day.

Nothing about that code was bad. It was almost right. And the gap between
almost right and right is, as far as I can tell, the entire remaining job,
which is why I think most of the advice currently being handed to computer
science graduates is aimed at the wrong target.

## What the numbers actually say

Start with the number everyone quotes. In the [New York Fed's February 2026
release](https://www.newyorkfed.org/research/college-labor-market), computer
science graduates aged 22 to 27 had 7.0% unemployment, fifth highest of the
73 majors it tracks, with computer engineering at 7.5%. That chart went
around, understandably.

Two things sit next to it that almost never travel with it. Those same
majors have the highest early-career median wages on the list, around
$87,000 for computer science and $90,000 for computer engineering. And their
underemployment rate, the share working jobs that don't need the degree,
runs near 19% against 42% for recent graduates as a whole in 2026:Q2. The
market is not refusing to pay for this skill set. It is refusing to pay for
an unproven version of it.

The hiring collapse is real and worse than the unemployment rate suggests.
Indeed's software development postings index, which sat at 100 in February
2020, [bottomed at 61.12 on 17 May
2025](https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE) and has climbed
back to 76.12 as of 4 September 2026. Still a quarter below where it
started, and rising. [SignalFire's 2026 talent
report](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026)
puts entry-level hiring down roughly 65% at the big tech companies against
2019, and down about 76% at early-stage startups. In the same breath it
reports that engineering hiring at those startups is *up* 7%. They are
hiring engineers. They are not hiring new ones.

The stat that reframed the problem for me came from [Indeed's Hiring Lab in
July](https://hiringlab.indeed.com/2026/07/23/entry-level-jobs-arent-just-for-inexperienced-workers/):
in May 2026, nearly half of all applications from people with ten or more
years of experience were for entry-level jobs, and 30% of applications to
entry-level postings came from that group, more than any other. When you
apply to a junior role, the person ahead of you in the queue has a decade of
production incidents behind them and has decided to take the pay cut.

One caveat on the headline figure, because it matters. Connor O'Brien at the
Economic Innovation Group [pulled the underlying
samples](https://agglomerations.eig.org/p/a-viral-chart-on-recent-graduate)
and found that the 95% confidence interval on computer engineering runs from
about four percent to eleven. His conclusion is blunt: the intervals "are so
large that it makes no sense to use them to make firm conclusions about the
returns to particular majors." The direction is real. The decimal point is
theatre.

## How much of this is actually AI

The strongest case that AI is doing this is Stanford's [Canaries in the Coal
Mine](https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf),
published in August on ADP payroll records covering millions of workers a
month. Employment for 22 to 25 year olds in AI-exposed occupations now sits
19% below where it would be had it tracked their less-exposed peers.
Experienced workers show no comparable gap. The adjustment runs through
hiring, not layoffs, and it holds up when you drop technology firms and
computer occupations entirely, which is a serious result.

The strongest case against is the [Budget Lab at
Yale](https://budgetlab.yale.edu/research/ai-probably-not-yet-reason-labor-market-weakening),
which ran a synthetic difference-in-differences against the monthly
microdata in May and concluded that AI-exposed occupations do not yet show
clearly worse outcomes than comparable unexposed ones. Their framing of the
current market is a freeze rather than a contraction: low layoffs and low
hiring at the same time.

Then there's the tax argument, which deserves more airtime than it gets. The
2017 tax act quietly changed Section 174 so that from tax years beginning in
2022, American companies could no longer deduct software development salaries
in the year they paid them. Five-year amortisation domestically, fifteen
years abroad. A startup paying a million dollars in engineering salaries got
to deduct a sliver of it while writing the full cheque. That regime covered
exactly 2022 through 2024, and the One Big Beautiful Bill Act repealed it for
domestic spending on 4 July 2025. Postings bottomed out six weeks earlier.

I don't think the tax story explains the whole thing, and neither do the
Stanford authors: their effect survives removing tech entirely, and Section
174 could only ever operate through tech. But their own robustness work
contains the concession I keep coming back to. Once they control for broad
macro conditions with firm-time effects, the declines become significant only
after 2024. The first wave was probably rates and a post-ZIRP correction and
a tax change. The part that persists is the part that looks like AI. The
authors call their own findings "early, descriptive indicators" rather than
causal estimates, and I'd take them at their word.

## The part of the job that got harder

Here is what I think actually changed, and it is narrower and more useful
than "AI does the work now".

Veracode has been running the same 80 coding tasks against models for two
years. In their [spring 2026
update](https://www.veracode.com/blog/spring-2026-genai-code-security/),
across more than 150 models, syntax correctness now exceeds 95%. The share
of tasks producing *secure* code has hovered between 45% and 55% that whole
time, flat, regardless of model generation. In 45% of cases the model
introduces a known flaw. Java sits at 29%. Two years of progress on whether
it compiles, none on whether it's safe.

Developers feel this exactly. In the [2025 Stack Overflow
survey](https://survey.stackoverflow.co/2025/ai), the single biggest
frustration, at 66%, is "AI solutions that are almost right, but not quite."
Second, at 45.2%, is that debugging AI-generated code takes longer. Only 3.1%
of respondents say they highly trust the output.

And nobody is a reliable judge of their own throughput here. METR ran [a
randomised trial in
2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
with sixteen experienced open-source developers on real tasks in their own
repositories. They forecast a 24% speedup, reported a 20% speedup afterwards,
and were measured 19% slower. That result got quoted everywhere, including by
people who wanted it to be true. METR themselves [walked it back in February
2026](https://metr.org/blog/2026-02-24-uplift-update/): the follow-up was
inconclusive and they consider it unreliable, partly because they couldn't
recruit properly. Developers wouldn't give up AI access to participate, even
at fifty dollars an hour. That refusal is its own finding.

None of this is new, which is the point. [Charity
Majors](https://charity.wtf/2024/06/10/generative-ai-is-not-going-to-build-your-engineering-team-for-you/)
wrote in 2024 that "writing code is the easiest part of software
engineering, and it's getting easier by the day," that software is an
apprenticeship industry taking "a solid seven-plus years to forge a competent
software engineer," and that "by not hiring and training up junior engineers,
we are cannibalizing our own future." The industry read that and kept going.

## What to actually do

Stop leading with AI fluency. [Handshake found
that](https://joinhandshake.com/research/economic-research/class-of-2026-spotlight-computer-science-majors/)
45% of the class of 2026 already list AI skills on their CV and 42% use these
tools daily. It is the median behaviour of your entire cohort. It
differentiates nobody.

Lead instead with evidence that you can judge code you didn't write. Some
concrete forms that takes:

Operate something real, with users who complain, and be the person who gets
woken up. Two hundred people using a thing you maintain teaches you what no
coursework does, because production is where almost-right becomes visible.

Review other people's code in public. Open-source review threads are a
permanent, linkable record of your judgement, and they are the closest thing
to an audition for the actual job. A pull request you rejected with a good
reason says more than a repository you wrote alone.

Write the tests and the evals rather than the feature. The scarce skill is
specifying what correct means tightly enough that a machine can be held to
it. That is the same argument I made about [building the harness around a
model](/writing/nobody-wants-to-build-the-harness/), and about [what it takes
to trust anything an agent
produces](/writing/nobody-has-solved-prompt-injection/): the unglamorous
verification layer is where the value moved.

And aim at the roles that grew. SignalFire has forward-deployed engineering
up 30% since 2022 and AI/ML engineering up 39%, while front-end roles fell
25%. The jobs that survived are the ones where you sit between a customer and
a system and work out what is actually wrong. The jobs that shrank are the
ones where you implement a spec someone else wrote.

## Where I land

I want to be careful about what I'm claiming. I'm not a hiring manager, I
haven't been a new graduate for a long time, and the honest summary of the
research above is that two serious teams looked at overlapping data and
disagreed. Anyone telling you confidently why entry-level hiring collapsed is
ahead of the evidence.

I'd also say plainly that this is not a fair thing to ask of you. The
apprenticeship ladder was dismantled by people optimising quarterly costs,
and telling twenty-two year olds to demonstrate senior judgement before
anyone will pay them to develop it is a bad answer to a structural problem.
It's just the only answer available to an individual.

The thing that gives me some hope is supply. The [CRA's
2026 survey](https://cra.org/crn/2026/06/cra-update-new-cra-taulbee-survey-findings-show-record-degree-production-alongside-a-cooling-enrollment-pipeline/)
found a record 41,858 computer science bachelor's degrees awarded in 2025
alongside a 13% drop in new majors. Peak graduate supply is arriving right
now, into a postings index that has already climbed fifteen points off its
floor. Those two lines cross somewhere.

My prediction is that the junior role comes back within a few years under a
different name and a different first day, one where you are handed generated
code and a production system on day one and asked what's wrong with both. If
that's right, the people who spent this downturn collecting evidence of
judgement rather than evidence of output will walk into it. I could be wrong
about the timing. I don't think I'm wrong about which half of the job got
scarce.

---

The load-bearing sources: the [New York Fed on recent
graduates](https://www.newyorkfed.org/research/college-labor-market) and
[Connor O'Brien on why its error bars
matter](https://agglomerations.eig.org/p/a-viral-chart-on-recent-graduate),
[Stanford's Canaries in the Coal
Mine](https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf)
against [the Budget Lab at
Yale](https://budgetlab.yale.edu/research/ai-probably-not-yet-reason-labor-market-weakening),
[SignalFire's talent
report](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026),
[Indeed's Hiring Lab on who is applying to entry-level
roles](https://hiringlab.indeed.com/2026/07/23/entry-level-jobs-arent-just-for-inexperienced-workers/),
[Veracode's security pass
rates](https://www.veracode.com/blog/spring-2026-genai-code-security/),
[METR's retraction of its own
result](https://metr.org/blog/2026-02-24-uplift-update/), and [Charity Majors
on the apprenticeship
industry](https://charity.wtf/2024/06/10/generative-ai-is-not-going-to-build-your-engineering-team-for-you/).
