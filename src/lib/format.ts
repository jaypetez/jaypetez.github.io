/** Pure formatting helpers. No Astro imports here so they stay trivially testable. */

/**
 * Format a date unambiguously as e.g. "31 July 2026".
 *
 * Deliberately not locale-of-the-visitor and deliberately not "7/31/26": a
 * numeric date is read differently either side of the Atlantic, and a spelled-out
 * month cannot be misread. Fixed to en-GB and UTC so server and client agree.
 */
export function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('formatDate received an invalid Date');
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** ISO-8601 date portion, for `<time datetime>` and RSS. */
export function toISODate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('toISODate received an invalid Date');
  }
  return date.toISOString().slice(0, 10);
}

const WORDS_PER_MINUTE = 200;

/**
 * Estimated reading time in whole minutes, never less than 1.
 *
 * Strips fenced code blocks and figures first — nobody reads a config listing
 * or an ASCII diagram at prose speed, and a figure's aria-label is never shown
 * on screen at all. Counting either inflates the estimate on technical posts.
 */
export function readingTime(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<figure>[\s\S]*?<\/figure>/g, ' ');
  const words = prose.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  return Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
}

/** Matches Unicode combining marks left behind by NFKD decomposition. */
const COMBINING_MARKS = /[̀-ͯ]/g;

/** URL-safe slug: lowercase, accents folded, non-alphanumerics collapsed to single dashes. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
