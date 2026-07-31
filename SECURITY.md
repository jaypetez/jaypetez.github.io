# Security Policy

## Scope

This repository builds a static website. There is no server, no database, no authentication, and no
user input handling, so the realistic attack surface is small. The things that would matter:

- A supply-chain compromise in a build dependency or a GitHub Action.
- A vulnerability in the deployment workflow that could let someone publish to
  <https://jaypetez.github.io/>.
- Cross-site scripting through injected markup in content rendering.
- Leaked secrets or overly broad workflow permissions.

Reports about the *content* of the site (opinions, factual errors, typos) aren't security issues.
Public issues are restricted to collaborators on this repo, so please don't route those through the
advisory form either — it's for vulnerabilities.

## Supported versions

Only the currently deployed site, built from `main`, is supported. There are no releases or
maintained branches.

## Reporting a vulnerability

Please report privately rather than opening a public issue:

**<https://github.com/jaypetez/jaypetez.github.io/security/advisories/new>**

Include what you found, how to reproduce it, and what an attacker could achieve. If you have a
suggested fix, that's welcome but not required.

## What to expect

- Acknowledgement within **7 days**.
- An assessment and intended fix, or an explanation of why it's out of scope, within **30 days**.
- Credit in the advisory when it's resolved, unless you'd rather stay anonymous.

Since this is a personal project maintained in spare time, please don't expect same-day turnaround.
I'd rather set a realistic expectation than a flattering one.

## Hardening already in place

- Every GitHub Action is pinned to a commit SHA, not a mutable tag.
- Workflows run with `permissions: contents: read` at the top level; the deploy job opts into the
  narrower `pages: write` and `id-token: write` scopes only where needed.
- `step-security/harden-runner` audits egress on every job.
- Dependabot tracks both npm packages and Actions, and secret scanning with push protection is
  enabled on the repository.
- Deployment is gated on the full test suite passing.
