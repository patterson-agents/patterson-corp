## Context

`cli/` is the one repository in the program that does not follow HANDOFF.md's ground rules. It is a
Bun workspaces monorepo (`packages/core` plus emitters, with `cli` and `mcp` as thin frontends), it
has dependencies, it has a build and a test suite, and its `AGENTS.md`, `.specify/memory/constitution.md`,
and `specs/001-patterson-cli-v1/` tree win on any drift. `bun install` is required first: the
checkout ships no `node_modules`, so the workspace `@patterson/*` links do not resolve until it runs.

The enhancements mirror decisions made elsewhere in this program. The dual-manifest emission is the
tool-side implementation of what `add-cross-vendor-manifest-projection` does by hand; the skill
provenance templates are the tool-side implementation of the corp convention that every skill ships
`_SOURCES.md` and `REFERENCES.md`.

## Goals / Non-Goals

**Goals:**

- Make the generator produce what the hand-built repositories contain, so the two do not diverge.
- Make drift detectable through the commands users already run (`doctor`, `check`).
- Leave the spec tree telling the truth about what shipped.

**Non-Goals:**

- Adding dependencies.
- Widening the settings whitelist.
- Rewriting history or pushing.

## Decisions

- **Follow cli's constitution, not HANDOFF.md.** Two rule sets in one program is a hazard, so the
  boundary is stated explicitly: inside `cli/`, its own documents govern.
- **Spec-tree-first.** The constitution requires new work to be specified before it is built, so a
  hand-written `specs/002-*` mini-spec precedes implementation, and tests precede code within it.
- **Emit both manifests rather than emitting one and projecting.** A scaffolder that leaves a
  post-generation step for the user reintroduces exactly the drift being fixed. The divergence
  `CheckDef` then covers the case where a user edits one afterwards.
- **Divergence as a `CheckDef`, not a bespoke command.** It surfaces through `doctor` and `check`
  where users already look, and it composes with the existing check registry.
- **Truth up `tasks.md` with commit citations.** An unchecked box on landed work is a claim that the
  work is missing; correcting it without citing the landing commit just replaces one unverifiable
  claim with another.
- **The plugin generator (D2) is explicitly a stretch item.** Half-implementing a plugin generator
  would be worse than not starting it, so the time-box outcome is recorded rather than absorbed.

## Risks / Trade-offs

- The 19 pending org-rename edits are prior uncommitted work whose provenance must be checked before
  committing, the same caution correction C2 demands in `patterson-marketplace`. Reviewed, not
  blind-added.
- Changing generator output changes every future scaffold; a mistake propagates silently. Mitigated
  by the integration proof: scaffold into a scratch directory and diff against the hand-built
  sibling manifests.
- `bun run gate` before every commit slows the workstream. Accepted; it is the repository's own
  stated rule and the only thing keeping typecheck and lint honest.
- Adding provenance templates makes generated skills slightly heavier. Accepted: a skill without
  provenance is the thing the corp convention exists to prevent.
