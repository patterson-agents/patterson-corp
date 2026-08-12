## Context

HANDOFF.md 1H specifies the `claude_design` MCP at `https://api.anthropic.com/v1/design/mcp` with
`/design-login`. In practice the session's `DesignSync` tool already reaches both projects through
Daniel's claude.ai login, both with `canEdit: true`, so the documented auth flow is unnecessary --
a deviation to record rather than a problem to solve. The tool's `get_file` has a 256 KiB per-file
cap, which is the one hard limit on what can be imported.

The extraction target already exists and works:
`patterson-corp/plugins/patterson-brand/skills/design-tokens/` carries a `DESIGN.md`, a `theme.css`,
a `tokens.json`, a byte-identical `build-theme.ts`, and a `verify-theme.sh`. Reusing that shape is
what makes these imports gate-checkable on day one.

Two unresolved facts shape placement. Daniel noted the existing design system and these projects are
out of date relative to each other, and HANDOFF.md 1H requires establishing which supersedes which
before publishing. Open question #5 already has two conflicting Patterson palettes in flight.

## Goals / Non-Goals

**Goals:**

- Turn two unversioned design projects into artifacts CI can check.
- Keep the Brand Guide authoritative while preserving the imports' new information.
- Make every gap -- unfetchable file, absent brand ruling -- visible instead of smoothed over.

**Non-Goals:**

- Ruling on which design system wins.
- Publishing into `patterson-corp`.
- Importing binaries of any kind.

## Decisions

- **`DesignSync` instead of the documented MCP endpoint.** It works, it is already authenticated,
  and it avoids an interactive login the run cannot perform. Recorded as a deviation from HANDOFF.md 1H.
- **Reuse the design-tokens pattern verbatim.** Same five-section `DESIGN.md`, same generator
  invariant. A second pattern would double the surface the gate battery has to know about.
- **The generator is the contract.** A `theme.css` without a byte-identical generator is a snapshot
  that will silently drift. The round-trip is what makes drift a CI failure instead of a discovery.
- **BG25 wins, conflicts recorded.** The imports are design projects, not brand authority. Recording
  both values with sources follows the `#00A8E1` / `#269BCB` precedent and keeps the brand team's
  eventual ruling cheap to apply.
- **Labs, not corp.** Publishing to the canonical marketplace would implicitly answer the
  supersession question. Incubation answers nothing and is reversible.
- **Unfetchable means unfetchable.** A guessed token value that looks plausible is worse than a
  recorded gap, because it will be trusted.

## Risks / Trade-offs

- Two design systems incubating alongside a live one increases confusion until the supersession
  ruling lands. Mitigated by the incubation placement and an explicit note in each extraction.
- Reconciling against BG25 by hand risks missing a conflict. Mitigated by extracting every colour
  with its functional role, which forces a per-value comparison rather than a palette-level glance.
- If a large source file is unfetchable, an extraction may be materially incomplete and still look
  finished. Mitigated by recording unfetchable paths inside the extraction notes, not only in the
  report, so the gap travels with the artifact.
