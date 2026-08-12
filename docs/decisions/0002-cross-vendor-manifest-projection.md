# 0002 — Cross-vendor manifest projection is a copy, not a transformation

**Status:** Accepted
**Date:** 2026-08-12
**Decider:** Daniel Bodnar
**Scope:** `patterson-corp` marketplace manifest publication

## Context

`patterson-corp` publishes its plugin catalog only as `.claude-plugin/marketplace.json`. GitHub
Copilot and VS Code consumers look for a manifest under `.github/plugin/`, so without a second
copy they cannot discover Patterson plugins at all.

`HANDOFF.md` §1D tabulates the three manifest formats in play across the org and the vendor-neutral
spec:

| Format | Manifest | Root token |
|---|---|---|
| Agent Plugins 1.0 | `plugin.json` + `$schema` | `${PLUGIN_ROOT}` |
| Copilot | `plugin.json` or `.github/plugin/plugin.json` | either token |
| Claude | `.claude-plugin/plugin.json` | `${CLAUDE_PLUGIN_ROOT}` |

That table describes the **per-plugin** `plugin.json` manifest. This change projects the
**marketplace-level** `marketplace.json` catalog instead — the file that lists which plugins exist,
not the per-plugin manifest each of them ships. The table is reproduced above verbatim because
HANDOFF.md 1D gives it as the root-token reference for the org, but it does not itself describe a
`marketplace.json` location per vendor; the marketplace-level Copilot location
(`.github/plugin/marketplace.json`) is established by the `ado-aw` evidence below, not by this
table. Per-plugin `plugin.json` projection is explicitly out of scope for this change (see
Non-goals in the proposal).

### The `ado-aw` evidence

`HANDOFF.md` §1D records the decisive finding: `githubnext/ado-aw` ships
`.claude-plugin/marketplace.json` and `.github/plugin/marketplace.json` byte-identical. That repo is
vendored locally at
`patterson-agents.archive/vendored/github.com/githubnext/ado-aw/`. Verified directly for this ADR:

```
$ ls -la patterson-agents.archive/vendored/github.com/githubnext/ado-aw/.claude-plugin/marketplace.json \
         patterson-agents.archive/vendored/github.com/githubnext/ado-aw/.github/plugin/marketplace.json
-rw-r--r-- 599 .../.claude-plugin/marketplace.json
-rw-r--r-- 599 .../.github/plugin/marketplace.json

$ cmp patterson-agents.archive/vendored/github.com/githubnext/ado-aw/.claude-plugin/marketplace.json \
      patterson-agents.archive/vendored/github.com/githubnext/ado-aw/.github/plugin/marketplace.json
$ echo $?
0
```

Both files are exactly 599 bytes and `cmp` reports no difference (empty output, exit `0`). This
matches the expectation stated in the workstream brief exactly. The `ado-aw` manifest's own
`plugins[].source` value is `./agency/plugins/ado-aw` — already `./`-prefixed, corroborating the
gotcha recorded below rather than contradicting it.

That single fact — two files, one canonical, kept identical in a real published repo — removes the
need for any schema-mapping layer. Cross-vendor support for the marketplace manifest is a *copy*.

## Decision

**The projection from `.claude-plugin/marketplace.json` to `.github/plugin/marketplace.json` is a
byte-for-byte copy, performed by `scripts/sync-manifests.sh` and verified in CI.**

- `.claude-plugin/marketplace.json` is the **authoritative** source. It is the only file a human
  or agent edits by hand.
- `scripts/sync-manifests.sh` (POSIX `sh`) copies it to `.github/plugin/marketplace.json`, creating
  the destination directory if absent, then re-verifies the copy with `cmp` before exiting `0`.
  Run with `--check`, it only verifies — exit `1` and a diff summary naming both paths on
  divergence, exit `2` if the source manifest is missing — and never writes.
