# 0001 — OpenSpec as the spec-driven framework for patterson-agents

**Status:** Accepted
**Date:** 2026-08-12
**Decider:** Daniel Bodnar
**Scope:** program-level planning across the `patterson-agents` org

> [!IMPORTANT]
> **Neither OpenSpec nor spec-kit is on Patterson's Approved Software list.** `HANDOFF.md` §1E
> flags this and it is unresolved; it belongs alongside the open questions in that document but
> is not yet listed there. This decision is **provisional on that approval** and is addressed to
> whoever owns the Approved Software list. Both tools are
> MIT-licensed, run locally, require no API key, and write only plain Markdown into the repo —
> but that is a mitigation argument, not an approval.

## Context

The `patterson-agents` program spans several independent repos and is executed largely by
delegating workstreams to subagents. It needed one place where a unit of work is written down
before it is built, and one format that a subagent can be pointed at.

Three inputs bore on the choice:

1. **`HANDOFF.md` §1E** prescribed building the scoping *completely in both* spec-kit and
   OpenSpec under `specs/spec-kit/` and `specs/openspec/`, reviewing, then deleting the loser.
   Its stated preference was already **vendor-agnostic, TypeScript over Python**.
2. **Prior research** — `downloads/patterson/sdd-landscape.html`, a survey of the
   spec-driven-development landscape — profiles both tools on identical axes. It describes
   spec-kit (github/spec-kit, MIT, v0.15.x) as constitution-driven and phase-gated, Python 3.11+
   via `uv`, roughly eight files per spec, weak on small iterative changes. It describes OpenSpec
   (Fission-AI/OpenSpec, MIT) as change-driven and brownfield-first, Node/TypeScript, roughly four
   files per change, with an explicit ADDED/MODIFIED/REMOVED delta format and native `SKILL.md`
   binding. Its recommendation for brownfield change work and for the shortest path to a working
   loop is OpenSpec.
3. **An existing spec-kit investment** in `cli/` — a live feature tree at
   `cli/specs/001-patterson-cli-v1/` plus a ratified constitution at
   `cli/.specify/memory/constitution.md` (v1.0.0, seven binding principles). This was the
   strongest argument on the spec-kit side and is recorded here as such.

> [!NOTE]
> **The prescribed bake-off never ran.** When the executing agent asked which route to take,
> Daniel decided directly, on 2026-08-12, during planning. The `specs/spec-kit/` parallel
> directory was never created and no side-by-side implementation was compared. This ADR records
> a direct decision that **superseded** `HANDOFF.md` §1E — not the outcome of an evaluation.

## Decision

**OpenSpec v1.8.0 (`@fission-ai/openspec`) is the spec-driven framework for the
`patterson-agents` program.** `patterson-corp` is the program's OpenSpec planning root.

Rationale, in the order it carried weight:

- **Vendor-agnostic.** Plain Markdown in `openspec/`; the CLI is a scaffolder, not a runtime
  dependency. Nothing is locked to one agent vendor.
- **TypeScript/Node-native.** spec-kit is Python and `uv`. Python is forbidden outright by this
  machine's global rules and by the `HANDOFF.md` ground rules (Phase 0 asserts zero `.py` files);
  adopting spec-kit at program level would require breaking a standing constraint.
- **Fits delegate-to-subagents.** Each workstream is its own directory under `openspec/changes/`
  with a small, fixed artifact set, so a subagent can be handed exactly one change via
  `openspec show <change>` rather than a whole-repo spec tree.
- **It initialized cleanly.** `openspec/config.yaml` carries the Patterson context and proposal
  rules, and ten workstreams already exist as change directories — `add-repo-furniture`,
  `add-github-security-scanning`, `reconcile-plugin-name-collisions` and seven others. (The
  eleventh entry, `changes/archive/`, is OpenSpec's standard container for completed changes,
  currently empty — not a workstream.)

**`cli/` is explicitly out of scope.** Its spec-kit tree and constitution remain as-is.

