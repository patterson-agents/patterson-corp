# repo-governance/furniture Specification

## Purpose
Defines the governance and quality furniture a Patterson marketplace repository carries: the policy
documents contributors read, the templates that shape issues and pull requests, the secret-scanning
exclusion that keeps synthetic test credentials from blocking the repository's own authors, and the
CI-enforced invariants for size, binaries, and tests.
## Requirements
### Requirement: Contributor policy documents

The repository SHALL provide `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and
`CODEOWNERS` at the paths GitHub resolves them from.

#### Scenario: Contributor opens the repository

- **WHEN** a contributor views the repository on GitHub
- **THEN** the contributing guide, code of conduct, and security policy are surfaced by GitHub
- **AND** `CODEOWNERS` assigns a reviewing owner to every top-level path

#### Scenario: Contributing guide states the repository conventions

- **WHEN** a contributor reads `CONTRIBUTING.md`
- **THEN** it states the zero-dependency TypeScript rule, the `node:24` rule, conventional commits,
  the no-binaries rule, and the `${CLAUDE_PLUGIN_ROOT}`-stays-literal rule

### Requirement: Issue and pull-request templates

The repository SHALL provide `.github/ISSUE_TEMPLATE/` containing bug, feature,
new-plugin-proposal, and new-skill-proposal templates plus a `config.yml`, and
`.github/pull_request_template.md`.

#### Scenario: Proposing a new plugin

- **WHEN** a contributor opens a new issue
- **THEN** a new-plugin-proposal template and a new-skill-proposal template are offered alongside
  bug and feature templates

#### Scenario: Opening a pull request

- **WHEN** a contributor opens a pull request
- **THEN** the template presents the CI/CD standard's two-approver requirement as a checklist item

### Requirement: Secret scanning exclusion

The repository SHALL provide `.github/secret_scanning.yml` excluding
`plugins/patterson-engineering/hooks/tests/`, because those fixtures contain deliberately synthetic
AWS keys and connection strings.

#### Scenario: Push protection is enabled later

- **WHEN** secret scanning push protection is enabled on the repository
- **THEN** the excluded fixture path does not trigger a push block
- **AND** the exclusion file is already present in the default branch before enablement

### Requirement: Copilot configuration

The repository SHALL provide `.github/copilot-instructions.md` and
`.github/copilot-setup-steps.yml`.

#### Scenario: Copilot reads repository instructions

- **WHEN** GitHub Copilot loads repository-level instructions
- **THEN** `.github/copilot-instructions.md` conveys the same conventions as `CONTRIBUTING.md`
- **AND** `.github/copilot-setup-steps.yml` describes environment setup without introducing a
  package manifest or dependencies

### Requirement: Pre-commit gate

The repository SHALL provide `.githooks/pre-commit` and `.pre-commit-config.yaml` that run every
test suite and `verify-theme.sh` before a commit is created.

#### Scenario: Theme drift is staged

- **WHEN** a contributor stages a change that makes `assets/theme.css` diverge from the output of
  `build-theme.ts`
- **THEN** the pre-commit hook fails and prints the diff
- **AND** the commit is not created

#### Scenario: All checks pass

- **WHEN** a contributor stages a change that leaves every suite and the theme round-trip passing
- **THEN** the pre-commit hook exits `0` and the commit proceeds

### Requirement: CI enforces repository invariants

The repository SHALL provide `.github/workflows/ci.yml` that validates plugin manifests, runs every
test suite, asserts the tracked-byte size budget, and asserts that no binary files are tracked. It
SHALL pin `node:24`-family runtimes and SHALL NOT reference `node:20`.

#### Scenario: Tracked bytes exceed the budget

- **WHEN** CI measures the repository's tracked bytes and the total exceeds 1 MiB
- **THEN** the size check fails and reports the measured tracked-byte total
- **AND** the measurement is taken from tracked files, not from `du` block counts

#### Scenario: A binary file is committed

- **WHEN** CI encounters a tracked font, image, PDF, or Office file
- **THEN** the no-binaries check fails and names the offending path

#### Scenario: A manifest is invalid

- **WHEN** CI validates the plugin manifests and one is malformed
- **THEN** the workflow fails and names the manifest

### Requirement: Size and binary validators

The repository SHALL provide `scripts/check-size.ts` and `scripts/check-no-binaries.ts` as
zero-dependency TypeScript using `node:` builtins and erasable syntax only. Each SHALL exit `0`,
`1`, or `2` and emit findings as `LEVEL|file|line|rule|message`. Their tests SHALL be written before
their implementations.

#### Scenario: Size validator on a compliant tree

- **WHEN** `node scripts/check-size.ts` runs against a tree under the budget
- **THEN** it exits `0`

#### Scenario: Binary validator finds a font

- **WHEN** `node scripts/check-no-binaries.ts` runs against a tree containing a `.woff2` file
- **THEN** it emits a `LEVEL|file|line|rule|message` line naming the file and exits `1`

#### Scenario: Validator misuse

- **WHEN** either validator is invoked with an unreadable target path
- **THEN** it exits `2` with a usage diagnostic

### Requirement: Single gate-battery entry point

The repository SHALL provide `scripts/verify-all.sh` that runs the full gate battery -- every test
suite, the theme round-trip, `verify-theme.sh`, the skill name-equals-directory check, the
forbidden-string greps, the no-binaries check, the tracked-byte budget, and the
`${CLAUDE_PLUGIN_ROOT}`-literal check -- and exits non-zero if any component fails.

#### Scenario: Running the gate battery

- **WHEN** `sh scripts/verify-all.sh` is executed
- **THEN** each component check runs and reports its own pass or fail line
- **AND** the script exits `0` only when every component passes

### Requirement: Development container

The repository SHALL provide `.devcontainer/devcontainer.json` pinned to a `node:24`-family image
tag.

#### Scenario: Opening the repository in a dev container

- **WHEN** the devcontainer definition is read
- **THEN** the image tag is from the `node:24` family and is pinned rather than floating
- **AND** no `node:20` reference appears anywhere in the definition

### Requirement: LICENSE remains absent pending legal ruling

The repository SHALL NOT add a `LICENSE` file as part of this change. The absence SHALL be recorded
as a blocked open question rather than resolved by default.

#### Scenario: Reviewer asks why there is no licence

- **WHEN** a reviewer checks for a `LICENSE` file
- **THEN** `CONTRIBUTING.md` or `SECURITY.md` records that manifests declare `UNLICENSED` and that a
  legal ruling is pending
- **AND** no licence text is chosen on the repository's behalf