- `.github/workflows/manifest-sync.yml` runs `sh scripts/sync-manifests.sh --check` on push and
  pull request whenever either manifest file changes, so drift between the two copies fails CI
  before it reaches a Copilot or VS Code consumer. It is a **separate** workflow file; it does not
  modify `.github/workflows/ci.yml`, which the `add-repo-furniture` workstream owns. The check needs
  no language runtime or container, so the `node:24` pin (never an older Node major) that applies
  elsewhere in this program does not apply to this workflow — it runs `sh` directly on the
  `ubuntu-latest` runner image.
- The generated `.github/plugin/marketplace.json` is committed alongside the script. It is
  generated output, but it is also the thing Copilot/VS Code actually read, so it has to exist in
  the repo, not just be reproducible from the script.

### The `./` source-prefix gotcha

Claude Code requires every plugin's `source` value to begin with `./` (e.g. `./plugins/foo`).
Tooling in the awesome-copilot ecosystem is known to write bare paths instead, such as
`plugins/foo` — valid for Copilot's own resolution but silently broken for Claude. Because the
projection is a copy, a bad `source` value in the canonical manifest propagates unchanged into the
Copilot copy; copying cannot fix or hide it.

This change does **not** rewrite `source` values to add the prefix. Silently repairing an authoring
mistake would hide it; the intent is for a violation to be caught and surfaced, not patched over
invisibly. At the time of writing, `patterson-corp`'s own `.claude-plugin/marketplace.json` has two
plugins, both already correctly prefixed:

```
"source": "./plugins/patterson-engineering"
"source": "./plugins/patterson-brand"
```

No violation exists today, so there is nothing to repair or escalate. The assertion is enforced by
this repo's own test suite (per the change's task list), not by `sync-manifests.sh` itself — a
consumer repo that copies the script without also copying the test suite does not inherit the
assertion. That gap is recorded here rather than solved by this change.

## Consequences

### Positive

- One canonical file, one mechanical projection, one CI check — no schema-mapping layer to build,
  test, or keep in sync with two vendors' evolving manifest shapes.
- The projected file is a plain copy, so a human reviewing a diff sees exactly the same content
  twice; nothing is generated in a way that obscures what changed.
- `add-repo-furniture`'s `ci.yml` and this change touch disjoint files, so the two workstreams can
  land in either order without conflict.

### Negative / risks

- A copied file can still be hand-edited after the fact, defeating the projection until the next
  CI run catches it. The divergence check is the safety net, not the script — it exists precisely
  because the script alone cannot prevent this.
- The `./`-prefix rule lives in this repo's test suite, not in `sync-manifests.sh`. Anyone who
  vendors the script into another repo without the tests gets the copy but not the guard.
- `[TBD: not specified in HANDOFF.md 1D]` — whether GitHub Copilot's `marketplace.json` schema will
  ever diverge from Claude's is not addressed by the source material. This decision assumes both
  vendors keep accepting the same shape; if that assumption breaks, the fix is a new, scoped change
  (a transform layer), not a silent widening of this one.

## Alternatives considered

### A transform layer (rejected)

Generating a differently-shaped Copilot manifest from the canonical one — e.g. stripping fields
Copilot doesn't recognize, or emitting Copilot's `plugin.json` form instead of `marketplace.json` —
was rejected. The `ado-aw` evidence shows no transformation is needed today, and building one
speculatively would add a schema-mapping surface with nothing to validate it against. If a future
vendor requires a genuinely different shape, that is new evidence and a new change, not a
retrofit of this one.

### Maintaining two manifests by hand (rejected)

Editing `.claude-plugin/marketplace.json` and `.github/plugin/marketplace.json` separately was
rejected outright. Two files that must stay byte-identical but are edited independently guarantee
silent drift — the exact failure mode this change exists to remove. There is no scenario in which
hand-maintenance is safer than a script plus a CI check.

## References

- `HANDOFF.md` §1D "Cross-vendor manifest projection" —
  `/workspaces/code/github.com/patterson-agents/HANDOFF.md`
- Vendored evidence —
  `patterson-agents.archive/vendored/github.com/githubnext/ado-aw/.claude-plugin/marketplace.json`
  and `.github/plugin/marketplace.json`
- `scripts/sync-manifests.sh`
- `.github/workflows/manifest-sync.yml`
- `openspec/changes/add-cross-vendor-manifest-projection/`
