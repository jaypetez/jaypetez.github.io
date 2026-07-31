/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig loads astro.config.mjs so tests resolve `astro:content`,
// `astro:assets`, and the font CSS variables exactly as the build does.
export default getViteConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // json-summary is included because the `text` reporter renders no per-file
      // rows on Windows (absolute-path quirk); the totals and thresholds it
      // reports are correct, but per-file numbers have to be read from the JSON.
      reporter: ['text', 'json-summary', 'lcov'],
      // Only the pure logic is held to a coverage bar. .astro components are
      // covered by the component tests, but v8 cannot instrument them meaningfully.
      include: ['src/lib/*.ts', 'src/data/*.ts'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
