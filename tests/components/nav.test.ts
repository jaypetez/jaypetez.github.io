import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Nav from '../../src/components/Nav.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

/** Renders Nav as if the visitor were on `pathname`. */
async function renderAt(pathname: string): Promise<string> {
  return container.renderToString(Nav, {
    request: new Request(`https://jaypetez.github.io${pathname}`),
  });
}

describe('Nav', () => {
  it('renders all three destinations', async () => {
    const html = await renderAt('/');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/writing/"');
    expect(html).toContain('href="/about/"');
    expect(html).toContain('Work');
    expect(html).toContain('Writing');
    expect(html).toContain('About');
  });

  it('labels the landmark so screen readers can jump to it', async () => {
    expect(await renderAt('/')).toMatch(/<nav[^>]+aria-label="Main"/);
  });

  it('marks exactly one link as the current page', async () => {
    const html = await renderAt('/writing/');
    expect([...html.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  });

  it('marks the current page on the section it belongs to', async () => {
    // Any post path works; this asserts section matching, not that a specific
    // post exists.
    const html = await renderAt('/writing/any-post/');
    // A post lives under Writing, so Writing is the current section.
    expect(html).toMatch(/href="\/writing\/"[^>]*aria-current="page"/);
  });

  it('does not treat every route as home just because home is "/"', async () => {
    const html = await renderAt('/about/');
    expect(html).not.toMatch(/href="\/"[^>]*aria-current="page"/);
    expect(html).toMatch(/href="\/about\/"[^>]*aria-current="page"/);
  });

  it('sets navigation in sentence case, not the retired uppercase label utility', async () => {
    const html = await renderAt('/');
    expect(html).not.toMatch(/class="[^"]*\bmono\b/);
    // The labels are written as they should read, not uppercased by CSS.
    expect(html).toMatch(/>\s*Writing\s*</);
  });

  it('names the site with its owner, not a username', async () => {
    expect(await renderAt('/')).toMatch(/class="wordmark"[^>]*>\s*Jayson Petersen\s*</);
  });
});
