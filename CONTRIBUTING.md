# Contributing

This is a personal site, so the content and the design direction are mine. That said, some
contributions are genuinely useful and I'd be glad to have them:

- **Accessibility problems.** If something is unreachable by keyboard, unreadable with a screen
  reader, or fails contrast at any viewport, that's a bug and I want to know.
- **Broken things.** Dead links, layout breaking at a width I didn't test, rendering bugs in a
  browser I don't use.
- **Typos and factual errors** in posts.
- **Tooling and test improvements.**

What I'll usually decline: redesigns, new frameworks or client-side JavaScript, and content
suggestions about what I should write.

## Ground rules the tests enforce

Before proposing a visual change, know that the following are asserted in CI and will fail the
build. They aren't accidents:

| Rule | Where |
| --- | --- |
| No gradients of any kind | `tests/design/tokens.test.ts` |
| No `Inter`, no bare system-sans stack | same |
| `border-radius` only from the token set (`0` or `--radius-chip`) | same |
| `z-index` only from the `--z-*` scale | same |
| Contrast recomputed from tokens: AA minimum, AAA for body text | same |
| 8px spacing base unit, prose measure 65–75 characters | same |
| One `h1` per page, skip link before the nav, zero axe violations | `tests/build/output.test.ts` |
| Every internal link resolves | same |

All design values live in `src/styles/global.css`. If you need a new value, add a token — don't
hard-code it in a component.

## Getting set up

Requires Node 22.12 or newer.

```bash
npm install
npm run dev
```

## Before opening a pull request

```bash
npm run format
npm run verify
```

`verify` runs the type check, the test suite, the build, and then the built-output tests — the same
sequence CI runs, in the same order. If it passes locally it should pass in CI.

## Commit messages

Conventional-commit prefixes, matching my other repositories:

```
fix: correct the reading-time estimate for posts with long code blocks
feat: add tag pages
docs: fix a typo in the first post
ci: pin actions/checkout to a commit SHA
build: bump astro to 7.2
```

## Pull requests

- One logical change per PR.
- Fill in the checklist in the template.
- For anything visual, include screenshots in **both** light and dark mode, plus a narrow viewport.
- CI must be green. The deploy job won't run otherwise, and neither will a merge.

## Reporting security issues

Don't open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
