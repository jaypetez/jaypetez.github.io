import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import StackFigure from '../../src/components/StackFigure.astro';
import { projects } from '../../src/data/projects';

/**
 * The figure is the one ornament on the site, and ASCII art is the easiest
 * thing on a page to break invisibly: one line past the ceiling and a 320px
 * viewport scrolls sideways, one non-ASCII character and alignment depends on
 * a glyph the webfont may not ship. These assertions hold the craft rules.
 */

let container: AstroContainer;
let html: string;

beforeAll(async () => {
  container = await AstroContainer.create();
  html = await container.renderToString(StackFigure);
});

/** The art content of every <pre> in the rendered output, as lines. */
function artBlocks(rendered: string): string[][] {
  return [...rendered.matchAll(/<pre[^>]*>\n?([\s\S]*?)<\/pre>/g)].map((m) => m[1]!.split('\n'));
}

describe('StackFigure', () => {
  it('renders a wide and a narrow variant, nothing else', () => {
    expect(artBlocks(html)).toHaveLength(2);
  });

  it('keeps the wide variant under 60 columns and the narrow under 36', () => {
    const [wide, narrow] = artBlocks(html);
    for (const line of wide!) expect(line.length, `wide: |${line}|`).toBeLessThanOrEqual(60);
    for (const line of narrow!) expect(line.length, `narrow: |${line}|`).toBeLessThanOrEqual(36);
  });

  it('draws in pure printable ASCII, so no glyph coverage can break it', () => {
    for (const block of artBlocks(html)) {
      for (const line of block) {
        for (const char of line) {
          const code = char.charCodeAt(0);
          expect(code, `non-ASCII ${JSON.stringify(char)} in |${line}|`).toBeGreaterThanOrEqual(32);
          expect(code, `non-ASCII ${JSON.stringify(char)} in |${line}|`).toBeLessThanOrEqual(126);
        }
      }
    }
  });

  it('marks both variants as images with a label that says what the diagram shows', () => {
    const labels = [...html.matchAll(/role="img"[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]!);
    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(40);
      for (const name of ['glean', 'agent-gpu', 'ollama-mobile']) {
        expect(label).toContain(name);
      }
    }
  });

  it('only names projects that actually exist', () => {
    const known = new Set(projects.map((p) => p.name));
    for (const block of artBlocks(html)) {
      const named = block.join('\n').match(/[a-z][a-z0-9-]{3,}/g) ?? [];
      for (const word of named.filter((w) => w.includes('-'))) {
        expect(known, `figure names unknown project "${word}"`).toContain(word);
      }
    }
  });

  it('disables ligatures and pins a mono family, or the art will not align', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/StackFigure.astro'), 'utf8');
    expect(source).toMatch(/font-variant-ligatures:\s*none/);
    expect(source).toMatch(/pre\s*\{[^}]*font-family:[^};]*var\(--font-mono\)/s);
  });

  it('captions the figure', () => {
    expect(html).toMatch(/<figcaption[^>]*>fig 1/);
  });
});
