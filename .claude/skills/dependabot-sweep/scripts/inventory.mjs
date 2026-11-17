#!/usr/bin/env node
/**
 * Every open Dependabot PR across jaypetez's public, non-archived, non-fork
 * repos, with the branch rules that decide how each one can merge. Read-only.
 *
 *   node .claude/skills/dependabot-sweep/scripts/inventory.mjs
 *   node .claude/skills/dependabot-sweep/scripts/inventory.mjs --repo stride --repo sidekick
 *   node .claude/skills/dependabot-sweep/scripts/inventory.mjs --json
 *
 * PRs come back in sweep order: GitHub Actions, then grouped updates, then
 * single packages, then majors, oldest first within each.
 */

import { DEPENDABOT, OWNER, branchRules, ghJson } from './lib.mjs';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const only = argv.flatMap((a, i) => (argv[i - 1] === '--repo' ? [a] : []));

const PR_FIELDS = 'number,title,headRefName,mergeStateStatus,mergeable,reviewDecision,url';

function ecosystem(branch) {
  // dependabot/<ecosystem>/<rest>; npm shows up as npm_and_yarn.
  return branch.split('/')[1] ?? 'unknown';
}

function describe(pr) {
  const bodies = pr.commits.map((c) => c.messageBody).join('\n');
  const authors = pr.commits.flatMap((c) => c.authors.map((a) => a.login));
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    branch: pr.headRefName,
    ecosystem: ecosystem(pr.headRefName),
    grouped: /dependency-group:/.test(bodies),
    major: /update-type: version-update:semver-major/.test(bodies),
    // Once anyone else commits, Dependabot refuses `@dependabot rebase`.
    touched: authors.some((login) => login !== 'dependabot[bot]'),
    mergeState: pr.mergeStateStatus,
    mergeable: pr.mergeable,
    review: pr.reviewDecision || 'NONE',
  };
}

function rank(pr) {
  if (pr.major) return 3;
  if (pr.ecosystem === 'github_actions') return 0;
  return pr.grouped ? 1 : 2;
}

const repos = ghJson([
  'repo',
  'list',
  OWNER,
  '--visibility',
  'public',
  '--source',
  '--no-archived',
  '--limit',
  '200',
  '--json',
  'name,defaultBranchRef',
])
  .filter((r) => only.length === 0 || only.includes(r.name))
  .sort((a, b) => a.name.localeCompare(b.name));

const unknown = only.filter((name) => !repos.some((r) => r.name === name));
if (unknown.length) {
  console.error(`Not a public source repo of ${OWNER}: ${unknown.join(', ')}`);
  process.exit(2);
}

const inventory = [];
for (const repo of repos) {
  const prs = ghJson([
    'pr',
    'list',
    '-R',
    `${OWNER}/${repo.name}`,
    '--author',
    DEPENDABOT,
    '--state',
    'open',
    '--limit',
    '100',
    '--json',
    PR_FIELDS,
  ])
    // Commits are fetched per PR: asking for them in the list query trips
    // GitHub's GraphQL node limit once a repo has a few dozen PRs.
    .map((pr) => ({
      ...pr,
      commits: ghJson([
        'pr',
        'view',
        String(pr.number),
        '-R',
        `${OWNER}/${repo.name}`,
        '--json',
        'commits',
      ]).commits,
    }))
    .map(describe)
    .sort((a, b) => rank(a) - rank(b) || a.number - b.number);
  if (prs.length === 0) continue;

  const base = repo.defaultBranchRef.name;
  inventory.push({ repo: repo.name, base, rules: branchRules(repo.name, base), prs });
}

if (asJson) {
  console.log(JSON.stringify(inventory, null, 2));
  process.exit(0);
}

if (inventory.length === 0) {
  console.log('No open Dependabot PRs.');
  process.exit(0);
}

let total = 0;
for (const { repo, base, rules, prs } of inventory) {
  total += prs.length;
  const checks = rules.requiredChecks.length
    ? rules.requiredChecks.join(', ')
    : 'none (all checks must pass)';
  console.log(`\n${repo} (${base}): ${prs.length} PR(s)`);
  console.log(
    `  required: ${checks}; up-to-date: ${rules.strict ? 'yes' : 'no'}; ` +
      `reviews: ${rules.reviewsRequired}; signed: ${rules.signatures ? 'yes' : 'no'}`,
  );
  for (const pr of prs) {
    const flags = [
      pr.ecosystem,
      pr.grouped && 'group',
      pr.major && 'MAJOR',
      pr.touched && 'touched',
    ]
      .filter(Boolean)
      .join(' ');
    console.log(`  #${pr.number}  ${pr.mergeState.padEnd(9)} [${flags}]  ${pr.title}`);
  }
}
console.log(`\n${total} open Dependabot PR(s) in ${inventory.length} repo(s).`);
