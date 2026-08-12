## 1. Study the sibling skill

- [ ] 1.1 Read `plugins/patterson-engineering/skills/cicd-pipeline-standards/` end to end, including its `SKILL.md`, `references/`, `scripts/`, `_SOURCES.md`, and `REFERENCES.md`
- [ ] 1.2 Record the structural conventions to mirror: frontmatter shape, reference file naming, script exit codes, test layout
- [ ] 1.3 Confirm the GHAS active-committers export in `downloads/` as the licensing evidence cited in the skill

## 2. Tests first

- [ ] 2.1 Create `tests/fixtures/` with a fully-configured repo tree, a tree missing CodeQL, and a nonexistent path case
- [ ] 2.2 Write the failing test asserting exit `0` and no `ERROR` lines on the complete fixture
- [ ] 2.3 Write the failing test asserting exit `1` and a `LEVEL|file|line|rule|message` line on the incomplete fixture
- [ ] 2.4 Write the failing test asserting exit `2` on an invalid invocation
- [ ] 2.5 Write the failing test asserting every `assets/` template exists and contains no `node:20`
- [ ] 2.6 Wire the suite as `tests/run-tests.sh`, the repository's sixth suite

## 3. Control templates

- [ ] 3.1 Author `assets/codeql.yml` pinned to `node:24`-family runtimes
- [ ] 3.2 Author `assets/dependabot.yml` with the `github-actions` ecosystem only
- [ ] 3.3 Author `assets/security.yml`
- [ ] 3.4 Author `assets/secret_scanning.yml` excluding `plugins/patterson-engineering/hooks/tests/`
- [ ] 3.5 Verify no template contains emoji, binaries, or an expanded `${CLAUDE_PLUGIN_ROOT}`

## 4. Auditor script

- [ ] 4.1 Write `scripts/check-security-config.ts` in erasable TypeScript using `node:` builtins only
- [ ] 4.2 Implement the `0`/`1`/`2` exit contract and the `LEVEL|file|line|rule|message` output format
- [ ] 4.3 Document in the script header that it inspects repository files only and cannot verify server-side settings
- [ ] 4.4 Run the group 2 suite until it passes

## 5. Skill body and references

- [ ] 5.1 Write `SKILL.md` with kebab-case `name` equal to the directory name and the four declared triggers
- [ ] 5.2 Write the control-coverage table with SAST, SCA, secret scanning, and container/IaC covered, and the DAST row open and addressed to AppSec
- [ ] 5.3 Document the secret-scanning ordering warning: exclusion file before push protection
- [ ] 5.4 Document the CodeQL extractor caveat: confirm the "files analysed" count, do not trust a green check
- [ ] 5.5 Present the `gh api -X PATCH` enablement command as documentation only, with an explicit note that nothing in this change executes it
- [ ] 5.6 Author `references/` covering CodeQL, Dependabot, secret scanning, and the coverage rationale

## 6. Provenance

- [ ] 6.1 Write `_SOURCES.md`, recording `[TBD: not specified in the six ServiceNow KB sources]` for the absent GitHub-security article
- [ ] 6.2 Write `REFERENCES.md` following the sibling skills' format
- [ ] 6.3 Confirm no `sys_kb_id` was invented

## 7. Verification and scope discipline

- [ ] 7.1 Run all six suites and confirm they pass
- [ ] 7.2 Confirm the diff touches no README, no badge, no sibling `REFERENCES.md`, and no `plugin.json` version
- [ ] 7.3 Run the forbidden-content greps (Figtree, d98a00, c0392b, rul6mjk, `node:20`, `.py`, emoji) over the new directory
- [ ] 7.4 Confirm no remote operation was performed
