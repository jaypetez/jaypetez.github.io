import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts. The schema is the contract: a post that violates it fails the
 * build rather than shipping broken metadata, and tests/content asserts the
 * editorial rules the schema itself can't express.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1).max(80),
    // 50-160 characters: shorter reads as an afterthought in search results,
    // longer gets truncated by Google.
    description: z.string().min(50).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Lowercase, deduplicated at render time. Kept short on purpose. */
    tags: z.array(z.string().min(1)).max(6).default([]),
    /** Drafts render locally via `npm run dev` but never reach the build. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
