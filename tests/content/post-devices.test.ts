import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The reading devices an essay can use — numbered figures, margin notes, and
 * a pull quote — each come with a rule the layout cannot enforce on its own.
 * A pull quote repeats the essay's own words, so these tests hold that it does
 * exactly that: lifted verbatim, hidden from screen readers (who have already
 * heard it), at most one per essay.
 */

const BLOG_DIR = join(process.cwd(), 'src/content/blog');
const files = readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));
const posts = files.map((file) => [file, readFileSync(join(BLOG_DIR, file), 'utf8')] as const);

const PULL = /<aside class="pull"([^>]*)>([\s\S]*?)<\/aside>/g;
const NOTE = /<span class="note">([\s\S]*?)<\/span>/g;

/** Text as a reader sees it: no tags, no link syntax, single spaces. */
function plain(markdown: string): string {
  return markdown
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('figures', () => {
  it.each(posts)('%s leaves figure numbers to the layout', (_file, raw) => {
    for (const [, caption] of raw.matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/g)) {
      expect(caption, `hand-numbered caption: ${caption}`).not.toMatch(/^\s*fig(ure)?\.?\s*\d/i);
      expect(caption, `middle-dot caption: ${caption}`).not.toMatch(/&middot;|·/);
    }
  });
});

describe('pull quotes', () => {
  it.each(posts)('%s has at most one', (_file, raw) => {
    expect([...raw.matchAll(PULL)].length).toBeLessThanOrEqual(1);
  });

  it.each(posts)(
    '%s hides its pull quote from screen readers, who hear it in the text',
    (_file, raw) => {
      for (const [, attributes] of raw.matchAll(PULL)) {
        expect(attributes).toMatch(/aria-hidden="true"/);
      }
    },
  );

  it.each(posts)(
    '%s puts no link inside a pull quote, since hidden content must not take focus',
    (_file, raw) => {
      for (const [, , body] of raw.matchAll(PULL)) {
        expect(body).not.toMatch(/\]\(|<a\b/);
      }
    },
  );

  it.each(posts)('%s lifts its pull quote verbatim from the essay', (_file, raw) => {
    const text = raw.replace(/^---[\s\S]*?---/, '');
    for (const [whole, , body] of raw.matchAll(PULL)) {
      const quote = plain(body!);
      expect(quote.length).toBeGreaterThan(20);
      // Searched for in the essay with the pull quote itself taken out, or it
      // would always find itself.
      expect(plain(text.replace(whole, ' '))).toContain(quote);
    }
  });
});

describe('margin notes', () => {
  it.each(posts)('%s uses no more than three', (_file, raw) => {
    expect([...raw.matchAll(NOTE)].length).toBeLessThanOrEqual(3);
  });

  it.each(posts)('%s attaches each note to the word before it, with no space', (_file, raw) => {
    // The note's opening bracket brings its own space, so a space in the source
    // would read "word  (aside)" narrow and "word ." wide.
    for (const match of raw.matchAll(NOTE)) {
      const before = raw[match.index! - 1]!;
      expect(before, `space before a note: ${match[0].slice(0, 40)}`).toMatch(/\S/);
    }
  });

  it.each(posts)('%s leaves the brackets to the layout', (_file, raw) => {
    for (const [, note] of raw.matchAll(NOTE)) {
      expect(note).not.toMatch(/^\s*\(|\)\s*$/);
      expect(note!.trim().length).toBeGreaterThan(20);
    }
  });
});
