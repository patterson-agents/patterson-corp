## 1. Confirm the starting state

- [ ] 1.1 Verify correction C5: `patterson-labs`, `patterson-dental`, and `patterson-vet` contain zero files
- [ ] 1.2 Collect the existing marketplace `name` values across `patterson-corp`, `patterson-marketplace`, and `patterson-skills` to choose distinct names
- [ ] 1.3 Read `.tmp/staging/reuse/agentics-and-gh-aw.md` and note the three design-plugins workflows and their gh-aw version

## 2. Tests first, per repository

- [ ] 2.1 Write the failing manifest-validation test for each sibling
- [ ] 2.2 Write the failing skill name-equals-directory test for each sibling
- [ ] 2.3 Write the failing forbidden-content test (Figtree, d98a00, c0392b, rul6mjk, `node:20`, `.py`, binaries, emoji) for each sibling
- [ ] 2.4 Wire each as a zero-dependency `run-tests.sh`

## 3. patterson-dental and patterson-vet baseline

- [ ] 3.1 Write `.gitignore` in each
- [ ] 3.2 Write `.claude-plugin/marketplace.json` in each with a distinct name and `./`-prefixed sources
- [ ] 3.3 Write a house-style `README.md` in each: badges, GFM alerts, tables, SVG or mermaid diagram, no raster assets
- [ ] 3.4 Write `.devcontainer/devcontainer.json` in each on a pinned `node:24`-family image
- [ ] 3.5 Write `.github/workflows/ci.yml` in each running the suite
- [ ] 3.6 Write the `managed-settings.d/` placeholder in each
- [ ] 3.7 Run both suites and confirm they pass

## 4. patterson-labs baseline

- [ ] 4.1 Apply every step from group 3 to `patterson-labs`
- [ ] 4.2 Confirm the labs marketplace name is distinct from all five other Patterson marketplaces

## 5. patterson-labs incubation documents

- [ ] 5.1 Write `docs/promotion-path.md` covering incubation to `patterson-corp` graduation
- [ ] 5.2 Record `[TBD: not specified in HANDOFF.md 1F]` for each graduation criterion the source does not define
- [ ] 5.3 Write `docs/gh-aw-adoption.md` citing `.tmp/staging/reuse/agentics-and-gh-aw.md` and naming ci-doctor, repo-ask, and repo-chronicle with their gh-aw version
- [ ] 5.4 Record in `docs/gh-aw-adoption.md` that the agentics GitHub-template adoption needs a remote operation and is documented rather than executed
- [ ] 5.5 Create the harvest destination directory for `agentic-workflow-designer`

## 6. Verification

- [ ] 6.1 Run all three suites and confirm clean passes
- [ ] 6.2 Run `claude plugin validate .` in each sibling repository
- [ ] 6.3 Confirm no `LICENSE` file was added in any sibling
- [ ] 6.4 Confirm no repository was created remotely, nothing was pushed, and no GitHub template flag was set
