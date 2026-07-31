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
  };
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
