import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * ASCII figures embedded in posts, held to the same craft rules as the one on
 * the home page (tests/components/stack-figure.test.ts). Art is the easiest
 * thing on a page to break invisibly: one column past the ceiling and a 320px
 * viewport scrolls sideways, one character outside the vendored Iosevka subset
 * and the alignment depends on a glyph the webfont never shipped.
 *
 * Posts are plain markdown with no MDX, so figures are raw HTML and nothing in
 * the build would object to art that renders as a smear.
 */

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

/** The widest figure the CSS clamp in PostLayout.astro is sized for. */
const MAX_COLUMNS = 44;

interface Figure {
  file: string;
  index: number;
  label: string;
  lines: string[];
}

function figuresIn(file: string): Figure[] {
  const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
  const pattern = /<pre role="img" aria-label="([^"]*)">\r?\n([\s\S]*?)\r?\n<\/pre>/g;
  return [...raw.matchAll(pattern)].map((match, index) => ({
    file,
    index: index + 1,
    label: match[1]!,
    lines: match[2]!.split(/\r?\n/),
  }));
}

const figures = readdirSync(BLOG_DIR)
  .filter((f) => /\.mdx?$/.test(f))
  .flatMap(figuresIn);

const cases = figures.map((f) => [`${f.file} fig ${f.index}`, f] as const);

describe('post figures', () => {
  it.each(cases)('%s stays inside the column ceiling', (_name, figure) => {
    for (const line of figure.lines) {
      expect(line.length, `|${line}|`).toBeLessThanOrEqual(MAX_COLUMNS);
    }
  });

  it.each(cases)('%s draws in pure printable ASCII', (_name, figure) => {
    for (const line of figure.lines) {
      for (const char of line) {
        const code = char.charCodeAt(0);
        expect(code, `non-ASCII ${JSON.stringify(char)} in |${line}|`).toBeGreaterThanOrEqual(32);
        expect(code, `non-ASCII ${JSON.stringify(char)} in |${line}|`).toBeLessThanOrEqual(126);
      }
    }
  });

  it.each(cases)('%s avoids characters markdown would read as HTML', (_name, figure) => {
    for (const line of figure.lines) {
      expect(line, `angle bracket in |${line}|`).not.toMatch(/[<>]/);
    }
  });

  it.each(cases)('%s carries a label that says what the drawing shows', (_name, figure) => {
    expect(figure.label.length).toBeGreaterThan(40);
  });

  it.each(cases)('%s has no trailing whitespace to shift the art', (_name, figure) => {
    for (const line of figure.lines) {
      expect(line, `trailing space in |${line}|`).toBe(line.replace(/\s+$/, ''));
    }
  });
});

describe('post figure markup', () => {
  const files = readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));

  it.each(files)('%s captions every figure and labels every drawing', (file) => {
    const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
    const opens = raw.match(/<figure>/g)?.length ?? 0;
    const captions = raw.match(/<figcaption>/g)?.length ?? 0;
    const drawings = raw.match(/<pre role="img"/g)?.length ?? 0;
    const bare = raw.match(/<pre(?! role="img")/g)?.length ?? 0;

    expect(captions, 'every figure needs a caption').toBe(opens);
    expect(drawings, 'every figure needs one labelled drawing').toBe(opens);
    // A raw <pre> outside a figure would render as an unlabelled code block.
    expect(bare, 'raw <pre> outside a figure').toBe(0);
  });
});
