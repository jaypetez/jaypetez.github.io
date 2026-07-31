# Contributing

**Short version: this repo doesn't take outside contributions, and GitHub is configured to enforce
that.** Issues, pull requests, and comments are limited to collaborators, so an outside PR can't be
opened at all. That's deliberate — it's a personal site, and I'd rather be honest about it than leave
a "contributions welcome" note that quietly rejects people.

What you *can* do:

- **Fork it and take whatever's useful.** The code is MIT (the writing is CC BY 4.0), so you don't
  need to ask. The design-token setup and the tests that enforce it are the parts most worth stealing.
- **Report a security issue.** This one channel is open to everyone, via
  [a private advisory](https://github.com/jaypetez/jaypetez.github.io/security/advisories/new).
  See [SECURITY.md](SECURITY.md).

If you've found a genuine bug — a broken link, something unreachable by keyboard, a contrast failure —
I do want to know, and the security advisory form is the reachable route until the interaction limit
lapses.

The rest of this file documents the constraints CI enforces. It's here for anyone reusing the code,
and for me in six months.

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

## Before committing

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

Only I and Dependabot can open these, but the bar is the same for both:

- One logical change per PR.
- Fill in the checklist in the template.
- For anything visual, check **both** light and dark mode, plus a narrow viewport.
- CI must be green. `main` requires the `Test (22.x)`, `Test (24.x)`, and `Build` checks, and the
  deploy job cannot run unless all three pass.

## Reporting security issues

Don't open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
