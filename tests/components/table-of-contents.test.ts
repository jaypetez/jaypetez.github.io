import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import TableOfContents from '../../src/components/TableOfContents.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const headings = [
  { depth: 2, slug: 'the-number-that-doesnt-fit', text: 'The number that does not fit' },
  { depth: 3, slug: 'an-aside', text: 'An aside' },
  { depth: 2, slug: 'where-i-land', text: 'Where I land' },
];

const render = (props: Record<string, unknown>) =>
  container.renderToString(TableOfContents, { props });

describe('TableOfContents', () => {
  it('lists only the h2 sections, linked to their slugs, in document order', async () => {
    const html = await render({ headings });
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['#the-number-that-doesnt-fit', '#where-i-land']);
    expect(html).not.toContain('An aside');
  });

  it('is a navigation landmark with a visible label', async () => {
    const html = await render({ headings });
    expect(html).toMatch(/<nav[^>]+aria-labelledby="contents-label"/);
    expect(html).toMatch(/id="contents-label"[^>]*>\s*Contents/);
  });

  it('adds no heading element, so the essay keeps one h1 and its own h2 count', async () => {
    expect(await render({ headings })).not.toMatch(/<h[1-6][\s>]/);
  });

  it('renders nothing for a post with fewer than two sections', async () => {
    expect((await render({ headings: headings.slice(0, 1) })).trim()).toBe('');
    expect((await render({ headings: [] })).trim()).toBe('');
  });
});
