---
name: dependabot-sweep
description: Fix and merge every open Dependabot PR across all of jaypetez's public repos in one run. Use when asked to clear, sweep, merge, or fix Dependabot or dependency-bump PRs, in one repo or all of them. Runs the repos in parallel and each repo's PRs one at a time; fixes red CI on the PR branch; merges only once CI is green; then cuts a patch-version bump per repo.
argument-hint: '[--repo <name>]... [--dry-run]'
---

# Dependabot sweep

The goal is zero open Dependabot PRs in every public, non-archived, non-fork repo owned by `jaypetez`,
with every merge backed by green CI. The sweep runs unattended. It stops to ask only if `gh` auth is
broken.

Arguments: `--repo <name>` (repeatable) limits the sweep to those repos, and `--dry-run` stops after step 1.

## The one rule

**`--admin` gets past reviews, signed-commit rules and last-push approval. It never gets past CI.**
Before every `gh pr merge --admin`, run `scripts/gate.mjs` and pass the sha it prints to
`--match-head-commit`. If the gate prints `FAIL`, don't merge. If a push lands between the gate and the
merge, the sha won't match and GitHub rejects the merge. That rejection is the point of the check.

## 1. Preflight

```bash
gh auth status            # needs the repo and workflow scopes, as jaypetez
node .claude/skills/dependabot-sweep/scripts/inventory.mjs [--repo <name>]...
```

Show the user the table. It lists, for each repo, the required checks, whether branches must be up to
date, how many reviews are required, and whether commits must be signed. PRs come back in sweep order:
GitHub Actions bumps, then grouped updates, then single packages, then majors (oldest first within each).
Flags: `MAJOR` is a semver-major bump, and `touched` means someone other than Dependabot has committed
to the branch. On a `touched` branch Dependabot ignores `@dependabot rebase`.

With `--dry-run`, stop here.

## 2. Fan out

Re-run the inventory with `--json`. Start **one `general-purpose` Agent per repo, all in a single message**
so the repos run in parallel. Each agent's prompt needs:

- the repo's entry from the JSON (base branch, rules and ordered PRs);
- the absolute path of this skill's `scripts/` folder, and the full text of sections 3 to 5 below;
- its clone path, `<scratchpad>/dependabot-sweep/<repo>`, written out as an absolute path. Agents never
  touch this repo's working tree, and this repo's own sweep uses a clone too;
- the commit trailer from the current system reminder (`Co-Authored-By: ...`);
- the instruction to return the per-PR outcome table from section 6 and nothing else.

Within one repo the work is strictly sequential. In a repo that requires up-to-date branches, merging one
PR puts the next one behind, so running a repo's PRs in parallel only makes them race.

## 3. Per-PR loop

For each PR, in inventory order:

1. **Refresh.** Get the current state with
   `gh pr view <n> -R jaypetez/<repo> --json state,mergeStateStatus,mergeable,headRefOid,commits`.
   - If the PR is closed, Dependabot superseded it. Record `superseded` and move on.
   - If the title no longer matches, Dependabot rewrote the PR. Carry on with it.
2. **Bring it up to date** if `mergeStateStatus` is `BEHIND` and the repo requires up-to-date branches, or if
   `mergeable` is `CONFLICTING`:
   - Untouched branch: comment `@dependabot rebase`, or `@dependabot recreate` if it conflicts. Then poll
     every 30s, for up to 10 minutes, until `headRefOid` changes.
   - Touched branch: `gh pr update-branch <n> -R jaypetez/<repo> --rebase`. If that fails on a conflict,
     resolve it in the clone (step 5) and push. Don't force-push someone else's work. A rebase of the
     sweep's own fix commits is the one case where `--force-with-lease` is allowed.
3. **Wait for CI.** Run `gh pr checks <n> -R jaypetez/<repo> --watch --fail-fast --interval 30` with Bash
   `run_in_background`, and give up after 30 minutes. A PR that reports no checks after 5 minutes is
   suspicious. Look at `gh run list -R jaypetez/<repo> --branch <head>` before deciding.
   A run stuck in `action_required` won't start by itself. Report it as `left open` rather than approving
   workflow runs.
4. **Green: approve and merge.**
   ```bash
   node <scripts>/gate.mjs <repo> <n>                  # must print PASS <sha>
   gh pr review <n> -R jaypetez/<repo> --approve        # only if reviews are required and it isn't APPROVED
   gh pr merge  <n> -R jaypetez/<repo> --squash --admin --match-head-commit <sha>
   gh pr view   <n> -R jaypetez/<repo> --json state --jq .state   # must be MERGED
   ```
   If the merge is rejected because the head moved, go back to 3.
