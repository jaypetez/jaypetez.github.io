import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { publishedPosts } from '../lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = publishedPosts<CollectionEntry<'blog'>>(await getCollection('blog'));

  return rss({
    title: 'Jayson Petersen',
    description:
      'Notes on building AI agents, self-hosted LLM infrastructure, and the engineering decisions behind them.',
    // context.site comes from `site` in astro.config.mjs.
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writing/${post.id}/`,
      categories: [...post.data.tags],
    })),
    customData: '<language>en-gb</language>',
  });
};
