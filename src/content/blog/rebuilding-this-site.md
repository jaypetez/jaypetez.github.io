---
title: 'Rebuilding this site with rules a test can check'
description: 'Why this site has no gradients and no Inter, and how a unit test fails the build if either one sneaks back in.'
pubDate: 2026-07-31
tags: ['astro', 'design', 'testing']
---

This site used to be one hand-written `index.html` with five project cards in a
CSS grid. It was fine. It was also generic in a way I couldn't quite name until I
went looking for the vocabulary.

The name, it turns out, is **AI slop**: the wave of sites that all reach for the
same Inter typeface, the same purple-to-blue gradient, and the same rounded card
grid, because that's the average of everything a model has been trained on. None
of those choices is wrong on its own. The problem is that they arrive together,
every time, regardless of what's being built.

So I rebuilt the site around a small set of constraints, and then wrote tests
that enforce them.

## The constraints

Three of them are just refusals:

- **No gradients.** Not one. It's the loudest single tell.
- **No Inter, and no bare system-sans fallback.** Prose is set in Source Serif 4;
  metadata, navigation, and code are JetBrains Mono. There is no UI sans-serif
  anywhere on the site.
- **No uniform rounded cards.** Structural elements have `border-radius: 0`.
  Sections are separated by 1px rules, which is the deliberate opposite of a card
  grid.

The positive constraints came from Swiss Modernism: an 8px base unit with no
in-between spacing values, a fixed z-index scale, one accent hue, and a prose
measure capped at 68 characters because that's where long-form text stays
comfortable.

### The accent, and why it's this specific orange

One accent colour, used only for links and focus rings. I wanted a burnt
vermillion rather than the default blue, but "looks about right" is not a
standard, so I made the computer check:

```js
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const luminance = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
```

`#9A3412` on the light background scores 7.00:1. `#FB7A45` on the dark background
scores 7.50:1. Both clear WCAG AAA for body text with room to spare, and both sit
at roughly the same hue, so it reads as one colour that adapts rather than two
colours that clash.

| Token          | Light     | Dark      | Contrast |
| -------------- | --------- | --------- | -------- |
| Foreground     | `#18181B` | `#FAFAF9` | 17–19:1  |
| Muted text     | `#57534E` | `#A8A29E` | 7.3–7.8:1|
| Accent         | `#9A3412` | `#FB7A45` | 7.0–7.5:1|

## Constraints that aren't tested aren't constraints

This is the part I actually care about. A design system in a document is a
suggestion; six months later I'd have added a gradient to a hero section and
never noticed the drift.

So the rules are assertions. One test walks every stylesheet and every scoped
`<style>` block in the project and fails if it finds a gradient, an `Inter` font
stack, a `border-radius` outside the token set, a hard-coded `z-index`, or more
than one accent hue. Another recomputes every contrast pair from the tokens
themselves, so lowering contrast to make something look prettier breaks the
build.

> The useful property isn't that the tests catch me being lazy. It's that they
> turn "this felt right in July" into something a future version of me has to
> argue with explicitly.

The rest of the suite is ordinary: unit tests for date formatting and reading
time, component tests that render the navigation and check `aria-current` and the
skip link, schema tests that hold every post's frontmatter to a Zod contract, and
an axe pass over the built HTML. All of it runs in CI, and the deploy job can't
start unless it's green.

## What's actually here

Astro, no client framework, and about 1.5 KB of JavaScript on the wire — a theme
toggle and link prefetching, and nothing else. Fonts are downloaded and
self-hosted at build time rather than pulled from a CDN, which is worth roughly
180ms of LCP and avoids a third-party request on every visit.

The whole thing, tests included, is [public on
GitHub](https://github.com/jaypetez/jaypetez.github.io). If you spot a gradient,
the test is broken.
