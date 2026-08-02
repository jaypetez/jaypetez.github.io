/**
 * The public projects listed on the home page.
 *
 * Hand-curated on purpose: descriptions here are edited for the page rather than
 * pulled from the GitHub API at build time, so the copy stays tight and in my
 * voice. Every field is asserted by tests/unit/projects.test.ts.
 */

export const LICENSES = ['MIT', 'Apache-2.0'] as const;
export type License = (typeof LICENSES)[number];

export interface Project {
  /** Repository name, used verbatim as the display label. */
  readonly name: string;
  /** One or two sentences saying what it actually does. */
  readonly description: string;
  readonly language: string;
  readonly license: License;
  /** Canonical repository URL. */
  readonly repo: string;
  /** Optional hosted documentation, shown as a secondary link. */
  readonly docs?: string;
  /** Omitted when zero — an unadorned "0" is noise, not information. */
  readonly stars?: number;
}

export const projects: readonly Project[] = [
  {
    name: 'glean',
    description:
      'A self-hosted personal agent that pulls signal out of RSS, scraping, search, and APIs, runs it through the LLM of your choice, and delivers the result on a schedule to whatever sink you wire up.',
    language: 'Python',
    license: 'MIT',
    repo: 'https://github.com/jaypetez/glean',
    stars: 6,
  },
  {
    name: 'ollama-mobile',
    description:
      'An Android app for Ollama. It embeds llama.cpp to run GGUF models on the phone, works as a full client for a server on your LAN, and can expose its own Ollama-compatible API — routing each request to whichever is already warm.',
    language: 'Kotlin',
    license: 'MIT',
    repo: 'https://github.com/jaypetez/ollama-mobile',
  },
  {
    name: 'stride',
    description:
      'An agentic Strava coach. It reads your training history and tells you what to run next, rather than just plotting what you already did.',
    language: 'TypeScript',
    license: 'Apache-2.0',
    repo: 'https://github.com/jaypetez/stride',
  },
  {
    name: 'sidekick',
    description:
      'An AI sidekick you can point at your own work. Speaks MCP, so it picks up whatever tools and context you give it.',
    language: 'Python',
    license: 'MIT',
    repo: 'https://github.com/jaypetez/sidekick',
  },
  {
    name: 'agent-gpu',
    description:
      'A distributed inference layer for Ollama. Forwards agent requests to remote GPU-backed Ollama instances behind one clean API, so open models can run anywhere on your network.',
    language: 'Go',
    license: 'MIT',
    repo: 'https://github.com/jaypetez/agent-gpu',
    docs: 'https://jaypetez.github.io/agent-gpu/',
  },
  {
    name: 'gbrain-copilot',
    description: "Garry's Opinionated Agent Brain, ported to the GitHub Copilot CLI.",
    language: 'TypeScript',
    license: 'MIT',
    repo: 'https://github.com/jaypetez/gbrain-copilot',
  },
];
