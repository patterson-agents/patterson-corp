# settings/managed-layering Specification

## Purpose
Defines how Patterson layers managed agent settings across organisational tiers given that Claude
Code's managed tier is winner-take-all, and fixes the posture of that layering as advisory-only
until enforcement is separately approved.
## Requirements
### Requirement: Four ordered settings layers

The repository SHALL provide `managed-settings.d/` containing `10-enterprise.json`,
`20-suborg.json`, `30-department.json`, and `40-team.json`. Filenames SHALL be numerically prefixed
so that alphabetical merge order matches the intended organisational precedence.

#### Scenario: Merge order follows the numeric prefixes

- **WHEN** the four layer files are sorted alphabetically as the merge mechanism sorts them
- **THEN** the order is `10-enterprise`, `20-suborg`, `30-department`, `40-team`
- **AND** each file is valid JSON

#### Scenario: Layer contents match their tier

- **WHEN** each layer is inspected
- **THEN** `10-enterprise.json` declares `extraKnownMarketplaces` referencing `patterson-corp`
- **AND** `20-suborg.json` adds `patterson-dental` and `patterson-vet`
- **AND** `30-department.json` declares `enabledPlugins` for the engineering and brand plugins
- **AND** `40-team.json` demonstrates extending an inherited value and overriding one

### Requirement: Advisory-only posture

No layer SHALL set `strictKnownMarketplaces` and no layer SHALL set `permissions.deny`. The
demonstration SHALL remain advisory until enforcement is separately approved.

#### Scenario: Scanning the layers for enforcement keys

- **WHEN** the four JSON layers are scanned for `strictKnownMarketplaces` or `permissions.deny`
- **THEN** neither key appears in any layer

#### Scenario: Enforcement is shown but not applied

- **WHEN** a reader looks for how to enable enforcement
- **THEN** `docs/architecture/layered-settings.md` shows the enforcement switches as commented-out
  examples in the markdown
- **AND** the accompanying prose states that going live is one line per layer
- **AND** no comment syntax is introduced into the JSON files, which do not support it

### Requirement: Documented merge semantics

`docs/architecture/layered-settings.md` SHALL explain the six settings layers and SHALL state that
Claude Code's managed tier is winner-take-all, that `managed-settings.d/` is the only mechanism that
merges, and that it merges alphabetically.

#### Scenario: A reader asks why a single managed file is insufficient

- **WHEN** a reader consults the architecture document
- **THEN** it states that a single managed settings file replaces rather than merges
- **AND** it identifies `managed-settings.d/` as the only merging mechanism
- **AND** it states that merge order is alphabetical by filename

### Requirement: Cross-vendor settings constraints are recorded with citations

The architecture document SHALL record four verified constraints, each attributed to its source
under `.tmp/staging/docs/` or `patterson-platform-docs/references/platforms/_NORMATIVE-*.md`.

#### Scenario: Marketplace name collision behaviour

- **WHEN** the document describes marketplace naming
- **THEN** it states that marketplace `name` is a flat global namespace and that the same name
  replaces rather than coexisting

#### Scenario: Copilot precedence is inverted

- **WHEN** the document describes GitHub Copilot instruction precedence
- **THEN** it states the order is personal, then repository, then organisation
- **AND** it states that Copilot has no enterprise tier

#### Scenario: VS Code shares the settings shape

- **WHEN** the document describes VS Code
- **THEN** it states that VS Code reads `.claude/settings.json` using the same keys
- **AND** it concludes that one settings shape serves both agents

#### Scenario: A source is silent on a question

- **WHEN** the document reaches a settings behaviour that no cited source describes
- **THEN** it records `[TBD: not specified in <source>]` naming the source consulted
- **AND** it does not extrapolate the behaviour

