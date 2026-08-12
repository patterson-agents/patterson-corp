## Why

Patterson needs a settings story that survives a real org chart -- enterprise, sub-org, department,
team -- but Claude Code's managed tier is **winner-take-all**: a single `managed-settings.json`
replaces rather than merges, so a department cannot add to what the enterprise set. HANDOFF.md 1C
("The layered `managed-settings.d/` demonstration") records that `managed-settings.d/` is the only
mechanism that merges, and that it merges **alphabetically**. Without a worked demonstration, the
first team to try layering will silently overwrite the enterprise layer.

The demonstration must also be safe to ship today. Nothing at Patterson is ready to be *enforced*:
public-repo approval is unresolved (open question #1) and the plugin catalog is still moving. So
every layer is advisory, and the enforcement switches are shown commented out in the prose, one
line per layer away from going live.

## What Changes

- Add `managed-settings.d/10-enterprise.json`, `20-suborg.json`, `30-department.json`, and
  `40-team.json`, demonstrating alphabetical merge across four organisational tiers:
  - `10-enterprise.json`: `extraKnownMarketplaces` pointing at `patterson-corp`
  - `20-suborg.json`: adds `patterson-dental` and `patterson-vet`
  - `30-department.json`: `enabledPlugins` for the engineering and brand plugins
  - `40-team.json`: a worked extend-versus-override example
- Add `docs/architecture/layered-settings.md` explaining the six layers, with the enforcement
  switches shown **commented out in the markdown** -- JSON carries no comments, so the JSON files
  themselves contain only advisory keys.
- Document the four verified platform constraints with citations:
  1. The managed tier is winner-take-all; only `managed-settings.d/` merges, and it merges alphabetically.
  2. Marketplace `name` is a flat global namespace -- the same name **replaces**.
  3. Copilot instruction precedence is **inverted**: personal > repo > org, with no enterprise tier.
  4. VS Code reads `.claude/settings.json` with the **same keys**, so one settings shape serves both.

Sources: `.tmp/staging/docs/{claude-code,copilot,vscode}/` and
`patterson-platform-docs/references/platforms/_NORMATIVE-*.md`. Cite; do not extrapolate.

## Capabilities

### New Capabilities

- `settings/managed-layering`: layered managed settings for Patterson's organisational tiers,
  including the merge semantics, the advisory-only posture, and the documented path to enforcement.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **No enforcement.** No layer sets `strictKnownMarketplaces` and no layer sets `permissions.deny`.
  Enforcement switches appear only as commented-out examples inside the markdown.
- **No deployment.** Nothing is installed into a real managed-settings path on any machine; the
  files are a committed demonstration.
- **No extrapolation beyond the sources.** Where `.tmp/staging/docs/` and the `_NORMATIVE-*.md`
  references are silent, the document records `[TBD: not specified in <source>]` rather than
  inferring behaviour.
- **No JSON comments.** JSON has no comment syntax; any attempt to annotate the JSON files inline is
  out of scope, and the annotation lives in the markdown instead.
- **No changes to the Patterson CLI's settings whitelist.** Adding managed-settings keys to the CLI
  is Constitution-V-gated on a vendored schema spike and is recorded as a proposed spike, not done here.
- **No remote operations.**

## Impact

- New: `managed-settings.d/` with four JSON layers and `docs/architecture/layered-settings.md`.
- Consumed by `populate-sibling-marketplaces`, which ships a `managed-settings.d/` placeholder in
  each sibling repo following this shape.
- No plugin, script, or workflow changes.
