import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Editorial rules the Zod schema can't express. The schema already guarantees
 * types and description length at build time; these assertions cover the things
 * that would ship as a broken-looking post rather than a build failure.
 */

const BLOG_DIR = join(process.cwd(), 'src/content/blog');
const files = readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));

interface Parsed {
  file: string;
  frontmatter: Record<string, string>;
  body: string;
}

function parse(file: string): Parsed {
  const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file} has no frontmatter block`);

  const frontmatter: Record<string, string> = {};
  for (const line of match[1]!.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) frontmatter[kv[1]!] = kv[2]!.trim().replace(/^['"]|['"]$/g, '');
  }
  return { file, frontmatter, body: match[2]! };
}

const posts = files.map(parse);

describe('blog content', () => {
  it('has at least one post', () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it.each(posts.map((p) => [p.file, p] as const))('%s has a usable title', (_file, post) => {
    expect(post.frontmatter.title).toBeTruthy();
    expect(post.frontmatter.title!.length).toBeLessThanOrEqual(80);
  });

  it.each(posts.map((p) => [p.file, p] as const))(
    '%s description fits a search result',
    (_file, post) => {
      const description = post.frontmatter.description ?? '';
      // Under 50 reads as an afterthought; over 160 gets truncated by Google.
      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(160);
    },
  );

  it.each(posts.map((p) => [p.file, p] as const))(
    '%s is not dated in the future',
    (_file, post) => {
      const published = new Date(post.frontmatter.pubDate!);
      expect(Number.isNaN(published.getTime())).toBe(false);
      // Allow a day of slack so a timezone difference never fails the build.
      expect(published.getTime()).toBeLessThanOrEqual(Date.now() + 86_400_000);
    },
  );

  it.each(posts.map((p) => [p.file, p] as const))(
    '%s filename matches its slug shape',
    (_file, post) => {
      expect(post.file.replace(/\.mdx?$/, '')).toMatch(/^[a-z0-9-]+$/);
    },
  );

  it.each(posts.map((p) => [p.file, p] as const))(
    '%s starts headings at h2, since the title is the h1',
    (_file, post) => {
      const firstHeading = post.body.match(/^(#{1,6})\s/m);
      expect(firstHeading).not.toBeNull();
      expect(firstHeading![1]).toBe('##');
    },
  );

  it.each(posts.map((p) => [p.file, p] as const))(
    '%s contains real content, not filler',
    (_file, post) => {
      expect(post.body.toLowerCase()).not.toContain('lorem ipsum');
      expect(post.body.toLowerCase()).not.toContain('todo:');
      expect(post.body.trim().length).toBeGreaterThan(400);
    },
  );
});
