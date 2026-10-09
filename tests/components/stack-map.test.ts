import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import StackMap from '../../src/components/StackMap.astro';
import { projects } from '../../src/data/projects';
import { clients, hosts, router } from '../../src/data/stack';

/**
 * The stack map is a diagram and navigation at once, so it can break in two
 * ways: draw something that is not true (a box for a project that does not
 * exist), or lead nowhere (a link with no row to land on). These hold both,
 * plus the accessibility contract that makes the picture readable as text.
 */

let container: AstroContainer;
let html: string;

beforeAll(async () => {
  container = await AstroContainer.create();
  html = await container.renderToString(StackMap);
});

const known = new Set(projects.map((p) => p.name));
const projectNodes = [...clients, router, ...hosts].filter((node) => node.kind === 'project');

describe('StackMap', () => {
  it('is a captioned figure, so the diagram has a description in words', () => {
    expect(html).toMatch(/<figure[^>]*>/);
    expect(html).toMatch(/<figcaption[^>]*>\s*The stack as deployed/);
  });

  it('only draws projects that exist in the Work list', () => {
    for (const node of projectNodes) {
      expect(known, `${node.project} is not in projects.ts`).toContain(node.project);
    }
  });

  it('links every project box to its row in the Work list, and nothing else', () => {
    const links = [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1]!);
    expect(links).toEqual(projectNodes.map((node) => `#project-${node.project}`));
  });

  it('draws hardware and other people’s software dashed, and does not link it', () => {
    const external = hosts.filter((node) => node.kind === 'external');
    expect(external.length).toBeGreaterThan(0);
    const dashed = [...html.matchAll(/<span class="node external"/g)];
    expect(dashed).toHaveLength(external.length);
  });

  it('says in the caption what the dashed boxes mean, so the convention is not visual only', () => {
    expect(html).toMatch(/dashed boxes are/i);
  });

  it('labels each tier as a list, so a screen reader hears the structure', () => {
    expect(html).toMatch(/<ul[^>]*aria-label="Clients"/);
    expect(html).toMatch(/<ul[^>]*aria-label="Where the models run"/);
  });

  it('adds no heading, so the home page keeps its one h1 and its outline', () => {
    expect(html).not.toMatch(/<h[1-6][\s>]/);
  });
});
