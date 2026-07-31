// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// This is a GitHub *user* site (jaypetez.github.io), so it is served from the domain
// root and needs no `base`. A project site would require one, and every internal
// link would have to be prefixed with it.
export default defineConfig({
  site: 'https://jaypetez.github.io',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    // Emit `about/index.html` rather than `about.html` so URLs work with or
    // without a trailing slash on GitHub Pages' static file server.
    format: 'directory',
  },
  // Fonts are downloaded and self-hosted at build time. This avoids a
  // cross-origin round trip to fonts.googleapis.com (browsers partition the HTTP
  // cache by top-level domain, so a "shared" CDN cache no longer exists) and lets
  // Astro generate fallback metrics that prevent layout shift.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      // Only the weights the stylesheet actually uses: 400 body, 600 headings.
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      // Italic is a separate entry so it can be left out of the preload set. It
      // only appears in post blockquotes and emphasis, and preloading it put
      // ~50 KB on the critical path of every page, including the four that
      // contain no italic text at all.
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif-italic',
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
    },
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
