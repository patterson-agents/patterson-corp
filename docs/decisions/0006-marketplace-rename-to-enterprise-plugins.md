# 0006 — The enterprise catalog is renamed to `patterson-enterprise-plugins`

**Status:** Accepted
**Date:** 2026-08-28
**Decider:** Daniel Bodnar
**Scope:** the marketplace `name`, repository slug, and display name of the enterprise catalog, and
every surface in this repository that carries one of them

## Context

This repository was created as `patterson-corp` and published its catalog under marketplace `name`
`patterson-corp`. Two things are wrong with that name.

**It misplaces the artifact in the layer model.** "Corp" reads as *Patterson Corporate* — a
sub-organization, a sibling of `patterson-dental` and `patterson-vet`. The artifact is the opposite:
`docs/architecture/layered-settings.md` describes a six-layer model in which this catalog is the
**enterprise** layer that every sub-org layer extends. The name inverts the relationship that the
architecture depends on a reader understanding.

**It does not say what is inside.** The repository publishes a plugin marketplace. `patterson-corp`
could name a corporate landing page, an intranet, or an org-chart tool with equal plausibility.

Daniel directed the rename to `patterson-enterprise-plugins` (identifier and repository slug) and
"Patterson Enterprise Plugins" (display name).

### Why this is a breaking change and not a relabel

`docs/architecture/layered-settings.md` constraint 2 records the governing rule, quoting the vendor
documentation:

> Each user can register only one marketplace per name: adding a second marketplace with the same
> name replaces the first.

and notes that `enabledPlugins` keys are the qualified pair `plugin@marketplace`, so "a replaced
marketplace silently redirects every plugin enabled from it." The marketplace `name` is therefore
part of every install identity in the system, not a caption on one. Changing it changes what every
consumer has installed.

`docs/decisions/0003-plugin-name-reconciliation.md` establishes the same point from the other
direction: it declines to rename a *plugin* precisely because "renaming a published plugin is a
breaking change for every existing install."

## Decision

### 1. Three names move together

| Tier | Retired | Current |
|---|---|---|
| Marketplace `name` | `patterson-corp` | `patterson-enterprise-plugins` |
| Repository slug | `patterson-agents/patterson-corp` | `patterson-agents/patterson-enterprise-plugins` |
| Display name | Patterson Corp | Patterson Enterprise Plugins |

The canonical declaration is `.claude-plugin/marketplace.json`, projected byte-for-byte to
`.github/plugin/marketplace.json` by `scripts/sync-manifests.sh` per
`docs/decisions/0002-cross-vendor-manifest-projection.md`. The projection check
(`.github/workflows/manifest-sync.yml`) makes it impossible to merge the rename into one manifest
and not the other.

### 2. The rename is at the marketplace tier only

`patterson-engineering` and `patterson-brand` keep their plugin names. Plugin skills are namespaced
`/plugin-name:skill-name`, so renaming a plugin breaks every skill invocation as well as every
`enabledPlugins` key — and neither plugin's name is wrong. Only the catalog was misnamed.

Consequently, **ADR 0003 §3 remains open**. The `patterson-brand` plugin-name collision between this
catalog and the `patterson-design` marketplace is unaffected by this rename: the qualified identities
now read `patterson-brand@patterson-enterprise-plugins` and `patterson-brand@patterson-design`, which
is marginally easier to read but resolves nothing, because the ambiguous `/patterson-brand:` skill
namespace derives from the plugin name and is still shared. That decision is still Daniel's.

### 3. No alias, no shim

There is no marketplace-alias mechanism in the staged Claude Code documentation
(`[TBD: not specified in the staged Claude Code documentation]`). The only way to keep the old name
resolvable would be to publish a second manifest under it — which is exactly the "two catalogs, one
name" hazard that the flat-namespace rule and `docs/architecture/layered-settings.md`'s
first-found-wins warning exist to prevent. The break is taken cleanly and documented instead.

The migration is stated in `README.md` § "Migrating from `patterson-corp`" and reproduced here:

| Was | Now |
|---|---|
| `/plugin marketplace add patterson-agents/patterson-corp` | `/plugin marketplace add patterson-agents/patterson-enterprise-plugins` |
| `patterson-engineering@patterson-corp` | `patterson-engineering@patterson-enterprise-plugins` |
| `patterson-brand@patterson-corp` | `patterson-brand@patterson-enterprise-plugins` |

