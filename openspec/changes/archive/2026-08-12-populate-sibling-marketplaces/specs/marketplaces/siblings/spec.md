## Purpose

Defines the structural baseline that every Patterson sibling marketplace repository satisfies --
labs, dental, and vet -- and the incubation-to-canonical promotion path that governs when work
graduates from `patterson-labs` into `patterson-corp`.

## ADDED Requirements

### Requirement: Sibling repositories are structurally complete

Each of `patterson-labs`, `patterson-dental`, and `patterson-vet` SHALL contain
`.claude-plugin/marketplace.json`, `README.md`, `.gitignore`,
`.devcontainer/devcontainer.json`, `.github/workflows/ci.yml`, a `run-tests.sh` suite, and a
`managed-settings.d/` placeholder.

#### Scenario: A sibling repository is inspected

- **WHEN** any of the three sibling repositories is checked for the baseline files
- **THEN** every listed file is present
- **AND** the repository is no longer an empty directory shell

#### Scenario: Devcontainer runtime

- **WHEN** a sibling repository's `.devcontainer/devcontainer.json` is read
- **THEN** its image tag is from the `node:24` family and is pinned
- **AND** no `node:20` reference appears in the repository

### Requirement: Distinct marketplace names

Each sibling `marketplace.json` SHALL declare a marketplace `name` distinct from every other
Patterson marketplace, because marketplace names occupy a flat global namespace in which a duplicate
name replaces the existing entry rather than coexisting with it.

#### Scenario: Comparing marketplace names across the org

- **WHEN** the marketplace `name` values of `patterson-corp`, `patterson-labs`, `patterson-dental`,
  `patterson-vet`, `patterson-marketplace`, and `patterson-skills` are collected
- **THEN** every value is unique
- **AND** no sibling reuses a name already published by another repository

#### Scenario: Plugin source paths

- **WHEN** a sibling manifest declares a plugin `source`
- **THEN** the value begins with `./`, as Claude Code requires

### Requirement: Sibling test suites

Each sibling repository SHALL ship a zero-dependency `run-tests.sh` suite validating its manifest,
asserting every skill's frontmatter `name` equals its directory name, and asserting the absence of
forbidden content. The tests SHALL be written before the files they validate.

#### Scenario: Running a sibling suite

- **WHEN** `sh run-tests.sh` is executed in a sibling repository
- **THEN** it validates the marketplace manifest
- **AND** it checks skill name-equals-directory for every `SKILL.md` present
- **AND** it checks for forbidden strings and binaries
- **AND** it exits `0` with a passing summary

#### Scenario: A skill name does not match its directory

- **WHEN** a `SKILL.md` frontmatter `name` differs from its parent directory name
- **THEN** the suite reports the mismatched path and exits non-zero

### Requirement: Documented promotion path

`patterson-labs` SHALL provide `docs/promotion-path.md` describing how an incubating artifact
graduates to `patterson-corp`.

#### Scenario: An incubating plugin is considered for graduation

- **WHEN** a maintainer consults `docs/promotion-path.md`
- **THEN** it states the criteria an artifact meets before graduating
- **AND** it names `patterson-corp` as the canonical destination
- **AND** it records `[TBD: not specified in HANDOFF.md 1F]` for any graduation criterion the source
  does not define

### Requirement: Harvest destination for the workflow-designer skill

`patterson-labs` SHALL provide the destination directory and structure for the
`agentic-workflow-designer` skill harvested from `patterson-skills`, such that the harvested skill
satisfies the name-equals-directory rule at its new path.

#### Scenario: The harvested skill lands

- **WHEN** `agentic-workflow-designer` is copied into `patterson-labs`
- **THEN** its `SKILL.md` frontmatter `name` equals its new directory name in plain kebab-case
- **AND** the labs test suite passes with the skill in place

### Requirement: Agentic workflow adoption is documented

`patterson-labs` SHALL provide `docs/gh-aw-adoption.md` recording the org's agentic-workflow
position, citing `.tmp/staging/reuse/agentics-and-gh-aw.md` and the three workflows already running
in the design-plugins repository.

#### Scenario: Reading the adoption document

- **WHEN** a reader opens `docs/gh-aw-adoption.md`
- **THEN** it cites `.tmp/staging/reuse/agentics-and-gh-aw.md`
- **AND** it names the three existing workflows (ci-doctor, repo-ask, repo-chronicle) and the gh-aw
  version they were compiled with
- **AND** it records that adopting `githubnext/agentics` as a GitHub template requires a remote
  operation and is therefore documented rather than executed
