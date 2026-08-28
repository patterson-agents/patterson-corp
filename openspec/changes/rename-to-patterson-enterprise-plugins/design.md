# Design — renaming the enterprise catalog to `patterson-enterprise-plugins`

## Context

Three names move together and must not drift apart:

| Tier | Was | Becomes | Where it is authoritative |
|---|---|---|---|
| Marketplace `name` | `patterson-corp` | `patterson-enterprise-plugins` | `.claude-plugin/marketplace.json`, projected to `.github/plugin/marketplace.json` |
| Repository slug | `patterson-agents/patterson-corp` | `patterson-agents/patterson-enterprise-plugins` | GitHub; referenced by `source.repo`, `homepage`, `repository`, and every blob URL |
| Display name | "Patterson Corp" | "Patterson Enterprise Plugins" | `site/astro.config.mjs` title, the site hero, `docs/index.html`, `docs/assets/banner.svg` |

The marketplace tier is the one with teeth. `docs/architecture/layered-settings.md` constraint 2
records the governing rule: a marketplace `name` is a flat global namespace, adding a second
marketplace under an existing name *replaces* the first, and `enabledPlugins` keys are
`plugin@marketplace` — so the name is part of every install identity, not a label on top of one.

## Decisions

### 1. Rename the marketplace tier, not the plugin tier

`patterson-engineering` and `patterson-brand` keep their names. Renaming a plugin breaks
`/plugin-name:skill-name` skill namespaces and every `enabledPlugins` key that mentions it, and
neither plugin's name is wrong. Only the catalog is misnamed.

This deliberately leaves ADR 0003 §3 — the `patterson-brand` plugin-tier collision between this
catalog and `patterson-design` — exactly where it was: open, awaiting Daniel. Note that the rename
does change the qualified identity in that record from `patterson-brand@patterson-corp` to
`patterson-brand@patterson-enterprise-plugins`, which makes the two brand plugins *marginally* easier
to tell apart at a glance but resolves nothing: the skill namespace `/patterson-brand:` is derived
from the plugin name and is still shared. ADR 0006 restates the open item so a reader who arrives
via the rename does not conclude it was settled here.

### 2. Accept the break; do not attempt an alias

There is no marketplace-alias mechanism in the staged Claude Code documentation
(`[TBD: not specified in the staged Claude Code documentation]`), and a compatibility shim would
mean publishing a second manifest under the old name — which, under the flat-namespace rule, is
exactly the "two catalogs, one name" hazard `docs/architecture/layered-settings.md` warns against.

So the break is taken cleanly and documented loudly. The mitigating fact is timing: per
`docs/architecture/org-enforcement.md`, the layered `managed-settings.d/` model is demonstrative and
the enforcement switches are off, so the install base is developers who added the catalog by hand.
Every additional day of rollout makes this rename more expensive; none makes it cheaper.

### 3. Preserve historical records; carry the mapping forward instead

`openspec/changes/archive/**` and `docs/decisions/0001`–`0005` keep `patterson-corp` verbatim.

The alternative — rewriting them — was rejected. An archived change proposal is the record of what
was proposed, in the words used at the time; a dated ADR is the record of a decision as it was made.
Editing either so it reads as though the new name existed on 2026-08-12 falsifies the audit trail
that the OpenSpec workflow exists to produce, and it would specifically corrupt ADR 0003, whose
entire argument is a table of *observed* marketplace names collected on a stated date.

Three things keep the preserved names from becoming traps:

1. ADR 0006 states the mapping in one place and is linked from the ADR index in `docs/index.html`.
2. GitHub redirects the old repository slug indefinitely after a rename, so blob URLs inside those
   records keep resolving.
3. `openspec/specs/**` — the *current* specification, which is what anyone builds against — is
   updated, so the live contract never carries a stale name.

The boundary is therefore: **anything that describes the present is updated; anything that testifies
about the past is not.** In-flight changes under `openspec/changes/` that are not yet archived
(`add-branded-doc-sites`, `add-house-standards-enforcement`) describe work still to be done, so they
are updated — a task list naming a repository that no longer exists under that name is not history,
it is a broken instruction.

### 4. Spec occurrences are references, not requirements

Six specs under `openspec/specs/` mention `patterson-corp`. Every occurrence names this repository;
none states a requirement *about* the name. Substituting the new name leaves each requirement's
behavior byte-for-byte equivalent in meaning, so the change declares no MODIFIED capabilities and
adds one new one instead. Declaring six MODIFIED deltas would tell a future reader that six
behavior contracts changed on this date, which is false and would make the deltas useless as a
signal.

### 5. The banner becomes vector-only

`docs/assets/banner.webp` (33 KiB) is a rasterization of `docs/assets/banner.svg` with the wordmark
"Patterson Corp" baked into pixels. This repository has no raster toolchain — no `rsvg-convert`,
`cwebp`, `inkscape`, or ImageMagick — and adding one would violate the zero-dependency rule for the
sake of one image. Options considered:

| Option | Outcome |
|---|---|
| Keep the WebP as-is | `README.md`'s first impression shows the retired name indefinitely. Rejected. |
| Regenerate the WebP | Not possible in this environment; would require a toolchain this repo forbids. |
| **Point `README.md` at the SVG and delete the WebP** | Correct wordmark immediately, 33 KiB off the size budget, one source of truth. SVG is explicitly exempt from the no-binaries rule at any size, and `README.md` already renders `docs/diagrams/*.svg` through `<img>` tags, so the mechanism is proven here. **Chosen.** |

`.github/workflows/pages.yml` copies `assets/banner.webp` into the composed Pages artifact; that
copy is dropped in the same commit so the workflow does not fail on a missing file.

`docs/screenshots/site-home.webp` is a different case: it is a screenshot of the rendered site, not
a derived asset, and refreshing it needs a browser capture after the site redeploys. It is left in
place and listed as a follow-up rather than silently deleted, because deleting it would leave
`README.md`'s "Live site" section with a broken image for a name-only defect.

### 6. `corp.patterson.sh` stays

The custom domain is not part of the requested rename. Changing it means a DNS record, a Pages
domain reconfiguration, and a redirect strategy for every published link — a separate operation with
its own failure modes. The site's *title* changes; its origin does not. `site/astro.config.mjs`'s
`site:` value and `site/README.md`'s heading stay `corp.patterson.sh`.

### 7. No name-consistency check in the gate

`scripts/verify-all.sh` gets no grep for the retired name. Such a check would fire on every
preserved historical record by design, and suppressing that with an allowlist of archive paths adds
a maintenance burden for a one-time migration. The projection check that *does* matter —
`sh scripts/sync-manifests.sh --check`, enforced by `.github/workflows/manifest-sync.yml` — already
guarantees the renamed manifest cannot reach `main` without its Copilot projection.

## Risks

| Risk | Mitigation |
|---|---|
| A developer's existing install silently keeps pointing at the old catalog | `README.md` migration note and ADR 0006 state both qualified identities explicitly; the old registration keeps working until removed, so failure is stale, not broken |
| Sibling repositories keep the old slug and drift | `tasks.md` §5 enumerates every known consumer with its files; each needs its own pull request and cannot be done from this repository |
| The GitHub rename is not performed, leaving manifests pointing at a slug that does not exist | `tasks.md` §5.1 is the first follow-up; until it runs, `patterson-agents/patterson-enterprise-plugins` does not resolve. This is an operator action with no in-repo substitute |
| Preserved historical names read as an oversight | ADR 0006 states the policy and the reason, so a reader who finds a stale name in an archive finds the rule that put it there |
