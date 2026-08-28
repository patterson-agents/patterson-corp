## Purpose

Fixes the canonical identity of the Patterson enterprise plugin catalog across all three tiers that
carry a name — marketplace `name`, repository slug, and human-readable display name — and defines
what must stay consistent with it, what must be preserved unchanged, and what a consumer of the
previous identity has to do.

## ADDED Requirements

### Requirement: Canonical enterprise catalog identity

The enterprise catalog SHALL declare marketplace `name` `patterson-enterprise-plugins` in
`.claude-plugin/marketplace.json`, SHALL be hosted at repository slug
`patterson-agents/patterson-enterprise-plugins`, and SHALL be titled "Patterson Enterprise Plugins"
on every human-readable surface. The plugin `name` values published by the catalog SHALL NOT be
changed by this identity; the identity is fixed at the marketplace tier only.

#### Scenario: Reading the marketplace manifest

- **WHEN** `.claude-plugin/marketplace.json` is read
- **THEN** its `name` is `patterson-enterprise-plugins`
- **AND** its `plugins[].name` values are `patterson-engineering` and `patterson-brand`, unchanged

#### Scenario: Resolving the catalog from a manifest reference

- **WHEN** a `source.repo`, `homepage`, or `repository` field in this repository names the catalog
- **THEN** the value is under `patterson-agents/patterson-enterprise-plugins`
- **AND** no tracked configuration file resolves the catalog through the retired slug

#### Scenario: A display surface names the catalog

- **WHEN** the site title, the site hero, the repository `README.md` heading, the Pages landing page,
  or the banner artwork is rendered
- **THEN** it reads "Patterson Enterprise Plugins", not the retired display name

### Requirement: The Copilot projection survives the rename

The renamed manifest SHALL be projected to `.github/plugin/marketplace.json` as a byte-for-byte copy,
per `docs/decisions/0002-cross-vendor-manifest-projection.md`. A rename SHALL NOT be merged with the
two manifests divergent.

#### Scenario: Verifying the projection after a rename

- **WHEN** `sh scripts/sync-manifests.sh --check` is run after the marketplace `name` changes
- **THEN** it reports the source and projected manifests byte-identical and exits `0`

#### Scenario: The projection was not regenerated

- **WHEN** `.claude-plugin/marketplace.json` carries the new name and `.github/plugin/marketplace.json`
  still carries the retired one
- **THEN** `sh scripts/sync-manifests.sh --check` exits `1` and names both paths
- **AND** the `manifest-sync` workflow fails the pull request

### Requirement: Live surfaces carry the current identity

Every tracked file that describes the catalog as it exists now — manifests, configuration, scripts,
governance prose, architecture documentation, plugin and skill content, the `site/` build, and the
current capability specifications under `openspec/specs/` — SHALL name the catalog by its current
identity.

#### Scenario: Auditing the live surface

- **WHEN** the tracked files outside `openspec/changes/archive/` and `docs/decisions/0001`–`0005` are
  searched for the retired marketplace name or slug
- **THEN** no occurrence is found

#### Scenario: An in-flight change proposal names the catalog

- **WHEN** a change under `openspec/changes/` has not yet been archived
- **THEN** it names the catalog by its current identity, because its `tasks.md` is an instruction to
  be executed rather than a record of work already done

### Requirement: Historical records are preserved, not rewritten

Archived change proposals under `openspec/changes/archive/` and previously accepted architecture
decision records SHALL retain the catalog name that was current when they were written. A rename
SHALL be carried forward by a new decision record stating the mapping, never by editing a dated
record to read as though the new name already existed.

#### Scenario: An archived proposal is read after a rename

- **WHEN** a file under `openspec/changes/archive/` is opened
- **THEN** it carries the name that was current on its archive date
- **AND** the decision record for the rename states the mapping from that name to the current one

#### Scenario: A previously accepted decision record is read after a rename

- **WHEN** a decision record accepted before the rename is opened
- **THEN** its observations, tables, and quoted sources are unmodified
- **AND** the rename is recorded in its own, later decision record

### Requirement: Consumer migration is stated explicitly

Because a marketplace `name` occupies a flat global namespace and plugin install identities are the
qualified pair `plugin@marketplace`, a marketplace rename SHALL be documented as a breaking change
that gives both the retired and current qualified identity for every published plugin, and SHALL
state that a consumer re-adds the marketplace under the new slug rather than relying on an alias.

#### Scenario: A consumer with an existing installation reads the migration note

- **WHEN** `README.md` or the rename decision record is consulted
- **THEN** it gives the retired and current `plugin@marketplace` identity for both published plugins
- **AND** it states that the marketplace must be re-added under the new slug and both plugins
  re-enabled
- **AND** it does not promise an alias or automatic redirect for the marketplace name

#### Scenario: Managed settings are reviewed during the migration

- **WHEN** an `extraKnownMarketplaces` or `enabledPlugins` key naming the enterprise catalog is found
  in a managed settings layer
- **THEN** the key uses the current marketplace name
- **AND** no layer leaves a key bound to the retired name
