import { describe, expect, it } from 'vitest';
import { LICENSES, projects } from '../../src/data/projects';

describe('projects data', () => {
  it('lists every public project', () => {
    expect(projects.map((p) => p.name)).toEqual([
      'glean',
      'ollama-mobile',
      'stride',
      'sidekick',
      'agent-gpu',
      'gbrain-copilot',
    ]);
  });

  it('has no duplicate names', () => {
    expect(new Set(projects.map((p) => p.name)).size).toBe(projects.length);
  });

  it.each(projects.map((p) => [p.name, p] as const))('%s has required fields', (_name, project) => {
    expect(project.name).toMatch(/^[a-z0-9-]+$/);
    expect(project.language.length).toBeGreaterThan(0);
    expect(LICENSES).toContain(project.license);
  });

  it.each(projects.map((p) => [p.name, p] as const))(
    '%s repo URL points at the right owner over https',
    (_name, project) => {
      const url = new URL(project.repo);
      expect(url.protocol).toBe('https:');
      expect(url.host).toBe('github.com');
      expect(url.pathname).toBe(`/jaypetez/${project.name}`);
    },
  );

  it.each(projects.map((p) => [p.name, p] as const))(
    '%s description is a real sentence, not a stub',
    (_name, project) => {
      // Long enough to say something; short enough not to become a paragraph.
      expect(project.description.length).toBeGreaterThanOrEqual(40);
      expect(project.description.length).toBeLessThanOrEqual(260);
      expect(project.description.trimEnd()).toMatch(/[.!?]$/);
      expect(project.description.toLowerCase()).not.toContain('lorem ipsum');
    },
  );

  it('only records a star count when there is one worth showing', () => {
    for (const project of projects) {
      if (project.stars !== undefined) {
        expect(project.stars).toBeGreaterThan(0);
      }
    }
  });

  it('links docs over https when a project has them', () => {
    const documented = projects.filter((p) => p.docs !== undefined);
    // agent-gpu publishes a Pages site; the rest do not.
    expect(documented.map((p) => p.name)).toEqual(['agent-gpu']);
    for (const project of documented) {
      expect(new URL(project.docs!).protocol).toBe('https:');
    }
  });
});
