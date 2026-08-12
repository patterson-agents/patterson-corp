# cli/marketplace-emission Specification

## Purpose
Defines what the Patterson CLI produces when it scaffolds a marketplace or a skill -- dual-vendor
manifests and provenance files -- and the checks that surface drift between generated artifacts
through `doctor` and `check`.
## Requirements
### Requirement: Dual-vendor marketplace emission

`marketplaceGenerator` SHALL emit both `.claude-plugin/marketplace.json` and
`.github/plugin/marketplace.json`, and the two files SHALL be byte-identical.

#### Scenario: Scaffolding a new marketplace

- **WHEN** the CLI scaffolds a marketplace
- **THEN** both manifest paths exist in the generated tree
- **AND** a byte comparison of the two files reports no difference

#### Scenario: Generated plugin sources carry the relative prefix

- **WHEN** the generated manifest declares a plugin `source`
- **THEN** the value begins with `./`, as Claude Code requires

### Requirement: Manifest divergence check

A `CheckDef` SHALL detect divergence between the two emitted manifests and SHALL surface through
both the `doctor` and `check` commands.

#### Scenario: Manifests agree

- **WHEN** the divergence check runs against a repository whose two manifests match
- **THEN** the check passes and reports no finding

#### Scenario: Manifests diverge

- **WHEN** one manifest is edited so the two no longer match
- **THEN** `doctor` and `check` both report the divergence and name both paths
- **AND** the command exits with a failing status

#### Scenario: Only one manifest is present

- **WHEN** a repository has `.claude-plugin/marketplace.json` but no `.github/plugin/marketplace.json`
- **THEN** the check reports the missing projection rather than passing silently

### Requirement: Skill provenance emission

`skillGenerator` SHALL emit `_SOURCES.md` and `REFERENCES.md` templates alongside every generated
skill, matching the provenance convention used in `patterson-corp`.

#### Scenario: Scaffolding a new skill

- **WHEN** the CLI scaffolds a skill
- **THEN** `_SOURCES.md` and `REFERENCES.md` are present in the generated skill directory
- **AND** each template prompts for a citation and shows the `[TBD: not specified in <source>]` form
  for unknowns

#### Scenario: Provenance files are missing

- **WHEN** the provenance `CheckDef` runs against a skill lacking either file
- **THEN** it reports the missing file by path and fails

### Requirement: Generated output matches hand-built repositories

Output from the enhanced generators SHALL match the structure of the hand-built Patterson
marketplace repositories for the elements both produce.

#### Scenario: Comparing generated and hand-built manifests

- **WHEN** a marketplace is scaffolded into a scratch directory and its manifests are compared with
  a hand-built sibling marketplace's manifests
- **THEN** the structural shape matches, differing only in name and plugin content
- **AND** any structural difference found is recorded as a defect in one side or the other

### Requirement: Documentation and specs reflect reality

The CLI's in-repo documentation and spec tree SHALL describe what the code actually does.

#### Scenario: The plugins command comment

- **WHEN** `packages/cli/src/commands/plugins.ts` is read
- **THEN** no comment claims the marketplaces intermediate representation is consumed while the code
  does not consume it

#### Scenario: Task checkboxes reflect landed work

- **WHEN** `specs/001-patterson-cli-v1/tasks.md` is read
- **THEN** tasks T001 through T028 that have landed are checked
- **AND** each is attributable to the commit that landed it

#### Scenario: New work is specified before it is built

- **WHEN** the enhancements in this change are implemented
- **THEN** a hand-written `specs/002-*` mini-spec exists following `.specify/templates/spec-template.md`
- **AND** the tests for each enhancement were written before its implementation

### Requirement: Repository metadata points at the real remote

The CLI's package metadata SHALL name the actual remote repository.

#### Scenario: Reading package repository URLs

- **WHEN** the `package.json` files in the workspace are inspected
- **THEN** repository URLs reference `patterson-agents/cli`
- **AND** no URL references a nonexistent `patterson-cli` repository

### Requirement: Gate passes before every commit

`bun run gate` -- typecheck, test, and lint -- SHALL pass before each commit in `cli/`, and no new
third-party dependency SHALL be introduced by this change.

#### Scenario: Committing an enhancement

- **WHEN** a change is ready to commit in `cli/`
- **THEN** `bun run gate` has been run and passes
- **AND** the commit subject conforms to conventional commits as enforced by commitlint

#### Scenario: A dependency would be needed

- **WHEN** an implementation approach would require a new third-party package
- **THEN** the approach is reconsidered, or the package is scored through the supply-chain gate and
  confirmed before any install

