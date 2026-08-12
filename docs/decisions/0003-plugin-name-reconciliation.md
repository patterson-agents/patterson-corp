# 0003 — Plugin name reconciliation: the collision is at the plugin tier, not the marketplace tier

**Status:** Accepted for the parts executed on 2026-08-12; the `patterson-brand` section is
**Proposed** and awaits Daniel's decision
**Date:** 2026-08-12
**Decider:** Daniel Bodnar
**Scope:** marketplace `name` and plugin `name` values across every Patterson marketplace repository

## Context

`HANDOFF.md` §1G opens with a `[!CAUTION]` block titled **"Active name collision"**:

> **Active name collision.** `patterson-marketplace` publishes marketplace name **`patterson`**;
> `patterson-skills` publishes **`patterson-skills`**; and **both publish a plugin named
> `patterson-design`**. Because marketplace names are a flat global namespace and plugin names
> collide first-found-wins, this is a live hazard.
>
> — `HANDOFF.md` §1G, lines 221–225

**The premise of that caution is incorrect at the marketplace tier.** The block names two
marketplaces — `patterson` and `patterson-skills` — and then invokes the flat-global-namespace
property as the reason they are hazardous. But `patterson` and `patterson-skills` are *different
strings*. The flat namespace is real (see the constraint below) and it is exactly why the property
matters, but it is not violated by these two names. The only collision the block actually
demonstrates is the *plugin* named `patterson-design`, published by both — which is a plugin-tier
problem, not a marketplace-tier one. A reader who takes §1G at face value will go looking for a
marketplace-name conflict that does not exist, and will miss a second plugin-tier collision that
§1G never mentions at all.

This record corrects §1G rather than working around it, so the correction is findable by anyone who
reaches §1G first.

### Verified marketplace names and plugin inventories

Collected on 2026-08-12 by reading the `name` field and the `plugins[].name` values from every
`.claude-plugin/marketplace.json` in the workspace. Reproducible with:

```sh
for f in */.claude-plugin/marketplace.json; do
  node -e "const m=require('./$f');
    console.log(m.name, '::', (m.plugins||[]).map(p=>p.name).join(', ') || '(none)')"
done
```

That loop also picks up the `design-plugins/` fork, which prints a second `patterson-design` row;
the table below lists the published repositories only and treats the fork separately in the note
that follows.

| Repository | Marketplace `name` | Plugins published |
|---|---|---|
| `patterson-corp` | `patterson-corp` | `patterson-engineering`, **`patterson-brand`** |
| `patterson-marketplace` | `patterson` | **`patterson-design`** |
| `patterson-skills` | `patterson-skills` | **`patterson-design`** |
| `patterson-design-plugins` | `patterson-design` | **`patterson-brand`**, `patterson-deck`, `patterson-executive-deck`, `patterson-corporate-page`, `patterson-file-manager`, `patterson-docs`, `patterson-tutorialkit`, `patterson-corporate-website`, `patterson-storefront` |
| `patterson-labs` | `patterson-labs` | `patterson-workflows` |
| `patterson-dental` | `patterson-dental` | (none yet) |
| `patterson-vet` | `patterson-vet` | (none yet) |

The four names §1G is concerned with — `patterson-corp`, `patterson`, `patterson-skills`,
`patterson-design` — are **four distinct strings**. So are all seven above. No marketplace-tier
collision exists among the published repositories.

> [!NOTE]
> **One marketplace-name duplicate does exist, and it is a working fork, not a publication.** The
> local `design-plugins/` checkout (remote `patterson-agents/design-plugins`) carries the same
> marketplace `name` value `patterson-design` as `patterson-design-plugins/`, because it is a fork
> of it. Under the flat-namespace rule below, whichever of the two a user registers second silently
> replaces the first. This is precisely the case the operational rule in
> `docs/architecture/layered-settings.md` warns about — a name "must be claimed once, org-wide, and
> never reused for a fork or a mirror." **Resolving the fork's name is out of scope for this record**
> (no rename is applied anywhere here), but it is flagged so the fork is not published under the
> borrowed name by accident. `patterson-agents.archive/` also holds stale copies of three of these
> manifests; archived copies are not published and are excluded from the table.

### The constraint that makes names matter

`docs/architecture/layered-settings.md`, **constraint 2 — "Marketplace `name` is a flat global
namespace"** — records the governing rule, quoting the vendor documentation:

> Each user can register only one marketplace per name: adding a second marketplace with the same
> name replaces the first.
>
> — `CC-marketplaces` § Marketplace schema > Required fields, the `name` row

That doc continues: "There is no scoping by owner, by org, or by source. `patterson-corp` is
`patterson-corp` everywhere on the machine, and marketplace state is stored once per user in
`~/.claude/plugins/known_marketplaces.json`, 'not per project'." Its first-found-wins warning also
notes that **`enabledPlugins` keys are `plugin@marketplace`**, so "a replaced marketplace silently
redirects every plugin enabled from it."

