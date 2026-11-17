/**
 * Shared `gh` helpers for inventory.mjs and gate.mjs. Read-only: nothing here
 * writes to GitHub.
 */

import { execFileSync } from 'node:child_process';

export const OWNER = 'jaypetez';
export const DEPENDABOT = 'app/dependabot';

export function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export function ghJson(args) {
  return JSON.parse(gh(args));
}

/**
 * The rules that apply to a branch, flattened from every active ruleset and
 * classic branch protection. `gh api .../rules/branches/<b>` covers rulesets;
 * classic protection is read separately and merged in, because some repos still
 * use it.
 */
export function branchRules(repo, branch) {
  const rules = {
    requiredChecks: [],
    strict: false,
    reviewsRequired: 0,
    signatures: false,
    mergeMethods: null,
  };

  for (const rule of ghJson(['api', `repos/${OWNER}/${repo}/rules/branches/${branch}`])) {
    const p = rule.parameters ?? {};
    if (rule.type === 'required_status_checks') {
      rules.requiredChecks.push(...p.required_status_checks.map((c) => c.context));
      rules.strict ||= Boolean(p.strict_required_status_checks_policy);
    } else if (rule.type === 'pull_request') {
      rules.reviewsRequired = Math.max(
        rules.reviewsRequired,
        p.required_approving_review_count ?? 0,
      );
      rules.mergeMethods = p.allowed_merge_methods ?? rules.mergeMethods;
    } else if (rule.type === 'required_signatures') {
      rules.signatures = true;
    }
  }

  try {
    const prot = ghJson(['api', `repos/${OWNER}/${repo}/branches/${branch}/protection`]);
    const checks = prot.required_status_checks;
    if (checks) {
      rules.requiredChecks.push(...(checks.contexts ?? []));
      rules.strict ||= Boolean(checks.strict);
    }
    const reviews = prot.required_pull_request_reviews?.required_approving_review_count ?? 0;
    rules.reviewsRequired = Math.max(rules.reviewsRequired, reviews);
    rules.signatures ||= Boolean(prot.required_signatures?.enabled);
  } catch {
    // 404: no classic protection on this branch.
  }

  rules.requiredChecks = [...new Set(rules.requiredChecks)];
  return rules;
}

/** Normalise a statusCheckRollup entry (CheckRun or StatusContext). */
export function checkState(c) {
  if (c.__typename === 'StatusContext') {
    return {
      name: c.context,
      done: c.state !== 'PENDING' && c.state !== 'EXPECTED',
      result: c.state,
    };
  }
  return { name: c.name, done: c.status === 'COMPLETED', result: c.conclusion ?? c.status };
}

export const PASSING = new Set(['SUCCESS', 'NEUTRAL', 'SKIPPED']);
