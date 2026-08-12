## Why

`patterson-corp` is about to become the canonical Patterson plugin marketplace, but it has none of
the governance files a consumer or a contributor expects. HANDOFF.md 1B ("Repo furniture for
`patterson-corp`") enumerates the gap: contribution and conduct policy, a security policy, code
ownership, issue and pull-request templates, Copilot configuration, git hooks, and a CI workflow
that actually enforces the repository's stated invariants -- manifest validity, all test suites,
the size budget, and the no-binaries rule.

Two of these are not cosmetic. `.github/secret_scanning.yml` must exist before push protection is
ever enabled, because `plugins/patterson-engineering/hooks/tests/` contains deliberately synthetic
AWS keys and connection strings (HANDOFF.md 1A warning, and item 4 of the 2B pre-push checklist).
And the 1 MiB size budget only means something if CI measures it: the predecessor repository
reached 96 MB before anyone noticed.

## What Changes

- Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `CODEOWNERS`.
- Add `.github/ISSUE_TEMPLATE/` with bug, feature, **new-plugin-proposal**, and
  **new-skill-proposal** forms plus a `config.yml`.
- Add `.github/pull_request_template.md` carrying the CI/CD standard's two-approver requirement.
- Add `.github/copilot-instructions.md` and `.github/copilot-setup-steps.yml`.
- Add `.github/secret_scanning.yml` excluding `plugins/patterson-engineering/hooks/tests/`.
- Add `.githooks/pre-commit` and `.pre-commit-config.yaml` running every test suite and
  `verify-theme.sh`, so token/CSS drift cannot land.
- Add `.github/workflows/ci.yml` validating manifests, running all suites, asserting the
  **tracked-byte 1 MiB budget**, and asserting no binaries.
- Add validators `scripts/check-size.ts` and `scripts/check-no-binaries.ts` (tests first), plus
  `scripts/verify-all.sh` as the single gate-battery entry point.
- Add `.devcontainer/devcontainer.json` on a pinned `node:24`-family image.
- Upgrade `README.md` to the cross-cutting house style.

Sources are adapted, not copied, from `patterson-sh/templates/` -- its `package.json` and `.mjs`
files violate this repository's zero-dependency, no-manifest convention.

## Capabilities

### New Capabilities

- `repo-governance/furniture`: the contributor-facing and CI-facing governance surface of a
  Patterson marketplace repository -- policy documents, issue and PR templates, secret-scanning
  exclusions, git hooks, and the CI-enforced size, binary, and test invariants.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **`LICENSE` stays absent.** Manifests currently say `UNLICENSED` and legal must rule before
  publishing (HANDOFF.md open question #2, and item 3 of the 2B checklist). Adding a licence file
  is explicitly blocked, not forgotten; it is recorded for the morning report.
- **No manifest projection.** `.github/plugin/marketplace.json` and its divergence check belong to
  `add-cross-vendor-manifest-projection`; `ci.yml` here does not duplicate that check.
- **No security-scanning workflows.** CodeQL, Dependabot, and the security-control templates belong
  to `add-github-security-scanning`. This change ships only the repository's own
  `.github/secret_scanning.yml`.
- **No `package.json`, no `tsconfig.json`, no `node_modules`, no dependencies.** The
  `patterson-sh/templates/` originals are adapted away from these.
- **No pushing and no remote operations.** Workflows are committed; they only activate when Daniel
  pushes.
- **No enforcement of the container base-image list** -- open question #3 leaves it undefined, so
  the hook stays advisory.

## Impact

- Adds root-level policy files, a `.github/` tree, `.githooks/`, `.pre-commit-config.yaml`,
  `.devcontainer/`, and three files under `scripts/`.
- `scripts/verify-all.sh` becomes the gate battery that later workstreams and the final review call.
- The 1 MiB budget is asserted against **tracked bytes**, not `du` output -- per correction C4, the
  repository's tracked size is 547 KB and the earlier 1.2 MB figure was a block-size artifact.
- No plugin content changes.
