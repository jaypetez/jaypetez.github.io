import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import PostMeta from '../../src/components/PostMeta.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const pubDate = new Date('2026-07-31T00:00:00Z');

const render = (props: Record<string, unknown>) => container.renderToString(PostMeta, { props });

describe('PostMeta', () => {
  it('pairs the human date with a machine-readable datetime', async () => {
    const html = await render({ pubDate });
    expect(html).toContain('datetime="2026-07-31"');
    expect(html).toContain('31 July 2026');
  });

  it('omits the updated date when there is not one', async () => {
    expect(await render({ pubDate })).not.toContain('Updated');
  });

  it('shows the updated date when supplied', async () => {
    const html = await render({ pubDate, updatedDate: new Date('2026-08-15T00:00:00Z') });
    expect(html).toContain('Updated');
    expect(html).toContain('15 August 2026');
  });

  it('renders reading time only when supplied', async () => {
    expect(await render({ pubDate, minutes: 4 })).toContain('4 min read');
    expect(await render({ pubDate })).not.toContain('min read');
  });

  it('renders each tag', async () => {
    const html = await render({ pubDate, tags: ['astro', 'testing'] });
    expect(html).toContain('astro');
    expect(html).toContain('testing');
  });

  it('renders no tag list when there are no tags', async () => {
    expect(await render({ pubDate, tags: [] })).not.toContain('class="tags"');
  });
});
