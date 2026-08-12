## 1. Verify the copy-not-transform evidence

- [ ] 1.1 Locate the vendored manifests under `patterson-agents.archive/vendored/github.com/githubnext/ado-aw/`
- [ ] 1.2 Run `cmp` on `.claude-plugin/marketplace.json` against `.github/plugin/marketplace.json` and record the byte size
- [ ] 1.3 Record the result as the evidence line for ADR 0002; if `cmp` reports a difference, stop and escalate rather than proceeding

## 2. Tests first

- [ ] 2.1 Add fixtures: a manifest with a valid `./`-prefixed source, one with a bare `plugins/foo` source, and a repo tree missing `.github/plugin/`
- [ ] 2.2 Write the failing test asserting `.github/plugin/marketplace.json` is byte-identical to the canonical manifest
- [ ] 2.3 Write the failing test asserting every plugin `source` begins with `./`
- [ ] 2.4 Write the failing test asserting a missing source manifest exits non-zero and creates nothing

## 3. Projection script

- [ ] 3.1 Write `scripts/sync-manifests.sh` in POSIX sh: guard on the source manifest, create `.github/plugin/`, copy
- [ ] 3.2 Make the script executable and confirm the suite from group 2 passes
- [ ] 3.3 Run the script and commit the generated `.github/plugin/marketplace.json`

## 4. CI divergence check

- [ ] 4.1 Add `.github/workflows/manifest-sync.yml` running the `cmp` comparison on push and pull_request
- [ ] 4.2 Pin the workflow runtime to `node:24`-family images where a container is used; never `node:20`
- [ ] 4.3 Confirm the workflow file does not modify or duplicate `.github/workflows/ci.yml`

## 5. Decision record

- [ ] 5.1 Write `docs/decisions/0002-cross-vendor-manifest-projection.md` with the copy-not-transform decision, the `cmp` evidence, and the root-token table
- [ ] 5.2 Note the `./` source-prefix gotcha and the awesome-copilot contrast
- [ ] 5.3 Record `[TBD: not specified in HANDOFF.md 1D]` for any Copilot schema-stability question the source does not answer

## 6. Verification

- [ ] 6.1 Run the full repo test battery and `claude plugin validate .`
- [ ] 6.2 Confirm `git status` is clean of scratch files and nothing was pushed
