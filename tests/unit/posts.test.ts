import { describe, expect, it } from 'vitest';
import {
  excludeDrafts,
  latest,
  publishedPosts,
  sortByDate,
  type PostLike,
} from '../../src/lib/posts';

function post(id: string, date: string, extra: { draft?: boolean; title?: string } = {}): PostLike {
  return {
    id,
    data: {
      title: extra.title ?? id,
      pubDate: new Date(date),
      ...(extra.draft !== undefined ? { draft: extra.draft } : {}),
    },
  };
}

const older = post('older', '2026-01-01');
const newer = post('newer', '2026-06-01');
const draft = post('draft', '2026-07-01', { draft: true });

describe('sortByDate', () => {
  it('puts the newest post first', () => {
    expect(sortByDate([older, newer]).map((p) => p.id)).toEqual(['newer', 'older']);
  });

  it('does not mutate the input array', () => {
    const input = [older, newer];
    sortByDate(input);
    expect(input.map((p) => p.id)).toEqual(['older', 'newer']);
  });

  it('breaks ties on title so build output is deterministic', () => {
    const b = post('b', '2026-03-01', { title: 'Beta' });
    const a = post('a', '2026-03-01', { title: 'Alpha' });
    expect(sortByDate([b, a]).map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('excludeDrafts', () => {
  it('drops posts marked draft', () => {
    expect(excludeDrafts([older, draft]).map((p) => p.id)).toEqual(['older']);
  });

  it('keeps posts with no draft field at all', () => {
    expect(excludeDrafts([older])).toHaveLength(1);
  });
});

describe('publishedPosts', () => {
  it('excludes drafts and sorts newest first', () => {
    expect(publishedPosts([older, draft, newer]).map((p) => p.id)).toEqual(['newer', 'older']);
  });

  it('includes drafts when asked, for local preview', () => {
    expect(publishedPosts([older, draft, newer], true).map((p) => p.id)).toEqual([
      'draft',
      'newer',
      'older',
    ]);
  });
});

describe('latest', () => {
  it('returns at most the requested count', () => {
    expect(latest([older, newer], 1).map((p) => p.id)).toEqual(['newer']);
  });

  it('returns everything when the count exceeds the number of posts', () => {
    expect(latest([older, newer], 99)).toHaveLength(2);
  });

  it('returns nothing for a non-positive count instead of throwing', () => {
    expect(latest([older, newer], 0)).toEqual([]);
    expect(latest([older, newer], -3)).toEqual([]);
  });

  it('respects the draft flag', () => {
    expect(latest([older, draft], 5).map((p) => p.id)).toEqual(['older']);
    expect(latest([older, draft], 5, true).map((p) => p.id)).toEqual(['draft', 'older']);
  });
});
