# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities in `patterson-corp` privately, never through a public
GitHub issue.

Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
feature on this repository ("Security" tab -> "Report a vulnerability") if it is enabled.
That flow creates a private draft advisory visible only to maintainers and gives you a
secure channel to attach reproduction detail. If it is not yet enabled on this repository,
report instead through Patterson's internal security contact:
`[TBD: Patterson-wide security contact / mailbox not specified in this repository's source
material; do not report a vulnerability publicly while this is unresolved -- escalate
through your normal Patterson security channel instead]`.

Please include, where you can:

- The affected file, skill, script, or workflow.
- Reproduction steps or a minimal example.
- The potential impact as you understand it (what an attacker could do, not just what
  looks unusual).
- Whether the issue is specific to this repository or reflects a broader Patterson
  standard that this repository documents.

## What is in scope

- The plugin manifests, skills, agents, and hooks under `plugins/`.
- The validator scripts under `scripts/` and the CI/CD configuration under `.github/`.
- The repository's own supply chain: its (currently empty) dependency footprint, and any
  future dependency this repository adds.

## What is deliberately out of scope for this file

- Vulnerabilities in the Patterson products or infrastructure that the standards in
  `plugins/patterson-engineering/` *describe* -- report those through the normal channel
  for that system, not through this repository.
- Automated secret-scanning coverage of this repository's fixture data. The tests under
  `plugins/patterson-engineering/hooks/tests/` deliberately contain synthetic AWS keys and
  database connection strings to exercise the `pretooluse-guard.ts` hook. They are fake.
  `.github/secret_scanning.yml` excludes that directory so a real scanner does not flag it
  and does not block pushes because of it. If you believe one of those fixtures is not
  actually synthetic, report it as a vulnerability -- do not assume.

## Response

This repository does not commit to a specific response-time service level agreement.
`[TBD: no vulnerability-response SLA has been set by Patterson platform leadership for this
repository as of this writing.]` Reports are triaged by the owning team in `CODEOWNERS` for
the affected path.

## Automated scanning

A seventh `patterson-engineering` skill, `github-security-scanning`, is being added in a
companion change to install and audit GitHub-native scanning controls (CodeQL, Dependabot,
secret scanning, and this repository's own security posture) in any Patterson repository,
including this one. Until that skill lands, treat this file and
`.github/secret_scanning.yml` as the current state of this repository's own security
configuration, not as a description of the full Patterson security control stack -- see
`plugins/patterson-engineering/skills/cicd-pipeline-standards/references/required-scans.md`
for the standards-level requirement and its currently-unmet DAST row.
