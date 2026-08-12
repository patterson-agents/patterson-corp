## 1. Orient inside cli's own rules

- [ ] 1.1 Read `cli/AGENTS.md`, `.specify/memory/constitution.md`, and the `specs/001-patterson-cli-v1/` tree
- [ ] 1.2 Run `bun install` so the workspace `@patterson/*` links resolve
- [ ] 1.3 Run `bun run gate` and record the clean baseline before making any change
- [ ] 1.4 Confirm `bunx lefthook install` has been run so commitlint applies

## 2. Org-rename edits

- [ ] 2.1 Review all 19 pending edits file by file; do not blind-stage
- [ ] 2.2 Align every `package.json` repository URL to `patterson-agents/cli`, not `patterson-cli`
- [ ] 2.3 Run `bun run gate` and commit with a conventional subject

## 3. Mini-spec first

- [ ] 3.1 Write the hand-written `specs/002-*` mini-spec following `.specify/templates/spec-template.md`
- [ ] 3.2 Cover dual-manifest emission, the divergence check, and skill provenance emission
- [ ] 3.3 Record the managed-settings whitelist work as a proposed Constitution-V-gated spike, not as in-scope work

## 4. Dual manifest emission, tests first

- [ ] 4.1 Write the failing test asserting `marketplaceGenerator` emits both manifest paths byte-identically
- [ ] 4.2 Write the failing test asserting generated plugin `source` values begin with `./`
- [ ] 4.3 Extend `marketplaceGenerator` at `packages/generators/src/generators.ts:387`
- [ ] 4.4 Run `bun run gate` and commit

## 5. Divergence check

- [ ] 5.1 Write the failing tests for the `CheckDef`: matching manifests, diverged manifests, missing projection
- [ ] 5.2 Implement the `CheckDef` and register it so it surfaces through `doctor` and `check`
- [ ] 5.3 Confirm a failing check exits non-zero
- [ ] 5.4 Run `bun run gate` and commit

## 6. Skill provenance emission

- [ ] 6.1 Write the failing test asserting `skillGenerator` emits `_SOURCES.md` and `REFERENCES.md`
- [ ] 6.2 Write the failing test for the `CheckDef` asserting both files are present
- [ ] 6.3 Add the templates, including the `[TBD: not specified in <source>]` form for unknowns
- [ ] 6.4 Run `bun run gate` and commit

## 7. Documentation truth-up

- [ ] 7.1 Fix the false comment at `packages/cli/src/commands/plugins.ts:8` about the marketplaces IR
- [ ] 7.2 Check the landed T001-T028 boxes in `specs/001-patterson-cli-v1/tasks.md`, citing the landing commit for each
- [ ] 7.3 Run `bun run gate` and commit

## 8. Integration proof and stretch

- [ ] 8.1 If time permits, run the enhanced `patterson new marketplace` into the session scratchpad and diff against a hand-built sibling manifest
- [ ] 8.2 Stretch: the real Claude Code plugin generator closing drift D2; if time-boxed out, record it rather than half-building it
- [ ] 8.3 Confirm no new third-party dependency was introduced
- [ ] 8.4 Confirm nothing was pushed and no history was rewritten
