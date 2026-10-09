// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// This is a GitHub *user* site (jaypetez.github.io), so it is served from the domain
// root and needs no `base`. A project site would require one, and every internal
// link would have to be prefixed with it.
export default defineConfig({
  site: 'https://jaypetez.github.io',
  integrations: [sitemap()],
  // No `prefetch`: BaseLayout ships a static speculation-rules block instead,
  // which prerenders same-origin pages in Chromium for ~200 bytes of JSON
  // rather than Astro's ~2.5 KB prefetch runtime. Safari and Firefox lose
  // prefetching; for pages this small, that costs very little.
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
      // The interface face: navigation, headings, labels, the stack map.
      // Designed by the Braille Institute for legibility first, which is the
      // same priority the AAA contrast rule sets for the palette.
      //
      // Vendored rather than fetched: Google's Latin file is variable from 200
      // to 800 (34 KB), and the site only sets 400 to 700. Clamping the weight
      // axis to that range with fontTools' instancer cuts it to 21 KB, which
      // comes straight off every page's critical path. Regenerate from the
      // upstream Latin file with:
      //   fonttools varLib.instancer <in>.woff2 wght=400:700 --flavor=woff2
      // OFL, licence alongside; the family reserves no font name.
      provider: fontProviders.local(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--font-sans',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/atkinson-hyperlegible-next-latin-wght400-700.woff2'],
            weight: '400 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      // A range rather than a list: the file Google serves is variable in
      // weight either way (~51 KB), so naming the range costs nothing and
      // makes every weight between them available. Never request the optical
      // size axis — that file is 122 KB and breaks the critical-path budget.
      weights: ['400 600'],
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
      // Vendored and subset by hand (ASCII, Latin-1, and the handful of
      // punctuation glyphs the site uses) because the upstream latin build is
      // ~1 MB per weight. The subset lives in src/assets/fonts with its OFL
      // licence; regenerate with pyftsubset if the glyph list ever grows.
      provider: fontProviders.local(),
      name: 'Iosevka',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/iosevka-latin-400.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/iosevka-latin-500.woff2'], weight: 500, style: 'normal' },
        ],
      },
    },
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      // Both palettes as custom properties, neither as a default colour, so
      // global.css can choose between them with light-dark() — the same logic
      // as every other colour on the site, print included.
      defaultColor: false,
      wrap: true,
    },
  },
});
