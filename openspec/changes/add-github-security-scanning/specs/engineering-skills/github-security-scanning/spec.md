## Purpose

Defines the seventh `patterson-engineering` skill: it installs GitHub security scanning controls
into a Patterson repository, audits which controls are present, and publishes a control-coverage
statement that reflects Patterson's real tooling rather than an aspirational one.

## ADDED Requirements

### Requirement: Skill structure and discoverability

The skill SHALL live at `plugins/patterson-engineering/skills/github-security-scanning/` and SHALL
follow the shape of its six siblings: a lean `SKILL.md`, plus `references/`, `assets/`, `scripts/`,
`tests/`, `_SOURCES.md`, and `REFERENCES.md`.

#### Scenario: Frontmatter name matches directory

- **WHEN** the repo-wide skill-name check compares each `SKILL.md` frontmatter `name` with its
  parent directory name
- **THEN** `github-security-scanning` matches its directory exactly, in plain kebab-case with no
  namespace prefix

#### Scenario: Skill is triggered by setup intent

- **WHEN** an agent receives a request such as "set up security scanning", "enable CodeQL",
  "configure Dependabot", or "harden this repo"
- **THEN** the skill's declared triggers match and the skill is selected

### Requirement: Installable control templates

The skill SHALL carry, in `assets/`, the templates it installs: `codeql.yml`, `dependabot.yml`,
`security.yml`, and `secret_scanning.yml`. Every workflow template SHALL pin `node:24`-family
runtimes and SHALL NOT reference `node:20`.

#### Scenario: Dependabot ecosystem scope

- **WHEN** `assets/dependabot.yml` is inspected
- **THEN** it declares the `github-actions` ecosystem only
- **AND** it declares no npm or pip ecosystem, because none exists in the target repository

#### Scenario: Secret scanning exclusion precedes push protection

- **WHEN** the skill guides a repository through enabling secret scanning push protection
- **THEN** it instructs that `.github/secret_scanning.yml` excluding
  `plugins/patterson-engineering/hooks/tests/` is added first
- **AND** it explains that those fixtures contain deliberately synthetic AWS keys and connection
  strings which would otherwise block the author on their own test data

#### Scenario: Enablement API call is documentation only

- **WHEN** the skill presents the `gh api -X PATCH repos/<owner>/<repo>` secret-scanning enablement command
- **THEN** it is presented as a documented command for a human to run
- **AND** no script, hook, test, or workflow in this change executes it

### Requirement: Security configuration auditor

The skill SHALL ship `scripts/check-security-config.ts` as zero-dependency TypeScript runnable as
`node check-security-config.ts`, using `node:` builtins only and erasable syntax only. It SHALL
exit `0` when all audited controls are present, `1` when a control is missing, and `2` on a usage
or input error, and SHALL emit findings as `LEVEL|file|line|rule|message`.

#### Scenario: All controls present

- **WHEN** the auditor runs against a repository containing every expected control file
- **THEN** it exits `0` and emits no `ERROR` lines

#### Scenario: A control is missing

- **WHEN** the auditor runs against a repository with no CodeQL workflow
- **THEN** it emits a line in `LEVEL|file|line|rule|message` form naming the missing control
- **AND** it exits `1`

#### Scenario: Invalid invocation

- **WHEN** the auditor is invoked against a path that does not exist
- **THEN** it exits `2` and emits a usage diagnostic

### Requirement: Honest control coverage including an open DAST row

The skill's coverage table SHALL state Patterson's actual scanning stack and SHALL keep the DAST
row open and addressed to AppSec. It SHALL NOT record Trivy or GitLeaks as satisfying DAST.

#### Scenario: Reading the coverage table

- **WHEN** a reader opens the skill's control-coverage table
- **THEN** SAST is recorded as covered by CodeQL and Checkmarx
- **AND** SCA is recorded as covered by Dependabot, Trivy, and JFrog
- **AND** secret scanning is recorded as covered by GitLeaks and GitHub secret scanning
- **AND** container and IaC scanning is recorded as covered by Trivy and Checkmarx
- **AND** the DAST row is recorded as not covered, with a note that DAST requires exercising a
  running application and that the tool selection is addressed to AppSec

#### Scenario: An agent is asked whether DAST is satisfied

- **WHEN** the skill is consulted about DAST coverage
- **THEN** it answers that DAST is not covered by the current stack
- **AND** it does not propose Trivy or GitLeaks as a substitute

### Requirement: CodeQL extractor caveat

The skill SHALL record that the repository's `.ts` files carry no `package.json` and no
`tsconfig.json` by design, and that the JS/TS extractor's "files analysed" count must be confirmed
on the first run rather than trusting a green check.

#### Scenario: First CodeQL run guidance

- **WHEN** a user follows the skill to enable CodeQL on a Patterson repository
- **THEN** the skill directs them to read the "files analysed" count from the first run output
- **AND** it explains that a green check alone does not prove the extractor found the TypeScript sources

### Requirement: Provenance files

The skill SHALL ship `_SOURCES.md` and `REFERENCES.md`. Where no Patterson source exists for a
claim, the provenance file SHALL record a `[TBD: not specified in <source>]` marker rather than
inventing a citation.

#### Scenario: No GitHub-security knowledge-base article exists

- **WHEN** `_SOURCES.md` is authored and none of the six known ServiceNow KB articles covers GitHub
  security scanning
- **THEN** the entry records `[TBD: not specified in the six ServiceNow KB sources]`
- **AND** no `sys_kb_id` is fabricated

### Requirement: Dedicated test suite

The change SHALL add a `run-tests.sh` suite for this skill, bringing the repository to six suites.
Tests SHALL be written before the auditor implementation.

#### Scenario: Running the suite

- **WHEN** `sh tests/run-tests.sh` is executed for this skill
- **THEN** it exercises the auditor's `0`, `1`, and `2` exit paths against fixtures
- **AND** it asserts each `assets/` template is present and free of `node:20`
- **AND** it prints a passing summary and exits `0`
