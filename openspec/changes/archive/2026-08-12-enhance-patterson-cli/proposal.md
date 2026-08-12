## Why

`cli/` (patterson-cli) is the scaffolder that generates the marketplace repositories the rest of
this program is hand-building. Every pattern established by hand -- dual-vendor manifest emission,
`_SOURCES.md` and `REFERENCES.md` provenance in every skill -- has to exist in the tool, or the next
repository scaffolded will reintroduce the drift the hand work just removed.

Four verified drifts justify the work. **D5**: `marketplaceGenerator` emits only
`.claude-plugin/marketplace.json`, so a scaffolded repo cannot be discovered by Copilot -- the same
gap `add-cross-vendor-manifest-projection` fixes by hand. **D1**: the comment at
`packages/cli/src/commands/plugins.ts:8` claims the marketplaces IR is consumed, and it is not.
**D3**: `specs/001-patterson-cli-v1/tasks.md` shows T001-T028 as unchecked although the work landed.
And 19 org-rename edits sit uncommitted with `package.json` repository URLs pointing at
`patterson-cli` rather than the actual remote `patterson-agents/cli`.

This workstream follows **cli's own rules**, not HANDOFF.md's: `AGENTS.md`, the constitution at
`.specify/memory/constitution.md`, and the `specs/001-patterson-cli-v1/` tree win on any drift.
Bun-only, and `bun run gate` (typecheck, test, lint) must pass before every commit.

## What Changes

- Review and commit the 19 pending org-rename edits, aligning `package.json` repository URLs to
  `patterson-agents/cli`.
- Extend `marketplaceGenerator` (`packages/generators/src/generators.ts:387`) to emit
  `.claude-plugin/marketplace.json` **and** `.github/plugin/marketplace.json` byte-identically, and
  add a `CheckDef` divergence check surfacing through `doctor` and `check`.
- Extend `skillGenerator` with `_SOURCES.md` and `REFERENCES.md` templates, plus a `CheckDef`
  asserting their presence.
- Fix the false comment at `packages/cli/src/commands/plugins.ts:8`.
- Truth up the stale `specs/001-patterson-cli-v1/tasks.md` checkboxes T001-T028, citing the landing
  commits.
- Document the new work as a hand-written `specs/002-*` mini-spec following
  `.specify/templates/spec-template.md`, spec-tree-first per the constitution, tests before
  implementation.

## Capabilities

### New Capabilities

- `cli/marketplace-emission`: what the Patterson CLI emits when it scaffolds a marketplace or a
  skill -- dual-vendor manifests, provenance files -- and the checks that keep generated output
  from drifting.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify. The CLI's own
`specs/001-patterson-cli-v1/` tree remains the authority for its existing behaviour.

## Non-goals

- **No new dependencies.** If that ever changes, the Socket supply-chain gate applies first.
- **Managed-settings keys are not added to the settings whitelist.** That is Constitution-V-gated on
  a vendored schema spike; it is recorded as a proposed spike, not done here.
- **The real Claude Code plugin generator (drift D2) is a stretch item.** If time-boxed out, it is
  recorded rather than half-built.
- **No history rewriting and no force operations** in `cli/`; commits land on the existing history.
- **No pushing.** Commitlint via lefthook still applies to every local commit.
- **HANDOFF.md's zero-dependency, no-`package.json` rules do not apply here.** `cli/` is a Bun
  workspaces monorepo and follows its own constitution.

## Impact

- `packages/generators/src/generators.ts`, `packages/cli/src/commands/plugins.ts`, the check
  registry, and the `specs/` tree.
- New `specs/002-*` mini-spec and updated `specs/001-patterson-cli-v1/tasks.md`.
- Scaffolded repositories gain a second manifest and provenance files by default, closing D5 and
  aligning generated output with the corp convention.
- Roughly three to five commits, each gated on `bun run gate`.
