# marketplaces/name-reconciliation Specification

## Purpose
Defines how Patterson resolves naming conflicts across its marketplace repositories: which names
actually collide, how the retiring `patterson-skills` catalog is deprecated, and which collision
remains an open decision because resolving it would break existing installs.
## Requirements
### Requirement: Collisions are recorded at the level they occur

The reconciliation decision record SHALL state that Patterson's marketplace `name` values --
`patterson-corp`, `patterson`, `patterson-skills`, and `patterson-design` -- are distinct and do not
collide, and SHALL identify the two real collisions as plugin-level.

#### Scenario: Reading the decision record

- **WHEN** a reader opens `docs/decisions/0003-plugin-name-reconciliation.md`
- **THEN** it records that the marketplace-level collision described in HANDOFF.md 1G does not exist
- **AND** it identifies `patterson-design` as published by both `patterson-marketplace` and `patterson-skills`
- **AND** it identifies `patterson-brand` as published by both `patterson-corp` and `patterson-design-plugins`
- **AND** it states that plugin names resolve first-found-wins, so the second publisher is silently ignored

#### Scenario: Verifying the marketplace names

- **WHEN** the marketplace `name` field of each Patterson marketplace manifest is collected
- **THEN** all values are distinct
- **AND** the evidence supporting the record is reproducible from the manifests themselves

### Requirement: The patterson-design collision resolves by retirement

The decision record SHALL resolve the `patterson-design` plugin collision through the retirement of
`patterson-skills`, with `patterson-marketplace` remaining the publisher.

#### Scenario: A consumer asks which patterson-design is canonical

- **WHEN** the decision record is consulted about `patterson-design`
- **THEN** it names `patterson-marketplace` as the surviving publisher
- **AND** it states that `patterson-skills` is deprecated and its copy is withdrawn

### Requirement: The patterson-brand collision stays open

The `patterson-brand` plugin SHALL NOT be renamed in either repository as part of this change. The
decision record SHALL present the collision as decision-needed, with options and a recommendation.

#### Scenario: Reviewing the open collision

- **WHEN** a reader reaches the `patterson-brand` section of the decision record
- **THEN** it states that renaming a published plugin is a breaking change for existing installs
- **AND** it presents the available options with their consequences
- **AND** it gives a recommendation while leaving the decision unmade
- **AND** no rename is applied in `patterson-corp` or `patterson-design-plugins`

### Requirement: Local deprecation of patterson-skills

`patterson-skills` SHALL be deprecated locally through a README banner and manifest metadata, on its
existing git history, without any remote operation.

#### Scenario: Opening the deprecated repository

- **WHEN** a reader opens the `patterson-skills` README
- **THEN** a banner states that the catalog is deprecated
- **AND** it directs readers to `patterson-marketplace`

#### Scenario: Reading the deprecated manifest

- **WHEN** the `patterson-skills` `marketplace.json` is read
- **THEN** it carries a `deprecated: true` flag
- **AND** its description is prefixed to indicate deprecation and name the replacement

#### Scenario: No remote archive is attempted

- **WHEN** the deprecation work completes
- **THEN** the repository has not been archived, transferred, or otherwise mutated on the remote
- **AND** the deprecation exists only as a local commit

### Requirement: Harvest before retirement

The `agentic-workflow-designer` skill SHALL be copied from `patterson-skills` into `patterson-labs`
before the deprecation is recorded, and its frontmatter `name` SHALL be updated to equal its new
directory name.

#### Scenario: The harvested skill is validated at its new home

- **WHEN** the labs test suite runs with the harvested skill in place
- **THEN** the skill's frontmatter `name` equals its directory name in plain kebab-case
- **AND** the suite passes

### Requirement: Reviewed commit of the converted skill scripts

The 55 uncommitted changes in `patterson-marketplace`, comprising a 21-file conversion of vendored
skill scripts from Python to TypeScript, SHALL be reviewed file by file before any commit. A blanket
`git add -A` SHALL NOT be used in this repository.

#### Scenario: The conversion passes review

- **WHEN** every converted script uses erasable TypeScript syntax and `node:` builtins only, and
  preserves the original behaviour
- **THEN** the changes are committed as a single conversion refactor
- **AND** the commit message cites the prior session's provenance recorded in `.remember/now.md`

#### Scenario: The conversion fails review

- **WHEN** any converted script uses non-erasable syntax, a third-party import, or diverges
  behaviourally from its Python original
- **THEN** nothing is committed in `patterson-marketplace`
- **AND** the finding is escalated in the morning report

#### Scenario: Unexpected files appear in the working tree

- **WHEN** the working tree contains changes outside the 21 converted scripts and their directly
  related files
- **THEN** those files are not staged
- **AND** their presence is recorded for escalation

