import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ProjectRow from '../../src/components/ProjectRow.astro';
import { projects, type Project } from '../../src/data/projects';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (project: Project) => container.renderToString(ProjectRow, { props: { project } });

const glean = projects.find((p) => p.name === 'glean')!;
const agentGpu = projects.find((p) => p.name === 'agent-gpu')!;
const sidekick = projects.find((p) => p.name === 'sidekick')!;

describe('ProjectRow', () => {
  it('renders the name, description, and metadata', async () => {
    const html = await render(glean);
    expect(html).toContain('glean');
    expect(html).toContain('Python');
    expect(html).toContain('MIT');
    expect(html).toContain(glean.repo);
  });

  it('adds rel="noopener" to the outbound repository link', async () => {
    expect(await render(glean)).toMatch(/rel="noopener"/);
  });

  it('gives the star count a text label, so the glyph is not the only signal', async () => {
    const html = await render(glean);
    expect(html).toContain('GitHub stars:');
    expect(html).toContain('6');
    // The decorative star glyph itself is hidden from assistive tech, so the
    // count is never announced as "star 6".
    expect(html).toMatch(/<span aria-hidden="true"[^>]*>&#9733;<\/span>/);
  });

  it('omits the star block entirely when there are no stars', async () => {
    const html = await render(sidekick);
    expect(html).not.toContain('GitHub stars:');
  });

  it('shows a docs link only for projects that publish docs', async () => {
    expect(await render(agentGpu)).toContain(agentGpu.docs!);
    expect(await render(glean)).not.toContain('>Docs<');
  });

  it('renders a heading rather than a bare div, so the page has structure', async () => {
    expect(await render(glean)).toMatch(/<h3[^>]*>/);
  });
});
