## Why

HANDOFF.md 1G ("Reconcile the legacy marketplaces") raises an "active name collision" between the
legacy marketplaces. **Correction C1 found the premise is wrong at the marketplace level and worse
at the plugin level.** The marketplace names are `patterson-corp`, `patterson`, `patterson-skills`,
and `patterson-design` -- all distinct, so the flat global marketplace namespace is not in conflict.
The real collisions are between *plugins*:

1. `patterson-design` is published by both `patterson-marketplace` and `patterson-skills`.
2. **`patterson-brand` is published by both `patterson-corp` and `patterson-design-plugins`** -- a
   collision HANDOFF.md never reported at all.

Plugin names collide first-found-wins, so the second one silently loses. This needs a recorded
decision, not a quiet rename: renaming a published plugin breaks every existing install.

Two other legacy-repo items ride along. `patterson-skills` holds
`agentic-workflow-designer`, described in HANDOFF.md 1F as "the best single artifact found in the
legacy repos", and the repository is to be retired after harvest. And correction C2 records that
`patterson-marketplace` carries **55 uncommitted changes** -- a 21-file `.py`-to-`.ts` conversion
under `.agents/skills/` performed by a prior session of this agent, with semantics verified per
`.remember/now.md` -- which must be reviewed and either committed or escalated, never blind-added.

## What Changes

- Harvest `agentic-workflow-designer` from `patterson-skills` into `patterson-labs`, renaming the
  `SKILL.md` frontmatter `name` to match its new directory.
- Deprecate `patterson-skills` **locally only**: a README banner and a `deprecated: true` flag plus
  a description prefix in its `marketplace.json` pointing readers at `patterson-marketplace`. Commit
  on the existing history; no remote archive.
- Review correction C2's 55-change diff in `patterson-marketplace` for erasable syntax, `node:`
  builtins only, and behavioural parity. If clean, commit it as a conversion refactor citing the
  prior session's provenance. If not clean, commit nothing and escalate.
- Write `docs/decisions/0003-plugin-name-reconciliation.md` recording C1 honestly: the marketplace
  names do not collide and HANDOFF.md's premise was wrong; the `patterson-design` plugin collision
  resolves through the `patterson-skills` retirement; and the `patterson-brand` collision is
  **decision-needed** with options and a recommendation, not a rename.

## Capabilities

### New Capabilities

- `marketplaces/name-reconciliation`: the org-wide rules for marketplace and plugin naming across
  Patterson repositories, the recorded state of the two real plugin-level collisions, and the
  deprecation posture of the retiring `patterson-skills` catalog.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **Do not rename `patterson-brand`.** Renaming a published plugin is a breaking change for every
  existing install. The ADR presents options and a recommendation and leaves the decision to Daniel;
  it goes in the morning report.
- **No remote archive of `patterson-skills`.** Deprecation is local: README banner and manifest
  flags only. Archiving the repository on GitHub is a remote mutation and is out of scope.
- **No blind `git add -A` in `patterson-marketplace`.** The 55 changes are reviewed file by file
  against the conversion criteria, or nothing is committed.
- **No conversion work.** The `.py`-to-`.ts` conversion already exists from a prior session; this
  change reviews and commits it, it does not redo or extend it.
- **No history rewriting.** `patterson-marketplace` and `patterson-skills` receive additive commits
  on their existing histories.
- **No pushing and no `gh` usage.**

## Impact

- `patterson-labs` gains the harvested skill -- so `populate-sibling-marketplaces` must land first.
- `patterson-skills` gains a deprecation commit on its existing history; its README and
  `marketplace.json` change, its content does not.
- `patterson-marketplace` gains at most one refactor commit covering the 21 converted scripts.
- `patterson-corp` gains `docs/decisions/0003-plugin-name-reconciliation.md`.
- The `patterson-brand` collision remains open and becomes a decision item in the morning report.
