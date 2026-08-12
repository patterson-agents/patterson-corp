# AGENTS.md

`patterson-corp` is a Claude Code / Copilot **plugin marketplace**, not an application. There
is no `package.json`, no `node_modules`, no build step. Everything shipped lives under
`plugins/`; everything else is governance, validators, or planning prose.

Read `CONTRIBUTING.md` for the full rules. This file records what an agent gets wrong without
help.

## Change workflow

Every substantive change goes through OpenSpec **before** code:
`openspec/changes/<change-id>/` with `proposal.md`, `tasks.md`, and for anything non-trivial
`design.md` plus a delta `specs/<capability-path>/spec.md`. Completed changes move to
`openspec/changes/archive/<YYYY-MM-DD>-<change-id>/` and fold into `openspec/specs/`.

- `openspec/config.yaml` carries the project context and per-artifact rules. Proposals must
  include a **Non-goals** section and cite Patterson sources.
- The `openspec` CLI is **not installed** in this devcontainer, and neither is `claude`.
  `CONTRIBUTING.md` asks for `openspec validate --strict`; if the binary is absent, say so
  rather than skipping the step silently. The `.claude/skills/openspec-*` skills document the
  artifact shapes.
- `openspec/` is also the planning root for sibling repos (`patterson-labs`,
  `patterson-dental`, `patterson-vet`, `design-plugins`, `cli`), so a change here may describe
  work that lands elsewhere.

## Commands

```bash
sh scripts/verify-all.sh                      # the whole gate; CI runs exactly this
sh plugins/<plugin>/skills/<skill>/tests/run-tests.sh   # one suite
node plugins/<plugin>/skills/<skill>/scripts/check-*.ts <path>   # one validator
sh scripts/sync-manifests.sh                  # re-project the Copilot manifest
sh scripts/sync-manifests.sh --check          # verify only
node plugins/patterson-brand/skills/design-tokens/scripts/build-theme.ts   # regenerate theme.css
```

`verify-all.sh` discovers suites by `find . -name run-tests.sh`, so a new suite is picked up
without editing it. Baseline is green — a failure you see is a failure you caused.

> `verify-all.sh` does **not** check manifest sync. After editing
> `.claude-plugin/marketplace.json`, run `sh scripts/sync-manifests.sh`; the projection to
> `.github/plugin/marketplace.json` is a byte-for-byte copy enforced by a separate workflow
> (`.github/workflows/manifest-sync.yml`). Never edit the `.github/plugin/` copy directly.

`.githooks/pre-commit` is opt-in (`git config core.hooksPath .githooks`) and deliberately
narrower than the gate: plugin suites plus the theme round-trip only, no size, binary, or
forbidden-string checks. Passing it does not mean CI will pass.

## Hard constraints the gate enforces

| Rule | Detail |
|---|---|
| Zero-dependency TypeScript | Scripts run as `node script.ts`. Import only `node:*` built-ins. |
| Erasable syntax only | No `enum`, `namespace`, parameter properties, or legacy decorators — Node's type stripper throws at runtime, not review time. |
| Node 24 | The gate greps the shipped surface for the superseded `node:`-20 image tag and fails on it — so do not write that literal in any tracked file outside `openspec/`, not even as documentation (this file included). The local container currently runs a newer Node than CI's pinned 24. |
| No `.py` files | Tracked Python fails the gate. |
| No binaries | No fonts, PDFs, Office docs, archives; no raster over 50 KiB. SVG is exempt at any size. |
| `${CLAUDE_PLUGIN_ROOT}` literal | The gate greps tracked files for `/home/...` or `/workspaces/...` followed by `/plugins`, `/skills`, or `/hooks`. Never paste a resolved path from this workspace into a tracked file. |
| Skill name == directory name | `SKILL.md` frontmatter `name:` must equal its directory. Checked under `plugins/*/skills/` only — `.claude/skills/` is OpenSpec tooling, not product skills, and is intentionally excluded. |
| No emoji | B2B healthcare brand. Use GFM alerts (`> [!NOTE]`) and tables. |
| Conventional commits | `<type>(<scope>): <summary>` — `feat`, `fix`, `docs`, `test`, `chore`, `refactor`. |

**Size budget: the docs are stale.** `scripts/check-size.ts` enforces **2 MiB** of tracked
bytes (raised in `c00b22f` when the OpenSpec root landed here). `CONTRIBUTING.md` and
`.github/copilot-instructions.md` still say 1 MiB. Trust the script. Current usage is roughly
1.16 MiB across ~265 files, measured by `git ls-files` sizes, never `du`.

**Forbidden-string check self-reference.** Step 4 of `verify-all.sh` scans every tracked
non-`.md` file, including itself. That is why its patterns are written with a bracket class
around the final character (`Figtre[e]`). Any pattern you add must use the same trick or the
gate flags its own source. `.md` files are allowlisted wholesale because prose legitimately
documents these strings as defects.

## Authoring a skill

A skill directory is `SKILL.md` (lean: triggers and decision rules only — it is loaded on every
invocation) plus on-demand `references/`, `scripts/`, `assets/`, and two mandatory provenance
files: `_SOURCES.md` (where the content came from, with a confidence note) and `REFERENCES.md`
(canonical locations). A skill missing either is incomplete.

When a Patterson source is silent on something, write `[TBD: what is missing]` rather than
inventing an answer. A `[TBD]` is a finding to escalate, not a defect to resolve. Surface all
of them with `grep -rn '\[TBD' plugins/`.

## Validators and tests

Validator contract: takes a path argument; exits `0` (pass), `1` (findings), `2` (could not
evaluate); emits one finding per line as `LEVEL|file|line|rule|message`. Copy the shape from
`plugins/patterson-engineering/skills/*/scripts/*.ts`.

Tests are POSIX `sh` harnesses at `tests/run-tests.sh` with `compliant/` and `violating/`
fixture directories, asserting both exit codes and specific rule IDs. Write them **first**, and
confirm they fail for the right reason. Fixtures needing an oversized file or a binary are
generated into a throwaway directory at run time — committing one would trip the very check it
proves.

Two skills have **no validator on purpose**: `azure-environment-standards` and
`monitoring-alerting-standards` regulate facts that do not appear in a repository. Their
`scripts/README.md` explains why. Do not "fix" this by adding a script that guesses.

## Other things that bite

- `plugins/patterson-brand/skills/design-tokens/assets/theme.css` is **generated** from
  `tokens.json` and byte-compared by `verify-theme.sh`. Edit `tokens.json` and regenerate;
  never hand-edit or reformat `theme.css`.
- Plugin and marketplace names share one flat global namespace across all Patterson catalogs —
  see `docs/decisions/0003-plugin-name-reconciliation.md` before renaming or adding a plugin.
- `plugins/patterson-engineering/hooks/` ships a `PreToolUse` guard whose blocking is disabled
  by `PATTERSON_ENGINEERING_HOOKS=off`; its test fixtures contain deliberately synthetic
  secrets, excluded via `.github/secret_scanning.yml`.
- `managed-settings.d/` demonstrates the layered enterprise → team model. Nothing there is
  enforced; the switches are intentionally off.
- **Do not add a `LICENSE` file** and do not change `"license": "UNLICENSED"` in any manifest.
  That is a pending Patterson legal decision, recorded in `CONTRIBUTING.md`.
