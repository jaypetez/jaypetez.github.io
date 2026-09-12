---
name: new-post
description: Draft and add a blog post to this Astro site. Use when asked to add, write, draft, or publish a post, an article, or an entry for the blog. Covers the content schema, the ASCII-figure rules, the house voice, the anti-AI-slop revision pass, and the verify-commit-PR sequence.
---

# Adding a post

A post is **one file**: `src/content/blog/<slug>.md`. Nothing else needs editing. The collection
glob, the `/writing/` index, the home page's three most recent, `rss.xml.ts`, the sitemap, and the
built-output test all read `src/content/blog` at build time. There is no tag page and no OG image
generator to update. If you find yourself editing a second file, stop and check why.

## 1. Slug

The filename is the URL. `src/content/blog/<slug>.md` serves at `/writing/<slug>/`.

- `^[a-z0-9-]+$`. Lowercase, digits, hyphens. Nothing else. A test asserts this.
- Name it after the argument, not the topic. The existing slugs are
  `nobody-wants-to-build-the-harness`, `the-moat-is-the-datacenter`,
  `nobody-has-solved-prompt-injection`. They read as claims.
- Check it does not already exist before writing.

## 2. Frontmatter

```markdown
---
title: 'A claim, not a topic label'
description: 'Between 50 and 160 characters, because that is the width of a search result.'
pubDate: 2026-09-12
tags: ['agents', 'security']
---
```

Validated twice: by Zod in `src/content.config.ts` at build time, and by
`tests/content/blog-schema.test.ts` against the raw text.

| Field | Rule |
| --- | --- |
| `title` | 1 to 80 characters. Single quotes, or double quotes if it contains an apostrophe. |
| `description` | **50 to 160 characters.** Count them. This is the most common failure. |
| `pubDate` | Bare unquoted ISO date. Must parse, and must not be more than 24 hours in the future. |
| `tags` | Inline array, lowercase, single-quoted, at most 6. |
| `draft` | Omit it unless the post is a draft. `draft: true` renders under `npm run dev` but is excluded from the build, the feed, and the sitemap. |

The schema test parses frontmatter with a line-based regex, `^(\w+):\s*(.*)$`, and strips one
leading and trailing quote. So **every key must sit on a single line**. No YAML block scalars, no
multi-line folded strings, no nested maps.

The first heading in the body **must be `##`**. The title is the page's only `h1`, and a test
enforces it. The body must exceed 400 characters and must not contain `lorem ipsum` or `todo:`.

## 3. Draft it

Read `references/house-style.md` before writing a word. It is short, and it is measured from the
posts already on the site rather than invented.

The two rules that catch people out: hard-wrap prose by hand at **76 columns**, and use **no em
dashes or en dashes at all**. There are zero across every post on the site.

## 4. Revise it

Two passes, in this order.

**The judgement pass.** Work through `references/anti-slop.md`. Most of it cannot be automated:
whether a paragraph survives the deletion test, whether a claim has a name and a date attached to
it, whether the piece takes a position that could turn out to be wrong.

**The mechanical pass.**

```
node .claude/skills/new-post/scripts/slopcheck.mjs src/content/blog/<slug>.md
```

It reports; it does not gate anything. A finding is a prompt to look, not an order to obey. Pass
`--verbose` to see every hit rather than the first few per rule.

## 5. Figures, if any

Figures are raw HTML in the markdown, and `tests/content/post-figures.test.ts` is strict:

```html
<figure>
<pre role="img" aria-label="A sentence describing the diagram for a screen reader.">
  drawing goes here
</pre>
<figcaption>fig 1 &middot; what it shows</figcaption>
</figure>
```

- Every art line is **at most 44 columns**. This matches the `clamp()` in `PostLayout.astro`.
- Printable ASCII only, character codes 32 to 126. The vendored Iosevka subset has nothing else.
- **No `<` or `>` anywhere in the art.** Markdown reads them as HTML. Use `v`, `^`, `+`, `|`, `-`.
- The `aria-label` must be longer than 40 characters and describe the diagram, not name it.
- No trailing whitespace on any art line.
- Counts of `<figure>`, `<figcaption>`, and `<pre role="img">` must match, and no bare `<pre>` may
  appear outside a figure.
- Use HTML entities in captions (`&middot;`, `&mdash;`), not literal Unicode.

## 6. Verify

Node 22.12 or newer is required. Run the same sequence CI runs, in the same order:

```
npm run format     # posts are gitignored by Prettier, but the rest of the tree is not
npm run verify     # astro check -> vitest -> astro build -> built-output tests
```

`npm run verify` is the gate. If it passes locally it passes in CI, which requires
`Test (22.x)`, `Test (24.x)`, and `Build` before `main` will take a merge.

Then look at it: `npm run dev`, open `/writing/<slug>/`, and check light mode, dark mode, and a
narrow viewport. Any internal link you added must resolve in `dist/`, because the built-output test
crawls every `href` starting with `/`.

## 7. Commit and ship

Conventional prefixes, lowercase, no trailing period:

```
feat: add post on <the subject, as a phrase>
```

The body is prose, not bullets, hard-wrapped near 72 columns, saying what the post argues and why
it exists. Look at `git log` for the shape.

Branch, push, open a PR with `gh pr create`, and fill in the checklist in
`.github/pull_request_template.md`. It has a line specifically about the 50 to 160 character
description and starting headings at `##`. Wait for the three required checks, then squash-merge.
The merge to `main` triggers the Pages deploy; that is the release.
