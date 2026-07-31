# jaypetez.github.io

Source for my GitHub Pages user site: **https://jaypetez.github.io/**

A single hand-written `index.html` listing my public open source projects. No build step, no
dependencies — GitHub Pages serves the file directly from `main` at the repo root.

## Layout

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: markup, inline CSS, and the project cards |
| `.nojekyll` | Tells Pages to skip Jekyll and serve files verbatim |

## Preview locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>.

## Adding a project

Copy an existing `<article class="card">` block in `index.html` and edit the name, link, description,
and tags. Cards are ordered by recent activity. That block is the only thing to touch.

## Publishing

Settings → Pages → Source: **Deploy from a branch**, Branch: `main` / `(root)`. Every push to `main`
triggers a rebuild, usually live within a minute.
