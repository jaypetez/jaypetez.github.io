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
const POST_SLUGS: string[] = readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file))
  .filter((file) => !/^draft:\s*true$/m.test(readFileSync(join(BLOG_DIR, file), 'utf8')))
  .map((file) => file.replace(/\.mdx?$/, ''));

const STATIC_PAGES: readonly (readonly [string, string])[] = [
  ['home', 'index.html'],
  ['writing index', 'writing/index.html'],
  ['about', 'about/index.html'],
  ['404', '404.html'],
];

const PAGES: readonly (readonly [string, string])[] = [
  ...STATIC_PAGES,
  ...POST_SLUGS.map((slug) => [`post: ${slug}`, `writing/${slug}/index.html`] as const),
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

  it('found posts to assert against', () => {
    // Guards the derived-slug approach: an empty content dir would silently
    // turn several assertions below into no-ops.
    expect(POST_SLUGS.length).toBeGreaterThan(0);
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
    const paths = ['', 'about/', 'writing/', ...POST_SLUGS.map((slug) => `writing/${slug}/`)];
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
    // Upright serif for body copy and mono for metadata. The italic serif is
    // declared but not preloaded — it would add ~50 KB of critical path to every
    // page for text that only appears inside posts.
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

    // Two woff2 faces plus the stylesheet. Fails if a third font gets preloaded.
    expect(preloadedFontBytes + css).toBeLessThan(100_000);
  });

  it('ships a trivial amount of JavaScript', () => {
    const html = read('index.html');

    // Astro inlines small scripts, so counting only <script src> would miss the
    // theme toggle entirely and under-report the real payload.
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => Buffer.byteLength(m[1]!))
      .reduce((a, b) => a + b, 0);

    const external = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)]
      .map((m) => m[1]!)
      .filter((src) => src.startsWith('/'))
      .reduce((total, src) => total + readFileSync(join(DIST, src)).byteLength, 0);

    // Theme toggle plus Astro's link prefetching — currently ~3.4 KB raw,
    // ~1.5 KB on the wire. The ceiling exists to catch a framework sneaking in.
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