5. **Red: fix it.**
   1. Find the failure: `gh pr checks <n> -R jaypetez/<repo>`, then
      `gh run view <run-id> -R jaypetez/<repo> --log-failed`. Read the actual error before changing anything.
   2. Prepare the clone. Clone if it's missing (`gh repo clone jaypetez/<repo> <clone>`). Then
      `git -C <clone> fetch origin` and `git -C <clone> switch -C <head> origin/<head>`.
   3. Read the repo's `CLAUDE.md`, `AGENTS.md` and `CONTRIBUTING.md` (whichever exist) and the failing
      workflow under `.github/workflows/`. They tell you the package manager and the exact lint, type-check,
      test and build commands. Install with the lockfile, the way CI does (`npm ci`,
      `pnpm install --frozen-lockfile`, `uv sync`, `go mod download`).
   4. Fix the cause, not the symptom. Typical causes are a changed API in the bumped package, new lint or
      type rules, a stale snapshot, or a lockfile or `go.sum` that needs regenerating. Reproduce the failure
      locally, fix it, and re-run the same commands until they pass.
   5. Commit with the same prefix Dependabot uses in that repo (`build:`, `ci:`, `chore(deps):`, ...), in
      lowercase with no trailing period, and end the message with the trailer. Push with
      `git -C <clone> push origin HEAD:<head>`, which is a plain push. The branch is now `touched`.
   6. Go back to 3. **After the third failed fix**, stop. Comment on the PR what failed and what you tried,
      leave it open, record `left open: <reason>`, and move to the next PR.

   Some failures can't be fixed on the branch. If the bump is a major with no migration path, or it needs
   a peer that hasn't released yet, comment on the PR saying why and record `left open`. Don't close it.

## 4. Never

- Merge a PR that isn't authored by `app/dependabot`. The only exception is the sweep's own version bump,
  which is gated with `--own`.
- Merge while the gate prints `FAIL`, or without `--match-head-commit`.
- Make a check pass by editing CI workflows, skipping or deleting tests, lowering coverage thresholds, or
  adding `ignore` entries to `dependabot.yml`. If ignoring a dependency is the right call, say so in the
  report and let the user decide.
- Push to the default branch, push tags, or publish releases.
- Use `gh pr merge --auto`. Auto-merge is off in some repos, and it would merge without the gate.

## 5. Version bump

Only in a repo where at least one PR merged. After the last PR is handled, branch from the updated base
(`chore/dependency-sweep-<yyyy-mm-dd>`) in the clone and follow that repo's own release convention, as
its `CLAUDE.md`, `AGENTS.md` or `CONTRIBUTING.md` describes it:

- **Changesets** (a `.changeset/` folder, like stride): add a `patch` changeset naming the merged PRs for
  each package the bumps touched. Don't run `changeset version` yourself if a release workflow does that.
- **A `version` field** in `package.json` or `pyproject.toml`: bump the patch version. Add a CHANGELOG entry
  if the repo keeps one. Update the lockfile if it records the version (`npm install --package-lock-only`).
- **Tag-based** (a Go module, goreleaser, no version field): don't bump anything. Record
  `release pending: tag vX.Y.Z+1` in the report.

Use `build: bump version to X.Y.Z for the dependency sweep` as the title and commit message. Use
jaypetez.github.io #38 as the model for the body: one line that lists the merged PR numbers, then the PR
attribution line from the system reminder. Open the PR with `gh pr create`, wait for CI as in step 3, gate
it with `gate.mjs <repo> <n> --own`, and squash-merge with `--admin --match-head-commit`. Skip the
approval step here, because GitHub won't let you approve your own PR. `--admin` covers the review rule.

## 6. Report

Each agent returns one table:

| PR | Title | Outcome |
| --- | --- | --- |
| #164 | Bump @hono/node-server 2.1.4 → 2.1.5 | merged |
| #158 | Bump the dev-dependencies group | fixed + merged (vitest 5 config rename) |
| #157 | Bump upload-sarif 4.38.3 → 4.39.0 | superseded |
| #161 | Bump @anthropic-ai/sdk 0.133 → 0.135 | left open: 3 fixes failed, see PR comment |
| — | Version bump | #170 merged (1.4.3) |

Combine the tables under one heading per repo. End with a short **Needs you** list covering every
`left open` item and every `release pending` tag. Finish by re-running the inventory: the number of open
PRs should equal the number marked `left open`, plus any PRs Dependabot opened during the sweep.
