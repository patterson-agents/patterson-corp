## Why

`patterson-corp` ships six `patterson-engineering` skills but none of them sets up security
scanning, even though Patterson already has GitHub Advanced Security licensed (a GHAS
active-committers export exists in `downloads/`). HANDOFF.md 1A ("`github-security-scanning` -- a
7th engineering skill") requires the gap be closed as a skill that *installs* scanning in any
Patterson repo, not a document that describes it: "Everything Patterson-specific is a skill. Do not
emit bare workflow files."

The same section records a second, sharper problem: the CI/CD standard lists DAST as a required PR
check, and Daniel's direction was "for DAST we use Trivy and GitLeaks." Those are not DAST. Marking
the row satisfied would create a documented-but-false control, so the skill must publish the real
coverage table with DAST open.

## What Changes

- Add a seventh engineering skill at
  `plugins/patterson-engineering/skills/github-security-scanning/`, shaped on its sibling
  `cicd-pipeline-standards` (read end-to-end before authoring).
- Ship installable templates in `assets/`: `codeql.yml`, `dependabot.yml`, `security.yml`,
  `secret_scanning.yml`. Dependabot covers the `github-actions` ecosystem only -- there is no npm
  ecosystem in this repo to read.
- Ship `scripts/check-security-config.ts` auditing which controls are present, exiting `0`/`1`/`2`
  and emitting `LEVEL|file|line|rule|message`.
- Add a sixth `run-tests.sh` suite covering the auditor and the templates.
- Publish the coverage table stating Patterson's actual stack (SAST: CodeQL, Checkmarx; SCA:
  Dependabot, Trivy, JFrog; secrets: GitLeaks, GitHub secret scanning; container/IaC: Trivy,
  Checkmarx) with the **DAST row open and addressed to AppSec**.
- Ship `_SOURCES.md` and `REFERENCES.md`. No GitHub-security ServiceNow KB id exists among the six
  known articles, so provenance records `[TBD: not specified in the six ServiceNow KB sources]`.
- Record the CodeQL caveat: the `.ts` files carry no `package.json` and no `tsconfig.json` by
  design, so the JS/TS extractor's "files analysed" count must be confirmed on first run rather
  than trusting a green check.

## Capabilities

### New Capabilities

- `engineering-skills/github-security-scanning`: a Patterson engineering skill that configures and
  audits GitHub security scanning controls in a repository, and publishes honest control coverage.

### Modified Capabilities

None. `openspec/specs/` currently contains no capabilities to modify.

## Non-goals

- **DAST stays open.** This change does not select, install, or claim a DAST tool. Trivy and
  GitLeaks are not DAST; the coverage row remains open and addressed to AppSec, per HANDOFF.md 1A
  and open question #7.
- **The `gh api -X PATCH` secret-scanning enablement command is documentation inside the skill and
  is never executed.** No remote mutation of any kind is performed.
- **No repo furniture.** `.github/secret_scanning.yml` for `patterson-corp` itself is
  `add-repo-furniture`'s deliverable; this change ships the *template* that the skill installs into
  consumer repos.
- **No README, badge, or sibling `REFERENCES.md` edits.** The integration pass owns the shared
  files -- skill count badges, the engineering plugin roster, and the "Related Patterson standards"
  tables in the six existing skills.
- **No npm/pip Dependabot ecosystems.** `github-actions` only.
- **No new dependencies and no binaries.**

## Impact

- New skill directory with `SKILL.md`, `references/`, `assets/`, `scripts/`, `tests/`,
  `_SOURCES.md`, `REFERENCES.md`.
- Adds the sixth test suite to the repo-wide gate battery, moving the skill count from 11 to 12 --
  the badge and roster updates land in the integration pass, not here.
- No change to existing skills, hooks, or validators.
