## Why

`patterson-corp` publishes its plugin catalog only as `.claude-plugin/marketplace.json`, so GitHub
Copilot and VS Code consumers cannot discover Patterson plugins at all. HANDOFF.md 1D
("Cross-vendor manifest projection") records the decisive evidence: `githubnext/ado-aw` ships
`.claude-plugin/marketplace.json` and `.github/plugin/marketplace.json` **byte-identical**
(vendored at `patterson-agents.archive/vendored/github.com/githubnext/ado-aw/`), which means
cross-vendor support is a copy, not a transformation. Doing it by hand guarantees silent drift
between two files that must stay identical.

## What Changes

- Add `scripts/sync-manifests.sh` (POSIX sh) that copies `.claude-plugin/marketplace.json` to
  `.github/plugin/marketplace.json`, creating the destination directory when absent.
- Add a **separate** `.github/workflows/manifest-sync.yml` that fails the build when the two
  manifests diverge. It never edits `.github/workflows/ci.yml`, which `add-repo-furniture` owns.
- Encode the awesome-copilot gotcha from HANDOFF.md 1D: Claude requires plugin `source` values to
  begin with `./`, so the projection asserts that shape rather than assuming it.
- Add `docs/decisions/0002-cross-vendor-manifest-projection.md` recording copy-not-transform, the
  `cmp` evidence, and the three-format root-token table (`${PLUGIN_ROOT}` / either / `${CLAUDE_PLUGIN_ROOT}`).

## Capabilities

### New Capabilities

- `marketplace/cross-vendor-manifests`: projecting the canonical Claude marketplace manifest to the
  GitHub Copilot manifest location, and detecting divergence in CI.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **No transformation.** The projection is a byte-for-byte copy. Emitting a differently-shaped
  Copilot manifest is explicitly out of scope until evidence says a transform is required.
- **No Agent Plugins 1.0 manifest.** Only the Claude and Copilot locations are projected; the
  vendor-neutral `plugin.json` + `$schema` form is documented, not generated.
- **No edits to `ci.yml`.** Divergence checking lives in its own workflow file.
- **No remote operations.** Nothing is pushed; the workflow is committed and only activates when
  Daniel pushes.
- Per-plugin `plugin.json` projection is not included; this change covers the marketplace manifest only.

## Impact

- New: `scripts/sync-manifests.sh`, `.github/workflows/manifest-sync.yml`,
  `.github/plugin/marketplace.json` (generated), `docs/decisions/0002-cross-vendor-manifest-projection.md`.
- New: a test suite asserting the projection and the `./` source-prefix rule, written before the script.
- Touches no plugin content and no existing workflow.
