## MODIFIED Requirements

### Requirement: Enterprise enforcement posture

`10-enterprise.json` SHALL carry `permissions.deny` rules that mirror the house-standards
guard's Bash and lockfile blocks: the Python toolchain commands, the non-bun package managers,
and Write/Edit of foreign lockfiles. No layer SHALL set `strictKnownMarketplaces` or
`blockedMarketplaces` — marketplace lockdown remains unapproved and out of scope. Layers
`20-suborg.json`, `30-department.json`, and `40-team.json` SHALL NOT set `permissions.deny`;
enforcement is an enterprise-tier decision.

This replaces the former advisory-only posture. The enforcement approval it awaited was given
by the platform owner in the `add-house-standards-enforcement` change (August 2026).

#### Scenario: Scanning the layers for enforcement keys

- **WHEN** the four JSON layers are scanned for enforcement keys
- **THEN** `permissions.deny` appears in `10-enterprise.json` and in no other layer
- **AND** `strictKnownMarketplaces` and `blockedMarketplaces` appear in no layer

#### Scenario: The deny rules mirror the guard

- **WHEN** `10-enterprise.json`'s `permissions.deny` is compared with the house-standards
  guard's blocked sets
- **THEN** each named tool in the guard's blocked sets (`python`, `python2`, `python3`,
  `pip`, `pip2`, `pip3`, `pipx`, `uv`, `poetry`, `conda`, `virtualenv`, `npm`, `pnpm`,
  `yarn`, `npx`) has corresponding `Bash(<tool>)` and `Bash(<tool>:*)` deny rules;
  version-suffixed interpreter variants such as `python3.12` are covered by the hook layer
  only, since literal prefix rules cannot express them
- **AND** each foreign lockfile the guard blocks has corresponding `Write` and `Edit` deny
  rules

#### Scenario: Enforcement requires deployment to take effect

- **WHEN** a reader asks whether the repository's `managed-settings.d/` alone enforces
  anything on a developer machine
- **THEN** `docs/architecture/org-enforcement.md` states that the merged output must be
  deployed to the machine's managed settings path before any of it binds
