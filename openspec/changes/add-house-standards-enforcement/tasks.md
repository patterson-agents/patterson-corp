## Tasks

- [x] 1. Test fixtures and assertions for the new guard added to
  `plugins/patterson-engineering/hooks/tests/run-tests.sh` (written first; confirmed failing
  for the right reason before implementation).
- [x] 2. `plugins/patterson-engineering/hooks/scripts/house-standards-guard.ts` implemented:
  Bash python/package-manager/denylist blocks, Write/Edit `.py`/lockfile/denylist blocks,
  `PATTERSON_ENGINEERING_HOOKS=off` switch, fail-open.
- [x] 3. `plugins/patterson-engineering/hooks/hooks.json` registers the new script for `Bash`
  and `Write|Edit`.
- [x] 4. `managed-settings.d/10-enterprise.json` gains `permissions.deny` mirroring the Bash
  and lockfile blocks.
- [x] 5. `docs/architecture/layered-settings.md` banner updated; `AGENTS.md` managed-settings
  line corrected.
- [x] 6. `docs/architecture/org-enforcement.md` written: three-tier model plus activation
  runbook (managed-settings deployment, org ruleset, Copilot org instructions).
- [x] 7. `patterson-engineering` bumped to `0.3.0` in `plugin.json` and `marketplace.json`;
  `sh scripts/sync-manifests.sh` run.
- [x] 8. `sh scripts/verify-all.sh` green.
- [x] 9. Sibling surfaces (outside this repo, same workstream): workspace `.claude/` hook
  wiring and permission denies, org `.github` reusable `standards-gate.yml` plus org
  instruction files, `.vscode` Copilot instruction wiring and terminal auto-approve denies.
- [ ] 10. `openspec validate --strict` — the `openspec` CLI is not installed in this
  devcontainer; validation deferred to an environment that has it.
