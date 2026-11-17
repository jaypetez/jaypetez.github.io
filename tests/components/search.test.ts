import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Search from '../../src/components/Search.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (props: Record<string, unknown> = {}) => container.renderToString(Search, { props });

describe('Search', () => {
  it('starts as a plain link to /search/, so it works before and without the script', async () => {
    expect(await render()).toMatch(/<a[^>]*href="\/search\/"[^>]*data-search-trigger/);
  });

  it('announces its shortcut, and the shortcut needs a modifier key', async () => {
    // A single-character shortcut would fail WCAG 2.1.4.
    expect(await render()).toMatch(/aria-keyshortcuts="Control\+K Meta\+K"/);
  });

  it('is a dialog named by a visible heading', async () => {
    const html = await render();
    expect(html).toMatch(/<dialog[^>]*aria-labelledby="search-title"/);
    expect(html).toMatch(/<h2[^>]*id="search-title"/);
  });

  it('labels the search field for screen readers, in both forms', async () => {
    for (const html of [await render(), await render({ mode: 'page' })]) {
      const input = html.match(/<input[^>]*id="([^"]+)"/);
      expect(input).not.toBeNull();
      expect(html).toContain(`for="${input![1]}"`);
      expect(html).toMatch(/role="search"/);
    }
  });

  it('never links the index directly, so nothing loads it before search is opened', async () => {
    for (const html of [await render(), await render({ mode: 'page' })]) {
      expect(html).not.toMatch(/(href|src)="\/pagefind\//);
    }
  });
});
