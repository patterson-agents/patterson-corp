## Context

Six `patterson-engineering` skills already exist; `cicd-pipeline-standards` is the closest analogue
and is the shape reference for this one. The repository has no `package.json`, no `tsconfig.json`,
and no `node_modules` by design, which changes how CodeQL behaves and rules out any tooling that
assumes a package manifest. Patterson holds a GHAS licence (evidenced by the active-committers
export in `downloads/`), so the controls this skill configures are licensed and available.

The run operates under a hard no-remote-operations constraint: `gh` is authenticated as the wrong
account, and nothing may be pushed or mutated remotely.

## Goals / Non-Goals

**Goals:**

- A skill that *installs* controls, not one that describes them.
- An auditor that a CI job or a pre-commit hook can call and act on, following the repo's
  `0`/`1`/`2` plus `LEVEL|file|line|rule|message` convention.
- A coverage statement that is true, including where it is uncomfortable.

**Non-Goals:**

- Selecting or installing a DAST tool.
- Executing any GitHub API mutation.
- Touching shared files (README badges, sibling `REFERENCES.md` tables, plugin roster).

## Decisions

- **Skill, not bare workflow files.** HANDOFF.md's ground rule is that everything
  Patterson-specific is a skill; the workflow YAML lives in `assets/` as an installable template so
  it is versioned with the guidance that explains it.
- **DAST row stays open.** A false "covered" entry is worse than a visible gap, because downstream
  audits would inherit the falsehood. The table names the gap and its owner (AppSec) instead.
- **Ordering: exclusion file before push protection.** Enabling push protection first would block
  the author on the repo's own synthetic-credential fixtures. The skill encodes the ordering rather
  than leaving it to be rediscovered.
- **Dependabot `github-actions` only.** Declaring an npm ecosystem in a repo with no `package.json`
  produces permanent Dependabot errors and trains readers to ignore them.
- **`[TBD]` over a fabricated KB id.** None of the six known ServiceNow articles covers GitHub
  security scanning, and the standing rule forbids inventing a requirement or a citation.
- **CodeQL verification by count, not by colour.** With no package manifest, the JS/TS extractor can
  legitimately analyse zero files and still report success, so the skill instructs reading the
  count.

## Risks / Trade-offs

- An open DAST row may read as an incomplete deliverable to a reviewer who has not read HANDOFF.md
  1A. Mitigated by stating the reason inline in the table and naming AppSec as the owner.
- The auditor can only see repository files; it cannot verify server-side settings such as whether
  secret scanning is actually enabled on the remote, because no remote calls are permitted. The
  skill states this limit explicitly so a clean audit is not mistaken for a hardened repository.
- Shipping the `gh api -X PATCH` command as documentation risks a reader pasting it against the
  wrong repository. Mitigated by placing it behind an explicit warning and never scripting it.
