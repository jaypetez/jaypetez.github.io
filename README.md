# jaypetez.github.io

[![CI](https://github.com/jaypetez/jaypetez.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/jaypetez/jaypetez.github.io/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey.svg)](LICENSE-CONTENT)

Source for my personal site and blog: **<https://jaypetez.github.io/>**

Built with [Astro](https://astro.build), no client-side framework, and under 1 KB of JavaScript on
the wire. Static HTML, self-hosted fonts, and a design system that a test suite keeps honest.

## Why it looks the way it does

The design starts from what the site is about rather than from a style. I build agents and the
infrastructure they run on, so the one bold element is a map of that stack: the home page opens on an
HTML diagram of four agents, the router they share, and the machines underneath. It is also the
navigation — every solid box is a project and jumps to its row in the Work list; a dashed box is
hardware or someone else's software and is not a link. Everything else stays quiet enough for the map
and the writing to carry the page.

Type has three jobs and three faces. [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next),
designed by the Braille Institute for legibility first, sets the interface and headings. Source
Serif 4 sets anything meant to be read at length, at 18 to 20px in essays. Iosevka appears only where
the content is literally code or a drawing made of characters. The palette is cool paper and graphite
ink with one accent, patch-cable blue, which is also the web's own colour for a link: blue means "you
can go here" or "you are here", and nothing else. Labels are written in sentence case.

Essays are built to be read rather than scrolled past. The description becomes a standfirst; a
contents list sits in a rail beside the text on a wide screen (folded above it on a phone) and marks
the section you are in; a hairline across the top shows how far through you are; a right margin
holds notes and pull quotes, so a long page has somewhere for the eye to land; and the end of each
essay links the ones either side and the ones that share its topics. Every tag has a page. The only motion is the essay
title travelling from the list into the page, a cross-document view transition that needs no
JavaScript and is off for anyone who has asked for reduced motion.

Generic AI-generated sites converge on the same choices — Inter, a purple-to-blue gradient, a grid of
identically rounded cards — and then, once those became recognisable, on a second set: frosted
headers, tracked capital labels, metadata strung together with middle dots, arrows tacked onto links,
and a warm-paper, serif, single-red-accent look that this site itself used to wear.
`tests/design/tokens.test.ts` fails the build if any of them come back, and recomputes every contrast
ratio from the tokens: AAA for body and muted text, 3:1 for the diagram's lines.
`tests/components/stack-map.test.ts` refuses a box for a project that is not in the Work list.
`tests/build/output.test.ts` checks the built pages: every link and fragment resolves, zero axe
violations, unique view-transition names, each essay's contents list mirrors its sections, and the
font, stylesheet, and JavaScript budgets hold. Every design value lives in `src/styles/global.css` as
a token — components never hard-code them.

## Local development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:4321
```

## Commands

| Command               | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| `npm run dev`         | Dev server with hot reload; drafts are visible                    |
| `npm run build`       | Static build to `dist/`                                           |
| `npm run preview`     | Serve the built output locally                                    |
| `npm run check`       | `astro check` — types and template diagnostics                    |
| `npm test`            | Unit, component, content, and design-token tests                  |
| `npm run test:built`  | Assertions against `dist/` — links, a11y, HTML contract (needs a build first) |
| `npm run coverage`    | Tests with coverage thresholds (90% on `src/lib` and `src/data`)   |
| `npm run verify`      | Everything CI runs, in order                                      |
| `npm run format`      | Prettier                                                          |

## Adding a blog post

Create `src/content/blog/<slug>.md`:

```markdown
---
title: 'A specific, concrete title'
description: 'Between 50 and 160 characters, because that is what a search result shows.'
pubDate: 2026-08-01
tags: ['astro']
draft: false
---

## Start headings at h2

The title above is the page's only `h1`.
```

The frontmatter is validated by a Zod schema in `src/content.config.ts`, so a malformed post fails
the build rather than shipping broken. `draft: true` posts render with `npm run dev` but are excluded
from the build, the feed, and the sitemap.

## Adding a project

The home page list is hand-curated in `src/data/projects.ts` — edit that one file. Tests assert every
entry has a valid `https://github.com/jaypetez/<name>` URL, a license from the allowed set, a status
(`active`, `maintained`, `experimental`, or `archived`, set from the repository's real activity),
and a description that reads as a real sentence. If the project belongs in the stack map, add it to
`src/data/stack.ts` too. Two optional fields put a second link in the row:
`docs` for hosted documentation, and `live` for a hosted build of the project itself, which
renders as `try it`.

## Tests

Four tiers, all gating deployment:

- **`tests/unit/`** — pure logic: date formatting, reading time, slugs, post sorting, project data.
- **`tests/components/`** — `.astro` components rendered via Astro's Container API, asserting the
  accessibility contract (`aria-current`, labelled landmarks, hidden decorative glyphs).
- **`tests/content/`** + **`tests/design/`** — editorial rules the schema can't express, and the
  anti-slop guard: no gradients, shadows, or frosted glass, no Inter or its successors, no tracked
  capitals or middle-dot strings, no off-token `border-radius`, no hard-coded `z-index`, and contrast
  ratios recomputed from the tokens rather than eyeballed.
- **`tests/build/`** — the real `dist/` output: every internal link and fragment resolves, zero axe
  violations, one `h1` per page, skip link before the nav, no arrows in link text, unique
  view-transition names, and the font, stylesheet, and JavaScript budgets.

## Deployment

Every push to `main` runs `.github/workflows/ci.yml`. The `deploy` job is gated on `test` and
`build`, so nothing reaches production without a green suite. Pages is configured with **GitHub
Actions** as its source, not branch deployment.

## Licensing

Two licenses, because a site is both code and writing:

- **Code** — `src/` (excluding content), `tests/`, and configuration: [MIT](LICENSE).
- **Written content** — everything under `src/content/`: [CC BY 4.0](LICENSE-CONTENT). Reuse it, but
  credit it.

## Contributing

**This repository is published to be read and reused, not contributed to.** Issues, pull requests,
and comments are restricted to collaborators, so an outside PR can't be opened — please fork instead
if you want to build on any of it. The MIT license means you don't need my permission.

The one channel that is open to everyone is
[private security reporting](https://github.com/jaypetez/jaypetez.github.io/security/advisories/new).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the design constraints CI enforces, which are the useful
part if you're reusing the code.