Primary source staged locally at
`.tmp/staging/docs/claude-code/plugin-marketplaces.md` line 168 (fetched 2026-08-11 from
`https://code.claude.com/docs/en/plugin-marketplaces.md`; provenance in
`.tmp/staging/docs/_SOURCES.md`, row A1, status `ok`).

### What is verified about *plugin*-name collisions, and what is not

§1G asserts that "plugin names collide first-found-wins." **This record does not adopt that claim
as documented fact**, because the staged vendor documentation does not state it. What the staged
documentation does establish:

1. **Within one marketplace**, duplicate plugin names are a validation error:
   `Duplicate plugin name "x" found in marketplace` → "Give each plugin a unique `name` value"
   (`plugin-marketplaces.md` lines 1149, 1165). `claude plugin validate .` detects this.
2. **Across marketplaces**, a plugin's identity is the qualified pair `plugin@marketplace`
   (`plugin-marketplaces.md`; `layered-settings.md` constraint 2). `patterson-brand@patterson-corp`
   and `patterson-brand@patterson-design` are therefore *distinct install identities*, and
   `claude plugin validate .` — which is scoped to one marketplace directory — will never report
   the pair.
3. **Plugin skills are namespaced by plugin name, not by marketplace**: "Plugin skills are
   namespaced as `/plugin-name:skill-name`" (`plugins.md` line 464).

Point 3 is the concrete hazard, and it is stronger evidence than the §1G phrasing. Two plugins that
share a `name` project **identical skill namespaces** into a session — `/patterson-brand:…` from
`patterson-corp` and `/patterson-brand:…` from `patterson-design` are indistinguishable at the call
site. The failure mode is silent ambiguity in a session that has both marketplaces registered, plus
the ordinary human and tooling confusion of two different artifacts wearing one name. Whether one
definition wins deterministically, and by what rule, is
`[TBD: not specified in the staged Claude Code documentation]`. That uncertainty is itself an
argument for not shipping the duplicate.

## Decision

### 1. Record the correction

`HANDOFF.md` §1G's marketplace-tier collision does not exist. The marketplace names are distinct;
the real collisions are between plugins. Both are recorded below.

### 2. Collision A — plugin `patterson-design` — **RESOLVED by retirement** (Accepted)

`patterson-design` is published by both `patterson-marketplace` (marketplace `patterson`) and
`patterson-skills` (marketplace `patterson-skills`).

**Resolution: `patterson-marketplace` is the surviving publisher. `patterson-skills` is deprecated
and its copy is withdrawn.** No rename was required and no consumer action is needed. Executed in
workstream 1G-a as a local-only deprecation on `patterson-skills`' existing history:

- A `[!CAUTION]` banner at the top of `patterson-skills/README.md` states the catalog is deprecated
  (2026-08-12), names `patterson-marketplace` (marketplace name `patterson`) as the canonical
  catalog, and records that `agentic-workflow-designer` now lives in `patterson-labs`.
- `patterson-skills/.claude-plugin/marketplace.json` carries the description prefix
  `[DEPRECATED - superseded by the patterson marketplace]`.
- The banner explicitly states that existing installs of `patterson-design@patterson-skills` keep
  working. The collision resolves by attrition, not by breaking anyone.
- No remote operation: the repository was not archived, transferred, or pushed.

> [!NOTE]
> The `deprecated: true` machine-readable flag called for by the change proposal is **not** present
> in `patterson-skills/.claude-plugin/marketplace.json` as of this writing — only the human-readable
> description prefix and the README banner are. Left as a follow-up for 1G-a rather than corrected
> here.

### 3. Collision B — plugin `patterson-brand` — **OPEN, decision needed** (Proposed)

**This collision was never reported in `HANDOFF.md`.** The plugin name `patterson-brand` is
published by **both**:

| Publisher | Qualified ID | Version | What it contains |
|---|---|---|---|
| `patterson-corp` (marketplace `patterson-corp`) | `patterson-brand@patterson-corp` | 0.1.0 | the governed corporate brand plugin |
| `patterson-design-plugins` (marketplace `patterson-design`) | `patterson-brand@patterson-design` | 1.1.0 | the design-system brand plugin, carrying the `ds/` snapshot; the "install first" entry of that marketplace's nine |

Both publishers are live. Both marketplaces are **intended to be installed together** — the layered
settings design enables `patterson-brand@patterson-corp` for whole departments
(`layered-settings.md`, `30-department.json`), while the design-side `patterson-brand` is the entry
the workspace `CLAUDE.md` marks "install first" (line 26) and its own manifest entry calls the
"Foundation plugin for all Patterson work." So the two will routinely co-exist in one session,
which is exactly the condition under which the shared `/patterson-brand:` skill namespace becomes
ambiguous.

**No rename is applied by this record.** Renaming a published plugin is a breaking change for every
existing install on whichever side is renamed, and there is no way to determine from here which side
has more consumers. The decision is Daniel's.

#### Options

