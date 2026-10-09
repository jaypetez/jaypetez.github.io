import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import axe from 'axe-core';

/**
 * Assertions against the real built output. Requires `npm run build` first —
 * CI runs this as `npm run test:built` immediately after the build step, so the
 * suite fails loudly rather than skipping if the build is missing.
 */

const DIST = join(process.cwd(), 'dist');
const BLOG_DIR = join(process.cwd(), 'src/content/blog');

/**
 * Post slugs come from the content directory, never a hard-coded list, so
 * adding, renaming, or removing a post needs no edit here. Drafts are excluded
 * because the build excludes them.
 */
const PUBLISHED_FILES: string[] = readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file))
  .filter((file) => !/^draft:\s*true$/m.test(readFileSync(join(BLOG_DIR, file), 'utf8')));

const POST_SLUGS: string[] = PUBLISHED_FILES.map((file) => file.replace(/\.mdx?$/, ''));

/**
 * Every topic on a published post, read from the frontmatter the same way, so
 * a new tag adds its page to every assertion below without an edit here. The
 * schema requires slug-shaped tags, so a tag is its own URL segment.
 */
const TOPICS: string[] = [
  ...new Set(
    PUBLISHED_FILES.flatMap((file) => {
      const line = readFileSync(join(BLOG_DIR, file), 'utf8').match(/^tags:\s*\[(.*)\]\s*$/m);
      return line
        ? [...line[1]!.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]!.toLowerCase())
        : [];
    }),
  ),
].sort();

const STATIC_PAGES: readonly (readonly [string, string])[] = [
  ['home', 'index.html'],
  ['writing index', 'writing/index.html'],
  ['topics index', 'writing/topics/index.html'],
  ['about', 'about/index.html'],
  ['404', '404.html'],
];

const PAGES: readonly (readonly [string, string])[] = [
  ...STATIC_PAGES,
  ...POST_SLUGS.map((slug) => [`post: ${slug}`, `writing/${slug}/index.html`] as const),
  ...TOPICS.map((topic) => [`topic: ${topic}`, `writing/topics/${topic}/index.html`] as const),
];

beforeAll(() => {
  if (!existsSync(DIST)) {
    throw new Error('dist/ is missing — run `npm run build` before the built-output tests.');
  }
});

const read = (relative: string) => readFileSync(join(DIST, relative), 'utf8');

/** Every generated HTML file, relative to dist/. */
function builtHtmlFiles(): string[] {
  return readdirSync(DIST, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.html'))
    .map((entry) => entry.split('\\').join('/'));
}

/**
 * Resolves a site-relative URL to the file GitHub Pages would serve, mirroring
 * its static-file semantics: `/about/` -> `about/index.html`, and a bare
 * `/about` -> the same, since Pages redirects to the trailing-slash form.
 */
function resolveInDist(pathname: string): string | null {
  const clean = pathname.replace(/^\/+/, '').split('?')[0]!.split('#')[0]!;
  const candidates =
    clean === '' ? ['index.html'] : [clean, `${clean}/index.html`, `${clean}.html`];

  for (const candidate of candidates) {
    const full = join(DIST, candidate);
    if (existsSync(full) && statSync(full).isFile()) return candidate;
  }
  return null;
}

describe('build output', () => {
  it.each(PAGES)('emits the %s page', (_label, file) => {
    expect(existsSync(join(DIST, file))).toBe(true);
  });

  it('emits the feed and sitemap', () => {
    expect(existsSync(join(DIST, 'rss.xml'))).toBe(true);
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  it('found posts and topics to assert against', () => {
    // Guards the derived-slug approach: an empty content dir, or a frontmatter
    // format the tag reader no longer understands, would silently turn several
    // assertions below into no-ops.
    expect(POST_SLUGS.length).toBeGreaterThan(0);
    expect(TOPICS.length).toBeGreaterThan(0);
  });

  it('lists every published post in the RSS feed with an absolute link', () => {
    const rss = read('rss.xml');
    expect(rss).toContain('<title>Jayson Petersen</title>');
    for (const slug of POST_SLUGS) {
      expect(rss).toContain(`https://jaypetez.github.io/writing/${slug}/`);
    }
  });

  it('lists every page in the sitemap', () => {
    const sitemap = read('sitemap-0.xml');
    const paths = [
      '',
      'about/',
      'writing/',
      'writing/topics/',
      ...POST_SLUGS.map((slug) => `writing/${slug}/`),
      ...TOPICS.map((topic) => `writing/topics/${topic}/`),
    ];
    for (const path of paths) {
      expect(sitemap).toContain(`https://jaypetez.github.io/${path}`);
    }
  });

  it.each(PAGES)('%s leaks no dev-server URLs', (_label, file) => {
    expect(read(file)).not.toMatch(/localhost|127\.0\.0\.1/);
  });

  it('self-hosts fonts instead of calling out to Google', () => {
    for (const [, file] of PAGES) {
      expect(read(file)).not.toContain('fonts.googleapis.com');
      expect(read(file)).not.toContain('fonts.gstatic.com');
    }
  });

  it.each(PAGES)('%s preloads only the two above-the-fold faces', (_label, file) => {
    const preloads = [...read(file).matchAll(/<link rel="preload"[^>]*href="([^"]+\.woff2)"/g)];
    // The interface sans and the text serif, one variable file each. The mono
    // (code and figures) and the italic serif (posts only) are declared but not
    // preloaded — either would add to every page's critical path for text that
    // most pages do not contain.
    expect(preloads).toHaveLength(2);
  });

  it('keeps the critical-path payload small', () => {
    const html = read('index.html');
    const preloadedFontBytes = [...html.matchAll(/<link rel="preload"[^>]*href="([^"]+\.woff2)"/g)]
      .map((m) => readFileSync(join(DIST, m[1]!)).byteLength)
      .reduce((a, b) => a + b, 0);
    const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="(\/_astro\/[^"]+)"/g)]
      .map((m) => readFileSync(join(DIST, m[1]!)).byteLength)
      .reduce((a, b) => a + b, 0);

    // Two woff2 faces plus the stylesheets: ~85 KB, most of it the serif. Fails
    // if a third font gets preloaded or the home page's CSS stops being small.
    expect(preloadedFontBytes + css).toBeLessThan(100_000);
  });

  it.each(PAGES)('%s ships a trivial amount of JavaScript', (_label, file) => {
    const html = read(file);

    // Astro inlines small scripts, so counting only <script src> would miss the
    // theme toggle entirely and under-report the real payload.
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => Buffer.byteLength(m[1]!))
      .reduce((a, b) => a + b, 0);

    const external = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)]
      .map((m) => m[1]!)
      .filter((src) => src.startsWith('/'))
      .reduce((total, src) => total + readFileSync(join(DIST, src)).byteLength, 0);

    // The no-flash theme script, the theme toggle, and the speculation rules on
    // every page (~1.5 KB raw), plus the contents-list script on essays (~2.1 KB
    // there). The ceiling exists to catch a framework sneaking in.
    expect(inline + external).toBeLessThan(6_000);
    // And prove the measurement is not silently reading zero.
    expect(inline).toBeGreaterThan(0);
  });
});

