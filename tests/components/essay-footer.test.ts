import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import EssayFooter from '../../src/components/EssayFooter.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const entry = (id: string, title: string) => ({ id, data: { title } });
const older = entry('older-essay', 'The older one');
const newer = entry('newer-essay', 'The newer one');
const related = [entry('related-a', 'Related A'), entry('related-b', 'Related B')];

const render = (props: Record<string, unknown>) => container.renderToString(EssayFooter, { props });

describe('EssayFooter', () => {
  it('links the essays either side, marked as previous and next for the browser', async () => {
    const html = await render({ older, newer });
    expect(html).toMatch(/href="\/writing\/older-essay\/"[^>]*rel="prev"/);
    expect(html).toMatch(/href="\/writing\/newer-essay\/"[^>]*rel="next"/);
    expect(html).toContain('The older one');
    expect(html).toContain('The newer one');
  });

  it('leaves out a side that has no essay, at either end of the list', async () => {
    const html = await render({ older });
    expect(html).toContain('rel="prev"');
    expect(html).not.toContain('rel="next"');
  });

  it('lists related essays under a label the list is named by', async () => {
    const html = await render({ related });
    expect(html).toMatch(/<ul[^>]*aria-labelledby="related-label"/);
    expect(html).toContain('href="/writing/related-a/"');
    expect(html).toContain('href="/writing/related-b/"');
  });

  it('leaves the related list out entirely rather than padding it when nothing is related', async () => {
    expect(await render({ older, newer, related: [] })).not.toContain('related-label');
  });

  it('adds no heading, since the essay counts its h2s as its sections', async () => {
    expect(await render({ older, newer, related })).not.toMatch(/<h[1-6][\s>]/);
  });

  it('is a labelled navigation landmark, distinct from the site nav and the contents', async () => {
    expect(await render({ older })).toMatch(/<nav[^>]+aria-label="More writing"/);
  });

  it('always offers the feed and the full list', async () => {
    const html = await render({});
    expect(html).toContain('href="/rss.xml"');
    expect(html).toContain('href="/writing/"');
  });
});
