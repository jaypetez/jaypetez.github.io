# jaypetez.github.io

[![CI](https://github.com/jaypetez/jaypetez.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/jaypetez/jaypetez.github.io/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey.svg)](LICENSE-CONTENT)

Source for my personal site and blog: **<https://jaypetez.github.io/>**

Built with [Astro](https://astro.build), no client-side framework, and about 1.5 KB of JavaScript on
the wire. Static HTML, self-hosted fonts, and a design system that a test suite keeps honest.

## Why it looks the way it does

The design is deliberately not the default. Generic AI-generated sites converge on the same handful
of choices — Inter, a purple-to-blue gradient, a grid of identically rounded cards — so this site
refuses all three, and `tests/design/tokens.test.ts` fails the build if any of them come back.

The structure is Swiss Modernism (8px base unit, one accent hue, rules instead of boxes); the
typography is editorial (Source Serif 4 for prose, JetBrains Mono for metadata). Every design value
lives in `src/styles/global.css` as a token — components never hard-code them.

The rules are in `tests/design/tokens.test.ts` if you want the exact list.

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
entry has a valid `https://github.com/jaypetez/<name>` URL, a license from the allowed set, and a
description that reads as a real sentence.

## Tests

Four tiers, all gating deployment:

- **`tests/unit/`** — pure logic: date formatting, reading time, slugs, post sorting, project data.
- **`tests/components/`** — `.astro` components rendered via Astro's Container API, asserting the
  accessibility contract (`aria-current`, labelled landmarks, hidden decorative glyphs).
- **`tests/content/`** + **`tests/design/`** — editorial rules the schema can't express, and the
  anti-slop guard: no gradients, no Inter, no off-token `border-radius`, no hard-coded `z-index`, and
  contrast ratios recomputed from the tokens rather than eyeballed.
- **`tests/build/`** — the real `dist/` output: every internal link resolves, zero axe violations,
  one `h1` per page, skip link before the nav, and a JavaScript budget.

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
