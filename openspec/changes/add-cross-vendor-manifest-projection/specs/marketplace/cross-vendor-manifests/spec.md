## Purpose

Defines how the canonical Claude Code marketplace manifest is projected to the GitHub Copilot
manifest location so a single Patterson catalog is discoverable by every supported agent vendor,
and how divergence between the two copies is detected before it reaches consumers.

## ADDED Requirements

### Requirement: Byte-identical manifest projection

The repository SHALL publish `.github/plugin/marketplace.json` as a byte-identical copy of
`.claude-plugin/marketplace.json`. The projection SHALL be a copy, never a transformation.

#### Scenario: Projecting the canonical manifest

- **WHEN** `scripts/sync-manifests.sh` runs in a repository containing `.claude-plugin/marketplace.json`
- **THEN** `.github/plugin/marketplace.json` exists and `cmp` reports no difference between the two files
- **AND** the script exits `0`

#### Scenario: Destination directory does not exist

- **WHEN** `scripts/sync-manifests.sh` runs and `.github/plugin/` is absent
- **THEN** the script creates the directory before writing the manifest
- **AND** the script exits `0`

#### Scenario: Source manifest is missing

- **WHEN** `scripts/sync-manifests.sh` runs and `.claude-plugin/marketplace.json` does not exist
- **THEN** the script emits a diagnostic naming the missing file and exits non-zero
- **AND** no `.github/plugin/marketplace.json` is created

### Requirement: Divergence check in CI

A dedicated workflow `.github/workflows/manifest-sync.yml` SHALL fail when the projected manifest
differs from the canonical manifest. This check SHALL live in its own workflow file and SHALL NOT
modify `.github/workflows/ci.yml`.

#### Scenario: Manifests agree

- **WHEN** the divergence check runs and the two manifests are byte-identical
- **THEN** the workflow succeeds

#### Scenario: Manifests diverge

- **WHEN** the canonical manifest is edited without re-running the projection
- **THEN** the divergence check fails and names both file paths in its output

### Requirement: Relative source prefix

Every plugin `source` value in the marketplace manifest SHALL begin with `./`, because Claude Code
requires the relative prefix while awesome-copilot writes bare paths such as `plugins/foo`.

#### Scenario: Source value lacks the relative prefix

- **WHEN** the manifest test suite encounters a plugin whose `source` does not begin with `./`
- **THEN** the suite reports the offending plugin name and fails

### Requirement: Manifest projection provenance

The projection SHALL be documented in an architecture decision record that records the
copy-not-transform finding and the evidence it rests on.

#### Scenario: Reading the decision record

- **WHEN** a reader opens `docs/decisions/0002-cross-vendor-manifest-projection.md`
- **THEN** it states that `githubnext/ado-aw` ships both manifests byte-identical
- **AND** it names the vendored path the evidence was verified against
- **AND** it tabulates the Agent Plugins 1.0, Copilot, and Claude manifest locations with their root tokens