| # | Option | What it costs | What it buys | Risk |
|---|---|---|---|---|
| **a** | Rename the `patterson-design-plugins` plugin to **`patterson-design-brand`** | **Breaking** for existing `patterson-brand@patterson-design` installs; version bumps in both `plugin.json` and `marketplace.json`; README, docs, and cross-plugin references updated across a nine-plugin marketplace; the `ds/` snapshot directory must not be flattened | Namespace conflict gone. Name becomes self-describing and matches its marketplace. `patterson-corp` — the governed, org-wide catalog — keeps the plain name, which is the right default owner of an unqualified brand identity | Every consumer must re-install. Breakage is loud and immediate, but bounded and one-time, and the marketplace is young (v1.1.0) with an internal-only audience |
| **b** | Fold the design-plugins `ds/` brand plugin **into** `patterson-corp`'s `patterson-brand` | Real consolidation work: merge two plugin bodies, reconcile `ds/` snapshot invariants against `patterson-corp`'s structure, decide a single version line, retire one entry from the design marketplace | One brand plugin, one source of truth, no ambiguity ever again. Ends the underlying duplication rather than relabelling it | Largest effort of the three. Couples two repositories with different release cadences and different owners. Can strand the other eight design plugins, which currently depend on `patterson-brand` being installed from their own marketplace |
| **c** | Accept the duplicate; document install-order guidance | Nothing today | Zero immediate work; no install breaks | **Fragile.** It only holds if the two are never registered together — and they are *designed* to be. Resolution across marketplaces is `[TBD: not specified in the staged documentation]`, so the guidance would rest on undocumented behaviour that can change in any release. Failure is silent: no error, no warning, wrong skill |

#### Recommendation

**Option (a) — rename `patterson-design-plugins`' plugin to `patterson-design-brand`** — with
option (b) as the right long-term shape if the two brand plugins are found to be substantially the
same artifact.

Reasoning:

1. **(c) is not viable here.** Its only premise is that the two plugins rarely co-exist. The
   opposite is true by design: both marketplaces are meant to be installed together, and
   `patterson-brand` is the *first* install on the design side. An option whose safety condition is
   violated by the intended deployment is not a decision, it is a deferral — and it defers into a
   silent failure mode resting on undocumented behaviour.
2. **`patterson-corp` has the stronger claim to the unqualified name.** It is the governed org-wide
   catalog, it is what managed settings enable by department, and `patterson-brand@patterson-corp`
   is already written into the layered-settings design. Renaming the corp side would invalidate
   published policy artifacts as well as installs.
3. **The design side is cheaper to rename now than it ever will be again.** It sits at v1.1.0 with
   an internal-only audience, and the org-wide rollout that would multiply its install base — the
   managed-settings deployment described in `layered-settings.md` — has not happened yet. The cost
   of (a) only grows from here. (Note that `patterson-design-plugins` *is* already published to the
   remote — it carries merged pull requests — so "rename before anyone installs it" is no longer
   available; the argument is about relative cost, not zero cost.)
4. **`patterson-design-brand` is a better name on its merits** — it matches its marketplace
   (`patterson-design`), and it distinguishes the design-system brand kit from the corporate brand
   plugin at a glance rather than by qualifier.
5. **(b) is better but not yet decidable.** Folding the plugins together is the only option that
   removes the duplication rather than renaming it, and it should be preferred if inspection shows
   the two are near-duplicates. But it is a multi-repository consolidation with two owners and two
   cadences, and it would strand the other eight design plugins that expect `patterson-brand` from
   their own marketplace. Do (a) now; evaluate (b) deliberately.

**Action required from Daniel: choose (a), (b), or (c).** Until then the duplicate stands and no
file is renamed. Carried into the morning report as an open decision item.

## Consequences

- `HANDOFF.md` §1G's caution is corrected in the record rather than silently ignored. A reader who
  finds §1G first can find this file.
- The `patterson-design` duplicate stops being a live concern once `patterson-skills` retires. No
  consumer had to act.
- The `patterson-brand` duplicate **remains live**. If Daniel does not act on the report, it
  persists into publication as a silent ambiguity in the `/patterson-brand:` skill namespace for
  anyone who installs both marketplaces — which is the intended configuration. This is accepted
  deliberately: a rename that breaks installs without approval is worse and is not reversible from
  the consumer side.
- `design-plugins`' borrowed marketplace name `patterson-design` is now recorded. It must be
  resolved before that fork is registered anywhere alongside `patterson-design-plugins`.
- Nothing was renamed in `patterson-corp` or in `patterson-design-plugins`.

## References

- `HANDOFF.md` §1G (lines 219–229) — the corrected premise
- `docs/architecture/layered-settings.md` — constraint 2, "Marketplace `name` is a flat global
  namespace"; the first-found-wins warning; `30-department.json`
- `.tmp/staging/docs/claude-code/plugin-marketplaces.md` — lines 168, 1149, 1165
- `.tmp/staging/docs/claude-code/plugins.md` — line 464 (`/plugin-name:skill-name` namespacing)
- `.tmp/staging/docs/_SOURCES.md` — fetch provenance for the staged documentation
- `openspec/changes/reconcile-plugin-name-collisions/` — proposal, design, tasks, and the
  `marketplaces/name-reconciliation` capability spec
- `docs/decisions/0002-cross-vendor-manifest-projection.md` — the sibling marketplace-manifest ADR
