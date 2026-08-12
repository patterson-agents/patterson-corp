## Context

HANDOFF.md 1G asserts a marketplace-level name collision. Correction C1 checked the manifests and
found four distinct marketplace names, so the stated hazard is not real -- but two plugin-level
collisions are, and one of them (`patterson-brand`, between `patterson-corp` and
`patterson-design-plugins`) was never reported. Plugin resolution is first-found-wins, which means
the losing publisher gets no error, no warning, and no way to tell from the outside.

Correction C2 adds a second constraint on this workstream: `patterson-marketplace` has 55
uncommitted changes from a prior session of this agent, converting 21 vendored skill scripts from
Python to TypeScript, with semantics verified per `.remember/now.md`. Committing that blind would
launder unreviewed work into history; discarding it would throw away verified work.

## Goals / Non-Goals

**Goals:**

- Record what is actually true, including that the handoff's premise was wrong.
- Resolve what can be resolved without breaking a consumer.
- Get the verified conversion into history with its provenance attached, or not at all.

**Non-Goals:**

- Renaming any published plugin.
- Any remote operation, including archiving `patterson-skills`.
- Redoing or extending the Python-to-TypeScript conversion.

## Decisions

- **Correct the handoff in the ADR rather than around it.** The decision record states that the
  marketplace collision does not exist. A future reader who finds HANDOFF.md 1G first needs the
  correction to be findable, not implied.
- **`patterson-design` resolves by retirement, not by rename.** `patterson-skills` is being retired
  anyway, so withdrawing its copy costs nothing and needs no consumer action.
- **`patterson-brand` stays as-is, deliberately.** Both publishers are live. A rename breaks
  existing installs on whichever side is renamed, and there is no way to tell from here which side
  has more consumers. Options plus a recommendation, decision deferred, escalated in the report.
- **Deprecation is metadata plus a banner.** `deprecated: true` and a description prefix are
  machine-readable and human-readable respectively, and neither requires a remote call.
- **Harvest before deprecating.** Ordering matters only for narrative coherence, but a deprecation
  commit that precedes the harvest would read as abandoning content that was still needed.
- **Review the 55 changes file by file, with a stop condition.** Erasable syntax, `node:` builtins
  only, behavioural parity. Any failure means zero commits in that repository and an escalation --
  a partial commit would be the worst outcome.

## Risks / Trade-offs

- Leaving `patterson-brand` unresolved means the collision persists into publication if Daniel does
  not act on the report. Accepted: a silent first-found-wins collision is bad, but a rename that
  breaks installs without approval is worse and is not reversible from the consumer side.
- Reviewing 55 changes by hand is slow and error-prone. Mitigated by narrow, checkable criteria and
  by the all-or-nothing commit rule.
- Local-only deprecation is invisible to anyone browsing GitHub until Daniel pushes. Accepted; the
  no-push constraint is absolute for this run.