## Consequences

### Positive

- One planning root for the program, in a format every supported agent can read without a plugin.
- The delta model suits the actual work, which is overwhelmingly modification of things that
  already exist (marketplaces, plugins, settings) rather than greenfield services.
- No Python toolchain enters the program, so the Phase 0 "zero `.py` files" check stays green.
- Per-change directories give subagent delegation a natural unit of work and a natural boundary.

### Negative

- **Version drift in the evidence base.** The research describes **OpenSpec v1.4.x**; the
  installed CLI is **v1.8.0**. Every v1.4-era claim below is therefore **unverified against
  1.8.0** and must be re-checked before it is relied on:
  - *Telemetry.* The research states anonymous telemetry is **on by default**, opting out with
    `OPENSPEC_TELEMETRY=0` or `DO_NOT_TRACK=1`. Treat this as live until re-verified — set one of
    those variables in the program's environment, and confirm the current default on 1.8.0 before
    any Approved Software submission, since telemetry posture is exactly what that review asks about.
  - *No constitution equivalent.* Cross-cutting architectural governance is thinner than
    spec-kit's; the program carries its conventions in `openspec/config.yaml` context instead.
  - *Support is Discord-centric* rather than documented issue threads.
  - *Weaker for true greenfield*, since there is nothing to delta against yet.
- **A spec-kit island remains.** `cli/` keeps `.specify/memory/constitution.md` and
  `specs/001-patterson-cli-v1/`. Two spec formats now coexist in the org, and anyone moving
  between repos has to know which one they are in.
- No comparative evidence was produced. If the choice is ever challenged, there is no bake-off to
  point at — only this record and the prior research.

### Neutral

- `openspec/specs/` is currently empty. That is expected: under the change-driven model, specs
  accumulate only as changes are archived.
- New `cli/` work documents itself in that repo's established spec-tree style — a `specs/002-…`
  mini-spec — while program-level planning uses OpenSpec here. No migration of `cli/` is planned.
- `HANDOFF.md` §1E remains accurate as a record of the original directive; this ADR is the record
  of its supersession.

## Alternatives considered

### spec-kit (github/spec-kit)

**The case for it was real.** `cli/` already runs it: a ratified seven-principle constitution and
a full feature tree that `cli/AGENTS.md` names as the source of truth, winning on any drift. That
is a working, non-trivial investment, and the constitution mechanism — binding principles every
feature inherits — has no OpenSpec equivalent.

**Why it lost:**

- **Python runtime.** `uv tool install specify-cli`, Python 3.11+. Python is forbidden by this
  machine's global rules and by the `HANDOFF.md` ground rules. This alone was disqualifying at
  program level.
- **Weight.** Per the research, roughly eight files per spec and a phase-gated pipeline, weak on
  small iterative changes — a poor fit for a program made of many small, parallel workstreams.
- **The bake-off that would have tested these claims was superseded** by a direct decision before
  it ran. spec-kit was not evaluated head-to-head here.

The `cli/` investment argument is answered by scope rather than by rebuttal: `cli/` keeps
spec-kit, and nothing in it is migrated.

### Neither / no framework

Rejected. Delegating workstreams to subagents without a written, addressable unit of work was the
failure mode this program was already hitting.

## References

- `HANDOFF.md` §1E "spec-kit AND OpenSpec, then an ADR" —
  `/workspaces/code/github.com/patterson-agents/HANDOFF.md`
- SDD landscape research (describes OpenSpec v1.4.x) —
  `/workspaces/code/github.com/patterson-agents/downloads/patterson/sdd-landscape.html`
- Existing spec-kit constitution, `cli/` —
  `/workspaces/code/github.com/patterson-agents/cli/.specify/memory/constitution.md`
- OpenSpec — https://github.com/Fission-AI/OpenSpec
- spec-kit — https://github.com/github/spec-kit
- Program OpenSpec root — `openspec/config.yaml`, `openspec/changes/`
