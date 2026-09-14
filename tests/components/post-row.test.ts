import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import PostRow from '../../src/components/PostRow.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// Plain objects, not collection entries: the component is typed structurally
// so the list can be exercised without the content layer.
const post = {
  id: 'the-moat-is-the-datacenter',
  data: {
    title: 'Frontier labs have no moat. Their landlords do.',
    description:
      'Open models are months behind at a tenth of the price, yet spend went the other way.',
    pubDate: new Date('2026-08-19T00:00:00Z'),
    tags: ['AI', 'strategy', 'ai'],
  },
};

const render = (props: Record<string, unknown>) => container.renderToString(PostRow, { props });

describe('PostRow', () => {
  it('is a list item, so rows sit inside the page list', async () => {
    expect((await render({ post })).trim()).toMatch(/^<li\b/);
  });

  it('links the title to the post', async () => {
    const html = await render({ post });
    expect(html).toContain('href="/writing/the-moat-is-the-datacenter/"');
    expect(html).toContain('Frontier labs have no moat. Their landlords do.');
    expect(html).toContain(post.data.description);
  });

  it('puts the date in the gutter in its short form, with a machine-readable datetime', async () => {
    const html = await render({ post });
    expect(html).toContain('datetime="2026-08-19"');
    expect(html).toContain('19 Aug 2026');
  });

  it('renders an h2 by default and an h3 when asked, so each page keeps its outline', async () => {
    expect(await render({ post })).toMatch(/<h2[^>]*>\s*<a/);
    expect(await render({ post, headingLevel: 'h3' })).toMatch(/<h3[^>]*>\s*<a/);
  });

  it('prints tags lowercase and deduplicated, behind a label only screen readers hear', async () => {
    const html = await render({ post });
    expect(html).toContain('Tagged');
    expect([...html.matchAll(/class="tag"/g)]).toHaveLength(2);
    expect(html).not.toMatch(/>AI</);
  });

  it('renders no tag list when there are no tags', async () => {
    const html = await render({ post: { ...post, data: { ...post.data, tags: [] } } });
    expect(html).not.toContain('class="mono tags"');
    expect(html).not.toContain('Tagged');
  });
});