describe('per-page HTML contract', () => {
  it.each(PAGES)('%s declares language, viewport, and a canonical URL', (_label, file) => {
    const html = read(file);
    expect(html).toMatch(/<html[^>]+lang="en"/);
    expect(html).toContain('width=device-width, initial-scale=1');
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/jaypetez\.github\.io/);
    expect(html).toMatch(/<meta name="description" content="[^"]{20,}"/);
  });

  it.each(PAGES)('%s has exactly one h1', (_label, file) => {
    expect([...read(file).matchAll(/<h1[\s>]/g)]).toHaveLength(1);
  });

  it.each(PAGES)('%s puts the skip link before the navigation', (_label, file) => {
    const html = read(file);
    const skip = html.indexOf('class="skip-link"');
    const nav = html.indexOf('<nav');
    expect(skip).toBeGreaterThan(-1);
    expect(nav).toBeGreaterThan(-1);
    expect(skip).toBeLessThan(nav);
  });

  it.each(PAGES)('%s skip link points at the main landmark', (_label, file) => {
    const html = read(file);
    expect(html).toContain('href="#main"');
    expect(html).toMatch(/<main[^>]+id="main"/);
  });

  it.each(PAGES)('%s gives every image alt text', (_label, file) => {
    for (const img of read(file).matchAll(/<img\b[^>]*>/g)) {
      expect(img[0], `image without alt in ${file}`).toMatch(/\salt="/);
    }
  });
});