GitHub redirects the retired repository slug after a rename, so an existing registration keeps
resolving and nothing fails loudly. It simply stops tracking a name that is no longer published.
Consumers re-add the marketplace under the new slug and re-enable both plugins.

**Timing is the mitigation.** Per `docs/architecture/org-enforcement.md`, the layered
`managed-settings.d/` model is demonstrative and its enforcement switches are deliberately off, so no
machine currently has the retired `extraKnownMarketplaces` key bound by policy. The install base is
developers who added the catalog by hand. Every day of rollout makes this rename more expensive;
none makes it cheaper.

### 4. Historical records are preserved, not rewritten

`openspec/changes/archive/**` and ADRs 0001, 0002, 0003, and 0005 keep `patterson-corp` verbatim.

An archived change proposal records what was proposed, in the words used at the time. A dated ADR
records a decision as it was made. Editing either so it reads as though this name existed on
2026-08-12 falsifies the audit trail the OpenSpec workflow exists to produce. The case is sharpest
in ADR 0003, whose entire argument rests on a table of marketplace names *observed on a stated date*
by a quoted command — rewriting that table would turn evidence into fabrication.

Three things keep the preserved names from becoming traps:

1. This record states the mapping in one place, and is linked from the decision index.
2. GitHub's rename redirect keeps the blob URLs inside those records resolving.
3. `openspec/specs/**` — the *current* specification, which is what anything is built against — is
   updated, so the live contract never carries a retired name.

The boundary is: **anything describing the present is updated; anything testifying about the past is
not.** In-flight changes under `openspec/changes/` that are not yet archived are updated, because a
`tasks.md` is an instruction to be executed, not a record of work already done.

### 5. `corp.patterson.sh` is unchanged

The custom domain is out of scope. Moving it means a DNS change, a Pages reconfiguration, and a
redirect strategy for every published link. The site's title changes; its origin does not.

### 6. The banner becomes vector-only

`docs/assets/banner.webp` carried the retired wordmark in pixels and had no regeneration path — this
repository has no raster toolchain, and adding one would breach the zero-dependency rule for a single
image. `README.md` and the composed Pages artifact now use `docs/assets/banner.svg`, which is exempt
from the no-binaries rule at any size and is the source the WebP was derived from; the WebP is
deleted. `docs/screenshots/site-home.webp` still shows the retired wordmark in the captured site
header and needs a fresh capture after the renamed site redeploys.

### 7. The gate gains no name-consistency check

`scripts/verify-all.sh` does not grep for the retired name. Such a check would fire on every
historical record §4 deliberately preserves, and an allowlist of archive paths would be permanent
maintenance for a one-time migration. The check that matters —
`sh scripts/sync-manifests.sh --check` — is already enforced in CI.

## Consequences

- Every consumer of the catalog must re-add it and re-enable both plugins. This is stated in
  `README.md` and here; it is not discoverable from a failure, because there will not be one.
- Sibling repositories in `patterson-agents` still name the retired slug —
  `.github` (`AGENTS.md`, `copilot-org-instructions.md`, `profile/README.md`,
  `.github/workflows/standards-gate.yml`), `patterson-skills` (`README.md`, `CONTRIBUTING.md`,
  `REFERENCES.md`, `.claude/settings.json`), and `patterson-labs` (`docs/promotion-path.md`, which
  names this repository as the promotion destination). Each needs its own pull request; they are
  enumerated in `openspec/changes/rename-to-patterson-enterprise-plugins/tasks.md` §5 and cannot be
  executed from this repository.
- Until the GitHub repository is actually renamed, every updated slug in this repository points at a
  location that does not resolve. The rename is the first follow-up, not an afterthought.
- A reader who finds `patterson-corp` in an archived proposal or in ADR 0001–0005 is looking at a
  preserved record, not an oversight. This record is the forward mapping.
- ADR 0003 §3's open `patterson-brand` collision is untouched and still awaits a decision.

## References

- `openspec/changes/rename-to-patterson-enterprise-plugins/` — proposal, design, tasks, and the
  `marketplaces/enterprise-identity` capability spec
- `docs/architecture/layered-settings.md` — constraint 2, "Marketplace `name` is a flat global
  namespace"; the first-found-wins warning
- `docs/architecture/org-enforcement.md` — why no machine is bound to the retired key today
- `docs/decisions/0002-cross-vendor-manifest-projection.md` — the projection this rename must keep
  byte-identical
- `docs/decisions/0003-plugin-name-reconciliation.md` — the plugin-tier collisions this rename does
  not resolve, and the precedent for treating a rename as breaking
