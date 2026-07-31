import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The anti-slop guard.
 *
 * A design system written in a document is a suggestion. These assertions turn
 * the refusals into build failures, so drift has to be argued with explicitly
 * rather than happening by accident six months from now.
 *
 * Each rule maps to a documented tell of generic AI-generated web design:
 * the Inter default, the purple-to-blue gradient, and the grid of identically
 * rounded cards.
 */

const ROOT = process.cwd();
const GLOBAL_CSS = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');

/** Every stylesheet and every scoped <style> block in the project. */
function allStyleSources(): { file: string; css: string }[] {
  const out: { file: string; css: string }[] = [];
  const entries = readdirSync(join(ROOT, 'src'), { recursive: true, encoding: 'utf8' });

  for (const entry of entries) {
    if (!/\.(css|astro)$/.test(entry)) continue;
    const file = join('src', entry);
    const text = readFileSync(join(ROOT, file), 'utf8');

    if (file.endsWith('.css')) {
      out.push({ file, css: text });
      continue;
    }
    for (const block of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      out.push({ file, css: block[1]! });
    }
  }
  return out;
}

const styles = allStyleSources();

/** Strips comments so a rule named in prose doesn't trip its own assertion. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// ---------------------------------------------------------------- contrast ---

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

function luminance(hex: string): number {
  const parts = hex.replace('#', '').match(/../g);
  if (!parts || parts.length < 3) throw new Error(`Cannot parse colour: ${hex}`);
  const [r, g, b] = parts.map((h) => parseInt(h, 16)) as [number, number, number];
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Reads a token from a specific block of global.css. The light tokens live in
 * `:root {}` and the dark ones in `:root[data-theme='dark'] {}`.
 */
function token(name: string, selector: string): string {
  const block = GLOBAL_CSS.split(selector)[1]?.split('}')[0] ?? '';
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`Token --${name} not found in ${selector}`);
  return match[1]!;
}

const LIGHT = {
  bg: token('color-bg', ':root {'),
  fg: token('color-fg', ':root {'),
  muted: token('color-muted', ':root {'),
  accent: token('color-accent', ':root {'),
};

const DARK = {
  bg: token('color-bg', ":root[data-theme='dark'] {"),
  fg: token('color-fg', ":root[data-theme='dark'] {"),
  muted: token('color-muted', ":root[data-theme='dark'] {"),
  accent: token('color-accent', ":root[data-theme='dark'] {"),
};

describe('colour contrast is computed, not eyeballed', () => {
  const pairs = [
    ['light body text', LIGHT.fg, LIGHT.bg],
    ['light muted text', LIGHT.muted, LIGHT.bg],
    ['light accent (links)', LIGHT.accent, LIGHT.bg],
    ['dark body text', DARK.fg, DARK.bg],
    ['dark muted text', DARK.muted, DARK.bg],
    ['dark accent (links)', DARK.accent, DARK.bg],
  ] as const;

  it.each(pairs)('%s clears WCAG AA (4.5:1)', (_label, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('holds body text to AAA (7:1), which is the actual target', () => {
    expect(contrast(LIGHT.fg, LIGHT.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(DARK.fg, DARK.bg)).toBeGreaterThanOrEqual(7);
  });
});

// -------------------------------------------------------------- anti-slop ---

describe('anti-slop rules', () => {
  it('uses no gradients anywhere — the loudest generic tell', () => {
    for (const { file, css } of styles) {
      expect(stripComments(css), `gradient found in ${file}`).not.toMatch(
        /(linear|radial|conic)-gradient/,
      );
    }
  });

  it('never falls back to Inter or a bare system sans-serif', () => {
    for (const { file, css } of styles) {
      const clean = stripComments(css);
      expect(clean, `Inter found in ${file}`).not.toMatch(/\bInter\b/);
      expect(clean, `system-ui sans stack found in ${file}`).not.toMatch(
        /font-family:[^;]*\b(system-ui|-apple-system|Helvetica|Arial)\b/,
      );
    }
  });

  it('sets border-radius only from the token scale', () => {
    const allowed = new Set(['0', 'var(--radius-none)', 'var(--radius-chip)']);
    for (const { file, css } of styles) {
      for (const decl of stripComments(css).matchAll(/border-radius:\s*([^;]+);/g)) {
        const value = decl[1]!.trim();
        expect(allowed, `${file} sets border-radius: ${value}`).toContain(value);
      }
    }
  });

  it('declares exactly one accent hue across both themes', () => {
    const hue = (hex: string) => {
      const [r, g, b] = hex
        .replace('#', '')
        .match(/../g)!
        .map((h) => parseInt(h, 16) / 255) as [number, number, number];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max === min) return 0;
      const d = max - min;
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return (((h * 60) % 360) + 360) % 360;
    };
    // Same hue family in both themes, so it reads as one colour that adapts.
    expect(Math.abs(hue(LIGHT.accent) - hue(DARK.accent))).toBeLessThanOrEqual(8);
  });

  it('honours prefers-reduced-motion', () => {
    expect(GLOBAL_CSS).toContain('prefers-reduced-motion');
  });

  it('keeps transitions short enough not to feel sluggish', () => {
    const duration = GLOBAL_CSS.match(/--duration:\s*(\d+)ms/);
    expect(duration).not.toBeNull();
    expect(Number(duration![1])).toBeLessThanOrEqual(200);
  });

  it('never removes a focus outline without providing one', () => {
    for (const { file, css } of styles) {
      const clean = stripComments(css);
      if (/outline:\s*(none|0)\b/.test(clean)) {
        expect(clean, `${file} clears outline without a :focus-visible replacement`).toMatch(
          /:focus-visible/,
        );
      }
    }
  });

  it('defines the spacing scale on an 8px base unit', () => {
    const spacing = [...GLOBAL_CSS.matchAll(/--space-(\d+):\s*([\d.]+)rem/g)];
    expect(spacing.length).toBeGreaterThan(4);
    for (const [, step, rem] of spacing) {
      // --space-N is N * 8px, i.e. N * 0.5rem.
      expect(Number(rem)).toBeCloseTo(Number(step) * 0.5, 5);
    }
  });

  it('caps the prose measure in the readable 65-75 character range', () => {
    const measure = GLOBAL_CSS.match(/--measure:\s*(\d+)ch/);
    expect(measure).not.toBeNull();
    expect(Number(measure![1])).toBeGreaterThanOrEqual(65);
    expect(Number(measure![1])).toBeLessThanOrEqual(75);
  });

  it('keeps body text at 16px or larger', () => {
    const base = GLOBAL_CSS.match(/--text-base:\s*([\d.]+)rem/);
    expect(base).not.toBeNull();
    expect(Number(base![1]) * 16).toBeGreaterThanOrEqual(16);
  });

  it('uses a fixed z-index scale rather than arbitrary values', () => {
    const zIndexes = [...GLOBAL_CSS.matchAll(/--z-[a-z]+:\s*(\d+)/g)].map((m) => Number(m[1]));
    expect(zIndexes.length).toBeGreaterThan(0);
    for (const z of zIndexes) expect(z).toBeLessThanOrEqual(50);

    for (const { file, css } of styles) {
      for (const decl of stripComments(css).matchAll(/z-index:\s*([^;]+);/g)) {
        expect(decl[1]!.trim(), `${file} hard-codes a z-index`).toMatch(/^var\(--z-/);
      }
    }
  });
});
