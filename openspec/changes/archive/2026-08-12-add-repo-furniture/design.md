## Context

`patterson-sh/templates/` is the nearest in-house source of furniture and was assessed KEEP/ADAPT in
`.tmp/staging/reuse/`. It cannot be copied verbatim: it ships a `package.json` and `.mjs` scripts,
both of which contradict this repository's zero-dependency, no-manifest, `node script.ts`
convention. Correction C4 also matters here: `patterson-corp`'s tracked size is 547 KB, not the
1.2 MB HANDOFF.md records -- that figure was a `du` block-size artifact -- so the budget check must
measure tracked bytes to be meaningful.

This change lands first in the sequential merge order (1B, then 1D, 1C, 1A), so `ci.yml` and
`verify-all.sh` become the surface later workstreams extend.

## Goals / Non-Goals

**Goals:**

- Governance files a contributor and a security reviewer can both act on.
- Invariants that are enforced by a machine, not asserted in prose.
- One gate-battery entry point the whole program can call.

**Non-Goals:**

- Choosing a licence.
- Duplicating the manifest-projection or security-scanning checks.
- Introducing any dependency, package manifest, or build step.

## Decisions

- **Adapt, don't copy, `patterson-sh/templates/`.** The templates' Node tooling assumes a package
  manifest. Rewriting the checks as erasable TypeScript keeps a single runtime rule across the repo.
- **Measure tracked bytes.** `git ls-files` plus per-file sizes, not `du`. C4 showed `du` overstates
  by more than a factor of two on this tree, which would make a 1 MiB budget fire spuriously.
- **`secret_scanning.yml` ships in this change, not in the security-scanning skill.** The skill
  provides the *template* for consumer repos; this repository needs its own file present before
  push protection is ever enabled, and the 2B checklist lists it as a pre-push gate.
- **Separate `ci.yml` from `manifest-sync.yml`.** Two workstreams merging into the same workflow
  file would conflict; splitting them keeps the merge order mechanical.
- **`verify-all.sh` in POSIX sh.** It orchestrates other scripts and greps; a shell script is the
  honest tool and runs identically under the Bash tool's zsh and in CI.
- **Hooks stay advisory where the standard is undefined.** The container base-image list is open
  question #3, so the pre-commit hook does not enforce it.

## Risks / Trade-offs

- A pre-commit hook that runs every suite is slower than one that runs a subset. Accepted: theme and
  token drift is exactly the class of error that only a full round-trip catches, and the suites are
  small.
- Shipping CI workflows that nobody can run until Daniel pushes means they are unexercised at
  authoring time. Mitigated by making every CI step a call into a script that is exercised locally
  by `verify-all.sh`.
- Omitting `LICENSE` leaves manifests declaring `UNLICENSED`, which will read as an oversight to an
  outside consumer. Accepted deliberately and recorded, because guessing a licence for a healthcare
  distributor's published artifacts is a legal decision, not an engineering one.
