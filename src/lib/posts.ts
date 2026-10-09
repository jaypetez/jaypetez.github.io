/**
 * Post list logic, kept free of `astro:content` so it can be unit tested against
 * plain objects. Pages pass the result of getCollection('blog') straight in.
 *
 * Every function here is pure — draft visibility is an argument, not an ambient
 * environment check, so the tests can pin both behaviours.
 */

export interface PostLike {
  readonly id: string;
  readonly data: {
    readonly title: string;
    readonly pubDate: Date;
    readonly draft?: boolean;
    readonly tags?: readonly string[];
  };
}

/** A topic is a tag with a page of its own; the tag is already its URL slug. */
export interface Topic {
  readonly name: string;
  readonly count: number;
}

/** Newest first. Ties break on title so ordering is stable across builds. */
export function sortByDate<T extends PostLike>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => {
    const delta = b.data.pubDate.getTime() - a.data.pubDate.getTime();
    return delta !== 0 ? delta : a.data.title.localeCompare(b.data.title);
  });
}

/** Drops anything marked `draft: true`. */
export function excludeDrafts<T extends PostLike>(posts: readonly T[]): T[] {
  return posts.filter((post) => post.data.draft !== true);
}

/**
 * Published posts, newest first — what every page should render.
 *
 * Pass `includeDrafts` (pages use `import.meta.env.DEV`) to preview unfinished
 * posts locally while keeping them out of the build.
 */
export function publishedPosts<T extends PostLike>(
  posts: readonly T[],
  includeDrafts = false,
): T[] {
  return sortByDate(includeDrafts ? [...posts] : excludeDrafts(posts));
}

/**
 * The newest `count` published posts.
 *
 * A non-positive count returns nothing rather than throwing, so a page can ask
 * for `latest(posts, 0)` without special-casing.
 */
export function latest<T extends PostLike>(
  posts: readonly T[],
  count: number,
  includeDrafts = false,
): T[] {
  if (count <= 0) return [];
  return publishedPosts(posts, includeDrafts).slice(0, count);
}

/**
 * Tags as the site prints them: lowercase, first occurrence wins, order kept.
 * The content schema already requires slug-shaped tags; this guards the
 * duplicates the schema cannot see (`['agents', 'Agents']` is two strings).
 */
export function normalizeTags(tags: readonly string[] | undefined): string[] {
  return [...new Set((tags ?? []).map((tag) => tag.toLowerCase()))];
}

/**
 * Every topic used by the given posts, with how many posts carry it. Most
 * posts first, then alphabetical, so the busiest topics lead the list and the
 * order is stable across builds.
 */
export function topicsWithCounts<T extends PostLike>(posts: readonly T[]): Topic[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of normalizeTags(post.data.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The posts carrying `topic`, newest first. */
export function postsByTopic<T extends PostLike>(posts: readonly T[], topic: string): T[] {
  return sortByDate(posts.filter((post) => normalizeTags(post.data.tags).includes(topic)));
}

/**
 * The topics that appear alongside `topic` on its posts, excluding itself —
 * where a reader can go next from a topic page with only one essay on it.
 */
export function relatedTopics<T extends PostLike>(posts: readonly T[], topic: string): Topic[] {
  return topicsWithCounts(postsByTopic(posts, topic)).filter((t) => t.name !== topic);
}

/**
 * The posts either side of `id` in date order. `posts` should already be the
 * published list; an unknown id has no neighbours.
 */
export function neighbours<T extends PostLike>(
  posts: readonly T[],
  id: string,
): { newer: T | undefined; older: T | undefined } {
  const sorted = sortByDate(posts);
  const index = sorted.findIndex((post) => post.id === id);
  if (index === -1) return { newer: undefined, older: undefined };
  return { newer: sorted[index - 1], older: sorted[index + 1] };
}

/**
 * Up to `count` posts that share the most tags with `id`, for "more on this
 * topic" at the end of an essay. Excludes the post itself and its date
 * neighbours (they are already linked beside it), and anything sharing no tag
 * at all — an empty list is the honest answer when nothing is related. Ties
 * break newest first.
 */
export function related<T extends PostLike>(posts: readonly T[], id: string, count = 3): T[] {
  const self = posts.find((post) => post.id === id);
  if (!self || count <= 0) return [];

  const tags = new Set(normalizeTags(self.data.tags));
  const { newer, older } = neighbours(posts, id);
  const excluded = new Set([id, newer?.id, older?.id]);

  return sortByDate(posts)
    .filter((post) => !excluded.has(post.id))
    .map((post) => ({
      post,
      shared: normalizeTags(post.data.tags).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared) // stable, so date order holds within a score
    .slice(0, count)
    .map(({ post }) => post);
}
