/**
 * The stack the home page draws: which projects call which, as deployed.
 *
 * Kept apart from projects.ts because it describes relationships, not
 * projects. Every `project` here must name an entry in projects.ts
 * (tests/components/stack-map.test.ts holds that), so the map can never point
 * at something the Work list does not have. gbrain-copilot is deliberately
 * absent: it runs inside the Copilot CLI, not through agent-gpu.
 */

/** A box that is one of my projects, and links to its row in the Work list. */
export interface ProjectNode {
  readonly kind: 'project';
  readonly project: string;
  /** What it does in the stack, in a few words. */
  readonly role: string;
}

/** A box that is hardware or someone else's software: drawn dashed, not a link. */
export interface ExternalNode {
  readonly kind: 'external';
  readonly name: string;
  readonly role: string;
}

export type StackNode = ProjectNode | ExternalNode;

/** The agents that send requests, left to right. */
export const clients: readonly ProjectNode[] = [
  { kind: 'project', project: 'glean', role: 'feeds + LLM' },
  { kind: 'project', project: 'stride', role: 'run coach' },
  { kind: 'project', project: 'sidekick', role: 'MCP tools' },
  { kind: 'project', project: 'ideaforge', role: 'interviewer' },
];

/** The one layer every request passes through. */
export const router: ProjectNode = {
  kind: 'project',
  project: 'agent-gpu',
  role: 'one API for the fleet',
};

/** Where the models actually run. */
export const hosts: readonly StackNode[] = [
  { kind: 'external', name: 'GPU box', role: 'Ollama' },
  { kind: 'external', name: 'GPU box', role: 'Ollama' },
  { kind: 'project', project: 'ollama-mobile', role: 'on a phone' },
];
