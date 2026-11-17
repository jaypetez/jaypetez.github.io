#!/usr/bin/env node
/**
 * The one check that decides whether a PR may be merged with `--admin`.
 * `--admin` gets past review, signature and last-push rules; it must never get
 * past CI. This script is what makes sure it doesn't. Read-only.
 *
 *   node .claude/skills/dependabot-sweep/scripts/gate.mjs <repo> <pr>
 *   node .claude/skills/dependabot-sweep/scripts/gate.mjs <repo> <pr> --own
 *
 * `--own` is for the sweep's own version-bump PR: it accepts a PR authored by
 * the authenticated user instead of Dependabot.
 *
 * Exit 0 prints `PASS <headSha>`; pass that sha to
 * `gh pr merge --match-head-commit`. Exit 1 prints `FAIL` and the reasons.
 */

import { DEPENDABOT, OWNER, PASSING, branchRules, checkState, gh, ghJson } from './lib.mjs';

const [repo, number, ...flags] = process.argv.slice(2);
if (!repo || !/^\d+$/.test(number ?? '')) {
  console.error('usage: gate.mjs <repo> <pr> [--own]');
  process.exit(2);
}

const pr = ghJson([
  'pr',
  'view',
  number,
  '-R',
  `${OWNER}/${repo}`,
  '--json',
  'author,state,isDraft,baseRefName,headRefOid,mergeStateStatus,mergeable,statusCheckRollup',
]);
const rules = branchRules(repo, pr.baseRefName);
const problems = [];

const expectedAuthor = flags.includes('--own')
  ? gh(['api', 'user', '--jq', '.login']).trim()
  : DEPENDABOT;
if (pr.author.login !== expectedAuthor) {
  problems.push(`author is ${pr.author.login}, expected ${expectedAuthor}`);
}
if (pr.state !== 'OPEN') problems.push(`state is ${pr.state}`);
if (pr.isDraft) problems.push('PR is a draft');
if (pr.mergeable === 'CONFLICTING') problems.push('merge conflict with base');
if (rules.strict && pr.mergeStateStatus === 'BEHIND') problems.push('branch is behind base');

// Re-runs leave older entries in the rollup; the newest one per name wins.
const latest = new Map();
for (const c of pr.statusCheckRollup ?? []) {
  const s = checkState(c);
  const at = c.completedAt || c.startedAt || '';
  const prev = latest.get(s.name);
  if (!prev || at >= prev.at) latest.set(s.name, { ...s, at });
}
const checks = [...latest.values()];

for (const name of rules.requiredChecks) {
  const c = latest.get(name);
  if (!c) problems.push(`required check "${name}" has not reported`);
  else if (c.result !== 'SUCCESS') problems.push(`required check "${name}" is ${c.result}`);
}
for (const c of checks) {
  if (rules.requiredChecks.includes(c.name)) continue;
  if (!c.done) problems.push(`check "${c.name}" is still ${c.result}`);
  else if (!PASSING.has(c.result)) problems.push(`check "${c.name}" is ${c.result}`);
}
if (checks.length === 0) problems.push('no checks have reported yet');

if (problems.length) {
  console.log('FAIL');
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`PASS ${pr.headRefOid}`);
