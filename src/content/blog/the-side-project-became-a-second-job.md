---
title: 'Your side project became a second job'
description: 'AI made a SaaS cheap to build over a weekend. Selling one costs what it always did, and the evenings it needs were already taken.'
pubDate: 2026-11-07
tags: ['careers', 'ai', 'productivity']
---

I have a Strava coach called [stride](https://github.com/jaypetez/stride)
that reads my training history and tells me what to run next. I have
[famlobster](https://github.com/jaypetez/famlobster), a Telegram bot that
keeps my family's calendar and shopping list in order. Neither one has a
pricing page. Nobody pays for them, nobody files tickets against them, and
when I don't feel like touching them for a month, I don't. That's the whole
appeal.

Lately that makes me feel weirdly behind. Open any developer corner of the
internet and somebody is posting an MRR screenshot from a thing they built
over a long weekend with Claude or Cursor. My feed is wall to wall with
engineers who have a SaaS on the side, or a plan for one, or a thread about
how this is finally the quarter they launch.

So I spent a while reading the data instead of the screenshots, and here's
where I came out. AI made building a SaaS cheap and left everything else
about running one exactly as expensive as it was. For most engineers doing
this, the side project is a second shift, worked with the same tools and the
same always-on habits that wore them down at the day job, for odds that are
getting worse.

## Everybody's shipping something

The trend shows up outside my feed too. Stripe Atlas incorporates about one
in five new Delaware C corps, so it sees a lot of this. In May it [published
a post](https://stripe.com/blog/top-solo-founder-traits) saying solo
founders made up 63% of the C corps formed so far in Q2 2026, which Stripe
calls an all-time high. Its [2025 year in
review](https://stripe.com/blog/stripe-atlas-startups-in-2025-year-in-review)
counted 23,000 companies incorporated that year. The share of founders
saying they were building AI went from 15% in January 2023 to 42% in 2025.
And 20% charged their first customer within 30 days of incorporating, up
from 8% in 2020.

That last number explains the mood. Thirty days from paperwork to a paying
customer used to be a story people told on podcasts. Now it's one in five.
When auth, billing, a dashboard and a landing page are a weekend of
prompting, the old excuse ("I don't have time to build it") is gone, and a
lot of engineers took that personally.

I get it. I've had models write the boring plumbing in my own projects, the
stuff I'd have put off for a month. Once building gets that cheap, not
building starts to feel like a choice you have to defend.

## Cheap to build, same price to sell

The screenshots leave out the rest of that Stripe post. Alongside the
record, it compared the top 10% of solo founders with the median. Four years
ago the top decile made about 34 times the median's revenue in their first
six months. In 2025 it was 61 times. Median first-six-month revenue for solo
startups fell 23% year over year, while the top decile went up 19%.

More people are starting, and the typical one is making less. That's what
you'd expect when the cost of building drops and the cost of everything else
stays put. Getting a stranger to notice your thing, trust it, type in a card
number and still be around in month three takes the same effort it took in
2019. Support email doesn't care that the code took a weekend. Neither does
the customer who wants a refund because the CSV export broke at 11pm their
time.

One detail stuck with me. For top-decile solo founders, international sales
were 51% of revenue. For the median founder it was 2%. The winners sell to
the whole world, which means time zones, sales tax, currencies and an inbox
that never really closes. The median founder mostly sells to people like
themselves, and for an engineer that usually means other developers, about
the most crowded and least willing-to-pay market there is. Every weekend
SaaS for developers has five competitors that were also built in a weekend.

A quick aside on the other numbers floating around. You'll see "90% of indie
hackers quit by month 18" and "34% of new micro-SaaS were built by
non-programmers" quoted everywhere. I tried to trace both and ended up going
in circles between SEO blogs citing each other. I'd treat them as folklore.
Stripe only sees founders who incorporate through Atlas, which is a narrow
slice, but at least somebody counted.

## The day job already took the evenings

Now look at where the hours come from.

In February, Aruna Ranganathan and Xingqi Maggie Ye of Berkeley Haas
published ["AI Doesn't Reduce Work, It Intensifies
It"](https://hbr.org/2026/02/ai-doesnt-reduce-work-it-intensifies-it) in
HBR. They followed 40 people at a tech company of about 200 from April to
December 2025. Nobody was told to use AI. The people who did worked faster,
took on a wider scope, and let work leak into breaks, nights and early
mornings, because firing off a prompt is so easy you do it over lunch
without noticing. [The Register's
write-up](https://www.theregister.com/2026/02/11/ai_makes_employees_work_harder/)
points out the engineers got an extra chore on top of that: checking work
from colleagues who'd been vibe coding, coaching them, and finishing
projects somebody else had started.

That's one company and 40 people, so I wouldn't hang a theory of the
industry on it. It does line up with the Stack Overflow 2026 Developer
Survey, which came out in early October with 30,903 respondents in 169
countries. [As Business Insider reported
it](https://www.entrepreneur.com/business-news/survey-of-30903-professionals-shows-they-are-adopting-ai-despite-the-drawbacks),
nearly half said they were complacent in their jobs, a third said unhappy,
and 22% said happy. Among the complacent, burnout or tech fatigue was the
most common reason. And 31% of daily AI users said they spend at least four
hours a day in the tools. Marc Backes, a senior engineer at Directus, said
the work is "definitely less fulfilling" now, and that "if I don't keep up,
I will be left behind."

Put those side by side. You spend the day prompting, reviewing generated
code and cleaning up after other people's agents. Then you log off, open the
same editor with the same assistant, and spend the evening prompting and
reviewing generated code for a product with no customers and a Stripe
dashboard you refresh between episodes of something. Same job, minus the
salary, plus the anxiety of watching a number that mostly doesn't move.

That's the mechanism I think is burning people out. The day job already ate
the slack, and the side project eats whatever was left. Weekends turn into
launch windows. Every quiet hour gets measured against what you could have
shipped in it. And unlike the day job, there's no manager telling you to
take some PTO and nobody to hand the pager to.

## The case for doing it anyway

I don't want to be the guy telling people not to build things. The good
version of this is real.

Some people do get out this way. Stripe's top decile exists, and those
founders are making money that changes their lives. In the same Business
Insider piece, Simon Willison, who works for himself on Datasette, said his
work has become "a lot more fulfilling" with these tools. When you're your
own manager, the speedup goes to you instead of turning into a bigger sprint
commitment. That's a strong argument for owning something.

There's also the layoff math. 2026 has been another rough year for tech jobs
([Crunchbase keeps a running
tally](https://news.crunchbase.com/startups/tech-layoffs/)), and plenty of
engineers have reasonably decided that a second income, even a small one,
beats trusting one employer with all of it. I can't argue with that. A
product making $800 a month is a real cushion, and the skills you pick up
along the way (pricing, writing a landing page, talking to a customer who's
angry at you) make you better at the day job too.

And building stuff is fun. That's the only reason I have a Strava coach
nobody asked for.

## Where I land

The fun version and the revenue version look identical on GitHub and feel
completely different at 11pm. What separates them is whether you're allowed
to stop. My projects can sit for a month and nothing happens. A SaaS with
forty paying customers can't. The moment someone pays you, you've signed up
for a pager.

So, for whatever it's worth: decide which one you're building before you buy
the domain. If it's the fun one, don't bolt on Stripe just because it takes
ten minutes. If it's the business one, treat it like a job. Budget the hours
honestly and add them to the ones the day job already takes. If the total
comes to sixty a week, something gives, usually sleep first and then the
will to open a laptop at all.

My prediction is that by the end of 2027 we'll be reading a lot of "I shut
down my SaaS" posts from engineers who launched in 2025 and 2026, and that
Stripe's gap between the top decile and the median will be wider than 61x.
Building will keep getting cheaper. Customers won't.

What I'm less sure about is whether I'm rationalizing. Maybe one of my
weekend projects should have a pricing page, and I call it fun because I
don't want the pager. I haven't settled that one, and for now I'm fine
leaving it unsettled.

---

The load-bearing sources: Stripe's [solo founder
analysis](https://stripe.com/blog/top-solo-founder-traits) from May 2026 for
the 63%, the 61x gap and the 23% drop in median revenue; the [Atlas 2025
year in
review](https://stripe.com/blog/stripe-atlas-startups-in-2025-year-in-review)
for the AI share and time to first customer; Ranganathan and Ye's [HBR
study](https://hbr.org/2026/02/ai-doesnt-reduce-work-it-intensifies-it) on
how AI stretches the workday; and the [Business Insider
coverage](https://www.entrepreneur.com/business-news/survey-of-30903-professionals-shows-they-are-adopting-ai-despite-the-drawbacks)
of the Stack Overflow 2026 survey, which is where the Backes and Willison
quotes come from.
