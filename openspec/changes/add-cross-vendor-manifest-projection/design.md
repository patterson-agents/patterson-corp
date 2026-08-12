## Context

`patterson-corp` has no build step and no dependencies: scripts are POSIX `sh` or zero-dependency
TypeScript run as `node script.ts`. The vendored `githubnext/ado-aw` repo at
`patterson-agents.archive/vendored/github.com/githubnext/ado-aw/` carries both manifest locations at
599 bytes each; `cmp` confirms they are identical. That single fact removes the need for any
schema-mapping layer.

## Goals / Non-Goals

**Goals:**

- One canonical manifest, one mechanical projection, one CI check that catches drift.
- Keep the projection readable by a human reviewing a diff -- a copy, not generated output.
- Keep the divergence check isolated so `add-repo-furniture`'s `ci.yml` and this change never
  collide during the sequential merge.

**Non-Goals:**

- Transforming manifest shape per vendor.
- Generating per-plugin `plugin.json` files.
- Any remote operation. The workflow is committed but never pushed.

## Decisions

- **Copy, not transform.** Verified with `cmp` against the vendored ado-aw manifests before writing
  the script. If a future vendor requires a different shape, that is a new change, not a widening
  of this one.
- **POSIX `sh`, not TypeScript.** The operation is `mkdir -p` plus `cp`. A shell script keeps the
  zero-dependency rule and stays reviewable; the TypeScript convention exists for validators that
  must emit `LEVEL|file|line|rule|message`, which this does not.
- **Separate workflow file.** `manifest-sync.yml` rather than a job appended to `ci.yml`, so the
  two workstreams touch disjoint files.
- **Assert `./` at test time, not repair it.** Silently rewriting a `source` value would hide an
  authoring mistake; failing the suite surfaces it.

## Risks / Trade-offs

- A copied file can be edited in place, defeating the projection. Mitigated by the CI divergence
  check, which is the reason the check exists rather than trusting the script alone.
- The `./` rule is asserted only in the repo's own test suite; a consumer repo that copies the
  script does not inherit the assertion. Recorded in the ADR rather than solved here.
- The projection assumes both vendors keep accepting the same schema. `[TBD: not specified in
  HANDOFF.md 1D]` whether Copilot's manifest schema will diverge; the ADR records the assumption
  so a future divergence is traceable.
