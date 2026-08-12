## 1. Gather and verify the sources

- [ ] 1.1 Read `.tmp/staging/docs/claude-code/`, `.tmp/staging/docs/copilot/`, and `.tmp/staging/docs/vscode/`
- [ ] 1.2 Read `patterson-platform-docs/references/platforms/_NORMATIVE-*.md`
- [ ] 1.3 Record, with source path and quotation, each of the four constraints: managed tier winner-take-all and alphabetical `managed-settings.d/` merge; flat marketplace name namespace; inverted Copilot precedence with no enterprise tier; VS Code reading `.claude/settings.json` with the same keys
- [ ] 1.4 List every settings question the sources do not answer, for `[TBD: not specified in <source>]` markers

## 2. Layer files

- [ ] 2.1 Write `managed-settings.d/10-enterprise.json` with `extraKnownMarketplaces` referencing `patterson-corp`
- [ ] 2.2 Write `managed-settings.d/20-suborg.json` adding `patterson-dental` and `patterson-vet`
- [ ] 2.3 Write `managed-settings.d/30-department.json` with `enabledPlugins` for the engineering and brand plugins
- [ ] 2.4 Write `managed-settings.d/40-team.json` demonstrating both extending an inherited value and overriding one
- [ ] 2.5 Confirm each file parses as JSON and contains no comment syntax

## 3. Advisory-posture check

- [ ] 3.1 Grep the four layers for `strictKnownMarketplaces` and confirm zero hits
- [ ] 3.2 Grep the four layers for `permissions.deny` and confirm zero hits
- [ ] 3.3 Confirm the numeric prefixes sort alphabetically into the intended precedence order

## 4. Architecture document

- [ ] 4.1 Write `docs/architecture/layered-settings.md` describing all six settings layers
- [ ] 4.2 Explain winner-take-all managed settings and the alphabetical `managed-settings.d/` merge, with citations
- [ ] 4.3 Document the flat marketplace name namespace and same-name replacement, with citations
- [ ] 4.4 Document the inverted Copilot precedence and the absent enterprise tier, with citations
- [ ] 4.5 Document that VS Code reads `.claude/settings.json` with the same keys, with citations
- [ ] 4.6 Show the enforcement switches as commented-out markdown examples and state that going live is one line per layer
- [ ] 4.7 Insert `[TBD: not specified in <source>]` for every question identified in task 1.4
- [ ] 4.8 State the gap-allocation convention for the numeric prefixes

## 5. Verification

- [ ] 5.1 Confirm no emoji, no binaries, and no `node:20` in any new file
- [ ] 5.2 Confirm nothing was installed into a real managed-settings path on the machine
- [ ] 5.3 Confirm no claim in the document lacks either a citation or a `[TBD]` marker
- [ ] 5.4 Confirm no remote operation was performed
