## Why

`patterson-labs`, `patterson-dental`, and `patterson-vet` exist as directories and nothing else --
correction C5 verified that all three contain **zero files**, only empty directory shells. They
cannot be committed, cannot be validated, and cannot receive the design-system extractions that
depend on them. HANDOFF.md 1F ("Sibling marketplaces, `gh aw`, agentics") requires `patterson-labs`
populated with a documented promotion path to `patterson-corp`, and dental and vet made "minimal but
structurally complete".

`patterson-labs` carries a second job. HANDOFF.md 1F names
`patterson-skills/.github/skills/agentic-workflow-designer/SKILL.md` "the best single artifact found
in the legacy repos", and labs is its harvest destination -- so labs must be structurally ready
before the retiring repository is harvested.

## What Changes

- Populate each of `patterson-labs`, `patterson-dental`, and `patterson-vet` with:
  - `.claude-plugin/marketplace.json` carrying a **distinct** marketplace `name` (the name space is
    flat and global; a duplicate name replaces rather than coexists)
  - a house-style `README.md` (badges, SVG or mermaid diagram, GFM alerts, tables)
  - `.gitignore`
  - `.devcontainer/devcontainer.json` on a pinned `node:24`-family image
  - `.github/workflows/ci.yml`
  - a zero-dependency `run-tests.sh` suite covering manifest validation, skill-name-equals-directory,
    and forbidden content -- written test-first
  - a `managed-settings.d/` placeholder following the layered-settings shape
- Additionally in `patterson-labs`:
  - `docs/promotion-path.md` describing incubation to `patterson-corp` graduation
  - the harvest destination for the `agentic-workflow-designer` skill
  - `docs/gh-aw-adoption.md` citing `.tmp/staging/reuse/agentics-and-gh-aw.md` and the three agentic
    workflows already running in the design-plugins repository

## Capabilities

### New Capabilities

- `marketplaces/siblings`: the structural baseline every Patterson sibling marketplace repository
  satisfies, plus the incubation-to-canonical promotion path that `patterson-labs` documents.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **The agentics "GitHub template" half is documented, not executed.** Marking a repository as a
  GitHub template requires a remote mutation, which is out of scope for this run. Recorded as a
  scope reduction in the deviations list, per the plan's 1F row.
- **No repository creation and no pushing.** `patterson-labs`, `patterson-dental`, and
  `patterson-vet` stay local-only pending open questions #1 (public-repo approval) and #2 (LICENSE).
- **No plugins.** These are structurally complete marketplace shells; populating them with actual
  plugin content is separate work, except for the harvested `agentic-workflow-designer` skill and
  the design-system extractions that land via their own changes.
- **No design-system content.** The claude.ai design imports land in `patterson-labs` through
  `import-claude-design-projects`, sequenced after this change.
- **No `LICENSE`.** Same blocked open question as `patterson-corp`.
- **No binaries in any README.**

## Impact

- Three repositories move from empty to committable, unblocking their first commits.
- `patterson-labs` becomes the incubation home referenced by the design import and the skill harvest,
  so both of those changes depend on this one landing first.
- Adds three more `run-tests.sh` suites to the program-wide gate battery.
- The `patterson-skills` retirement recorded in `reconcile-plugin-name-collisions` points readers at
  the labs harvest destination created here.
