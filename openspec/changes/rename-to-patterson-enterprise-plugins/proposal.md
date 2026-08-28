## Why

The repository, the marketplace it publishes, and the display name that appears on every reading
surface are all called `patterson-corp` / "Patterson Corp". Daniel directed renaming all three to
`patterson-enterprise-plugins` and "Patterson Enterprise Plugins".

The current name is inaccurate in two ways that matter operationally. "Corp" reads as *Patterson
Corporate* — a sub-organization name in the same family as `patterson-dental` and `patterson-vet` —
when the artifact is in fact the **enterprise** layer that sits above all of them
(`docs/architecture/layered-settings.md`, six-layer model). And it says nothing about what the
repository contains: it is a plugin catalog, not a corporate landing repo. `patterson-enterprise-plugins`
states both the layer and the payload.

The rename is not cosmetic. The marketplace `name` field is a **flat global namespace**, and plugin
install identities are the qualified pair `plugin@marketplace`
(`openspec/specs/marketplaces/name-reconciliation/spec.md`; `docs/decisions/0003-plugin-name-reconciliation.md`).
Changing it changes `patterson-engineering@patterson-corp` to
`patterson-engineering@patterson-enterprise-plugins` for every consumer, and invalidates the
`extraKnownMarketplaces` and `enabledPlugins` keys written into `managed-settings.d/` and into
sibling repositories. That makes the rename a coordinated identity change with a documented
migration, not a find-and-replace.

## What Changes

- **New `marketplaces/enterprise-identity` capability**: fixes the canonical identity of the
  enterprise catalog — marketplace `name` `patterson-enterprise-plugins`, repository slug
  `patterson-agents/patterson-enterprise-plugins`, display name "Patterson Enterprise Plugins" —
  requires the Copilot projection to stay byte-identical through the rename, requires every live
  surface to carry the new identity, and requires historical records to be preserved rather than
  rewritten.
- **`.claude-plugin/marketplace.json`** `name` becomes `patterson-enterprise-plugins`, projected to
  `.github/plugin/marketplace.json` by `scripts/sync-manifests.sh` (a byte-for-byte copy, per
  ADR 0002). The two plugin `name` values (`patterson-engineering`, `patterson-brand`) are
  **unchanged** — the rename is at the marketplace tier only.
- **Configuration surfaces** carrying the marketplace key or the repository slug are updated:
  `.claude/settings.json`, `managed-settings.d/{10-enterprise,30-department,40-team}.json`,
  `.devcontainer/devcontainer.json`, `.github/ISSUE_TEMPLATE/config.yml`,
  `plugins/*/.claude-plugin/plugin.json` (`homepage`, `repository`).
- **Reading surfaces** are updated: `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `SECURITY.md`,
  `CODE_OF_CONDUCT.md`, `CODEOWNERS`, `REFERENCES.md`, `.github/copilot-instructions.md`, both plugin
  `README.md` files, `docs/architecture/*.md`, `docs/index.html`, `docs/diagrams/marketplace-topology.svg`,
  `docs/assets/banner.svg`, `scripts/verify-all.sh`, `scripts/build-site-content.ts`, `.githooks/pre-commit`,
  and the `site/` Starlight configuration and landing page.
- **A migration note** is added to `README.md` and to the ADR, stating the old and new qualified
  install identities and that a consumer must re-add the marketplace under the new name.
- **`docs/decisions/0006-marketplace-rename-to-enterprise-plugins.md`** records the decision, the
  breaking-change analysis, and the historical-record preservation policy below.
- **`docs/assets/banner.webp`** is removed and `README.md` points at `docs/assets/banner.svg`
  instead. The WebP is a rasterization of that SVG with the retired wordmark burned in; no raster
  toolchain exists in this repository to regenerate it, and SVG is exempt from the no-binaries rule
  at any size, so the vector is now the single source for the banner.

## Capabilities

### New Capabilities

- `marketplaces/enterprise-identity`: the canonical name, slug, and display name of the enterprise
  catalog; the projection invariant across the rename; the live-surface consistency rule; the
  historical-record preservation rule; and the consumer migration contract.

### Modified Capabilities

None. Occurrences of `patterson-corp` inside `openspec/specs/**` are updated to
`patterson-enterprise-plugins`, but every one of them is a **reference to this repository by name**,
not a requirement about it. Renaming a proper noun does not change what
`marketplaces/siblings`, `marketplaces/name-reconciliation`, `settings/managed-layering`,
`cli/marketplace-emission`, `design/token-imports`, or `repo-standard/quality-baseline` require; the
requirements and scenarios are behaviorally identical before and after. Treating these as MODIFIED
deltas would assert a behavior change that does not exist.

## Non-goals

- **No plugin renames.** `patterson-engineering` and `patterson-brand` keep their names. The open
  `patterson-brand` plugin-tier collision recorded in `docs/decisions/0003-plugin-name-reconciliation.md`
  §3 is untouched and still awaits Daniel's decision; this change neither resolves nor worsens it.
- **No custom-domain change.** The site stays on `corp.patterson.sh`. Moving the domain is a DNS and
  Pages operation with its own redirect and link-rot analysis, and no one asked for it.
- **No rewriting of historical records.** `openspec/changes/archive/**` and
  `docs/decisions/0001`–`0005` keep the name that was true when they were written. An archived
  proposal and a dated decision record are testimony about a moment; editing them to say something
  that was not said then destroys the audit trail the OpenSpec workflow exists to produce. ADR 0006
  carries the forward mapping, and GitHub's own repository-rename redirect keeps their URLs
  resolving.
- **No remote operations.** This change cannot rename the GitHub repository, retarget the custom
  domain, or edit any sibling repository. Those are recorded in `tasks.md` §5 as operator follow-ups.
- **No new gate check.** `scripts/verify-all.sh` gains no name-consistency grep. The forbidden-string
  battery exists for brand-extraction defects; a repository name is not one, and a check that
  scanned for `patterson-corp` would immediately flag the historical records this change
  deliberately preserves.

## Impact

- **Breaking for consumers.** Anyone who has run `/plugin marketplace add patterson-agents/patterson-corp`
  keeps a marketplace registered under the old name with a source slug that GitHub will redirect but
  will not rename. They must re-add the marketplace under the new slug and re-enable both plugins
  under their new qualified identities. `README.md` and ADR 0006 carry the mapping.
- `managed-settings.d/` deploys nothing today (`docs/architecture/org-enforcement.md`: the
  enforcement switches are documented and deliberately left off), so no machine currently has the
  old `extraKnownMarketplaces` key bound. The rename is therefore cheapest now and gets more
  expensive with every day of rollout.
- **Cross-repository, not executable from here.** GitHub code search finds `patterson-corp`
  references in `patterson-agents/.github` (`AGENTS.md`, `copilot-org-instructions.md`,
  `profile/README.md`, `.github/workflows/standards-gate.yml`) and in
  `patterson-agents/patterson-skills` (`README.md`, `CONTRIBUTING.md`, `REFERENCES.md`,
  `.claude/settings.json`). `patterson-labs`' `docs/promotion-path.md` names this repository as the
  promotion destination (`openspec/specs/marketplaces/siblings/spec.md`). Each needs the same
  substitution in its own pull request; `tasks.md` §5 enumerates them.
- `docs/screenshots/site-home.webp` still shows the retired wordmark in the rendered site header. It
  is a screenshot, not a source artifact, and cannot be regenerated without a browser capture;
  refreshing it is listed as a follow-up rather than left unstated.
