import { describe, expect, it } from 'vitest';
import {
  excludeDrafts,
  latest,
  neighbours,
  normalizeTags,
  postsByTopic,
  publishedPosts,
  related,
  relatedTopics,
  sortByDate,
  topicsWithCounts,
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

/** A tagged post, for the topic and wayfinding helpers. */
function tagged(id: string, date: string, tags: string[]): PostLike {
  return { id, data: { title: id, pubDate: new Date(date), tags } };
}

// Newest first: e, d, c, b, a.
const a = tagged('a', '2026-01-01', ['agents', 'security']);
const b = tagged('b', '2026-02-01', ['agents']);
const c = tagged('c', '2026-03-01', ['homelab']);
const d = tagged('d', '2026-04-01', ['agents', 'security', 'harnesses']);
const e = tagged('e', '2026-05-01', ['security']);
const shelf = [a, b, c, d, e];

describe('normalizeTags', () => {
  it('lowercases and drops repeats, keeping first-seen order', () => {
    expect(normalizeTags(['Agents', 'llm', 'agents', 'LLM'])).toEqual(['agents', 'llm']);
  });

  it('treats missing tags as none', () => {
    expect(normalizeTags(undefined)).toEqual([]);
  });
});

describe('topicsWithCounts', () => {
  it('counts each topic once per post, busiest first, then alphabetical', () => {
    expect(topicsWithCounts(shelf)).toEqual([
      { name: 'agents', count: 3 },
      { name: 'security', count: 3 },
      { name: 'harnesses', count: 1 },
      { name: 'homelab', count: 1 },
    ]);
  });

  it('does not double-count a tag repeated on one post', () => {
    expect(topicsWithCounts([tagged('x', '2026-01-01', ['ai', 'AI'])])).toEqual([
      { name: 'ai', count: 1 },
    ]);
  });
});

describe('postsByTopic', () => {
  it('returns the posts carrying the topic, newest first', () => {
    expect(postsByTopic(shelf, 'agents').map((p) => p.id)).toEqual(['d', 'b', 'a']);
  });

  it('returns nothing for an unknown topic', () => {
    expect(postsByTopic(shelf, 'nope')).toEqual([]);
  });
});

describe('relatedTopics', () => {
  it('lists the topics that share posts with this one, excluding itself', () => {
    expect(relatedTopics(shelf, 'harnesses').map((t) => t.name)).toEqual(['agents', 'security']);
  });
});

describe('neighbours', () => {
  it('finds the newer and older post either side', () => {
    const { newer, older } = neighbours(shelf, 'c');
    expect(newer?.id).toBe('d');
    expect(older?.id).toBe('b');
  });

  it('has no newer post at the newest end and no older post at the oldest', () => {
    expect(neighbours(shelf, 'e').newer).toBeUndefined();
    expect(neighbours(shelf, 'a').older).toBeUndefined();
  });

  it('returns neither for an unknown id', () => {
    expect(neighbours(shelf, 'missing')).toEqual({ newer: undefined, older: undefined });
  });
});

describe('related', () => {
  it('ranks by shared tags and skips the post and its date neighbours', () => {
    // a is the oldest, so its one neighbour is b: skipped even though it
    // shares a tag, because the essay footer already links it as "newer".
    expect(related(shelf, 'a').map((p) => p.id)).toEqual(['d', 'e']);
  });

  it('breaks ties newest first', () => {
    const posts = [
      tagged('old', '2026-01-01', ['x']),
      tagged('mid', '2026-02-01', ['y']),
      tagged('self', '2026-03-01', ['x']),
      tagged('new', '2026-04-01', ['z']),
      tagged('newest', '2026-05-01', ['x']),
      tagged('newer', '2026-04-15', ['x']),
    ];
    // Neighbours of self are mid (older) and new (newer); both are excluded.
    expect(related(posts, 'self').map((p) => p.id)).toEqual(['newest', 'newer', 'old']);
  });

  it('honours the count', () => {
    expect(related(shelf, 'a', 1).map((p) => p.id)).toEqual(['d']);
  });

  it('returns nothing when no other post shares a tag', () => {
    expect(related(shelf, 'c')).toEqual([]);
  });

  it('returns nothing for an unknown id or a non-positive count', () => {
    expect(related(shelf, 'missing')).toEqual([]);
    expect(related(shelf, 'a', 0)).toEqual([]);
  });
});
