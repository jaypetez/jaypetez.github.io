import { describe, expect, it } from 'vitest';
import { formatDate, readingTime, slugify, toISODate } from '../../src/lib/format';

describe('formatDate', () => {
  it('spells the month out so the date cannot be misread', () => {
    expect(formatDate(new Date('2026-07-31T00:00:00Z'))).toBe('31 July 2026');
  });

  it('is stable regardless of the machine timezone', () => {
    // A late-UTC timestamp would roll back a day if the formatter used local time.
    expect(formatDate(new Date('2026-01-01T23:30:00Z'))).toBe('1 January 2026');
  });

  it('rejects an invalid date rather than rendering "Invalid Date"', () => {
    expect(() => formatDate(new Date('not a date'))).toThrow(RangeError);
  });
});

describe('toISODate', () => {
  it('returns just the date portion', () => {
    expect(toISODate(new Date('2026-07-31T14:22:05Z'))).toBe('2026-07-31');
  });

  it('rejects an invalid date', () => {
    expect(() => toISODate(new Date('nonsense'))).toThrow(RangeError);
  });
});

describe('readingTime', () => {
  it('rounds to whole minutes at 200 words per minute', () => {
    expect(readingTime('word '.repeat(400))).toBe(2);
  });

  it('never returns less than one minute', () => {
    expect(readingTime('short')).toBe(1);
    expect(readingTime('')).toBe(1);
  });

  it('discounts fenced code blocks, which are not read at prose speed', () => {
    const prose = 'word '.repeat(200);
    const code = '```js\n' + 'const x = 1;\n'.repeat(500) + '```';
    // Without stripping, the code would push this well past one minute.
    expect(readingTime(prose + '\n' + code)).toBe(1);
  });

  it('discounts figures, whose art and aria-label are not prose', () => {
    const prose = 'word '.repeat(200);
    const figure =
      '<figure>\n<pre role="img" aria-label="' +
      'a long description of the drawing '.repeat(20) +
      '">\n' +
      '+---+\n| a |\n+---+\n'.repeat(50) +
      '</pre>\n<figcaption>fig 1 &middot; a drawing</figcaption>\n</figure>';
    // The label alone would otherwise add minutes to a post nobody reads longer.
    expect(readingTime(prose + '\n' + figure)).toBe(1);
  });

  it('ignores punctuation-only tokens', () => {
    expect(readingTime('--- *** ... ///')).toBe(1);
  });
});

describe('slugify', () => {
  it('lowercases and joins words with single dashes', () => {
    expect(slugify('Agentic Graph Engineering')).toBe('agentic-graph-engineering');
  });

  it('folds accents to ASCII', () => {
    expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  });

  it('collapses runs of punctuation instead of leaving empty segments', () => {
    expect(slugify('a  --  b??!! c')).toBe('a-b-c');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('!!! hello !!!')).toBe('hello');
  });

  it('returns an empty string when there is nothing sluggable', () => {
    expect(slugify('!!!')).toBe('');
  });
});