describe('internal links and assets all resolve', () => {
  // Replaces an external link checker: this walks every generated page, so a
  // dead link on any page fails, not just ones reachable from the home page.
  const pages = builtHtmlFiles();

  it('found every generated page to crawl', () => {
    expect(pages.length).toBe(PAGES.length);
  });

  it.each(pages.map((p) => [p] as const))('%s has no dead internal links', (page) => {
    const html = read(page);
    const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]!);
    const internal = refs.filter((ref) => ref.startsWith('/'));

    expect(internal.length, `${page} links to nothing internal`).toBeGreaterThan(0);

    const dead = internal.filter((ref) => resolveInDist(ref) === null);
    expect(dead, `dead internal links in ${page}: ${dead.join(', ')}`).toEqual([]);
  });

  it.each(pages.map((p) => [p] as const))(
    '%s: every fragment link lands on an id on the same page',
    (page) => {
      // The crawl above only follows site-relative paths. Fragments matter on
      // every page now: the stack map's boxes jump to #project-* rows, and an
      // essay's contents list jumps to its sections.
      const html = read(page);
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!));
      for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
        expect(ids.has(fragment!), `#${fragment} has no target in ${page}`).toBe(true);
      }
    },
  );

  it.each(pages.map((p) => [p] as const))('%s tacks no arrows onto its links', (page) => {
    // "All writing →" is the generated-site default for a link that wants to
    // look clickable. A link here says where it goes; it does not point.
    for (const [, text] of read(page).matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
      expect(text, `arrow in a link on ${page}: ${text}`).not.toMatch(/→|←|↗|&rarr;|&larr;/);
    }
  });

  it('every page is reachable from the navigation', () => {
    const home = read('index.html');
    for (const route of ['/', '/writing/', '/about/']) {
      expect(home, `nav is missing ${route}`).toContain(`href="${route}"`);
    }
  });

  it('resolves the feed, sitemap, and every hashed asset referenced', () => {
    for (const page of pages) {
      const refs = [
        ...read(page).matchAll(/(?:href|src)="(\/_astro\/[^"]+|\/rss\.xml|\/sitemap[^"]*)"/g),
      ];
      for (const [, ref] of refs) {
        expect(resolveInDist(ref!), `${page} references missing ${ref}`).not.toBeNull();
      }
    }
  });
});

describe('essay contents', () => {
  const postPages = POST_SLUGS.map((slug) => [slug, `writing/${slug}/index.html`] as const);

  it.each(postPages)(
    '%s: every fragment link resolves to an id on the same page',
    (_slug, file) => {
      // The dead-link crawl above only follows site-relative paths; contents
      // links are fragments, so they need their own check.
      const html = read(file);
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!));
      for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
        expect(ids.has(fragment!), `#${fragment} has no target in ${file}`).toBe(true);
      }
    },
  );

  it.each(postPages)(
    '%s: the contents list mirrors the h2 sections in order, or is absent for a short post',
    (_slug, file) => {
      const html = read(file);
      const sections = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]!);
      const nav = html.match(/<nav[^>]*aria-labelledby="contents-label"[^>]*>([\s\S]*?)<\/nav>/);

      if (sections.length < 2) {
        expect(nav, `${file} has ${sections.length} section(s) but a contents list`).toBeNull();
        return;
      }
      expect(nav, `${file} has ${sections.length} sections but no contents list`).not.toBeNull();
      const links = [...nav![1]!.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]!);
      expect(links).toEqual(sections);
    },
  );
});

describe('page transitions', () => {
  /** Every view-transition-name set inline on a page, in document order. */
  const transitionNames = (html: string) =>
    [...html.matchAll(/view-transition-name:\s*([\w-]+)/g)].map((m) => m[1]!);

  it.each(PAGES)('%s names each transitioning element once', (_label, file) => {
    // Two elements with the same name abort the whole transition.
    const names = transitionNames(read(file));
    expect(names.length, `${file} has a duplicate name: ${names.join(', ')}`).toBe(
      new Set(names).size,
    );
  });

  it.each(POST_SLUGS.map((slug) => [slug] as const))(
    '%s: the essay title and its row in the writing list share a name, so the title travels',
    (slug) => {
      const name = `post-${slug}`;
      expect(read('writing/index.html')).toMatch(
        new RegExp(`<h2[^>]*view-transition-name: ${name}"`),
      );
      expect(read(`writing/${slug}/index.html`)).toMatch(
        new RegExp(`<h1[^>]*view-transition-name: ${name}"`),
      );
    },
  );
});

describe('accessibility (axe-core)', () => {
  it.each(PAGES)(
    '%s has no axe violations',
    async (_label, file) => {
      const window = new Window({ url: 'https://jaypetez.github.io/' });
      window.document.write(read(file));

      // axe needs the globals of the document it is auditing.
      const previous = {
        window: globalThis.window,
        document: globalThis.document,
        Node: globalThis.Node,
      };
      Object.assign(globalThis, {
        window: window as unknown as typeof globalThis.window,
        document: window.document as unknown as Document,
        Node: window.Node as unknown as typeof Node,
      });

      try {
        const results = await axe.run(window.document.documentElement as unknown as Element, {
          resultTypes: ['violations'],
          // Colour contrast is verified from the tokens themselves in
          // tests/design/tokens.test.ts; axe cannot compute it without layout.
          rules: { 'color-contrast': { enabled: false } },
        });
        const summary = results.violations.map((v) => `${v.id}: ${v.help}`).join('\n');
        expect(summary, `axe violations in ${file}:\n${summary}`).toBe('');
      } finally {
        Object.assign(globalThis, previous);
        window.close();
      }
    },
    30_000,
  );
});
