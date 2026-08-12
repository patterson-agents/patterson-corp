# Control coverage, and the DAST gap

Source for the required checks: CI/CD Pipeline Standards, `sys_kb_id=c70e79833b650f107f43b50236e45a7d`.
Source for tool approval status and owners: Approved Software, `sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`.

---

## Coverage

| Required check | Patterson tools | Covered? |
|---|---|---|
| SAST | CodeQL, Checkmarx | yes |
| SCA | Dependabot, Trivy, JFrog | yes |
| Secret scanning | GitLeaks, GitHub secret scanning | yes |
| Container / IaC | Trivy, Checkmarx | yes |
| **DAST** | **—** | **NO** |

## The DAST gap

**Trivy and GitLeaks are not DAST.**

- GitLeaks reads files and git history looking for credential patterns.
- Trivy reads files, lockfiles, images and IaC manifests looking for known vulnerabilities and
  misconfigurations.
- Both are static. Neither one starts the application, sends it a request, or observes its
  response.

DAST means *dynamic* application security testing: exercising a **running** application from the
outside. The tools that do this are of the OWASP ZAP / Burp Suite / Checkmarx DAST family. Nothing
in Patterson's current stack does it.

This matters because the CI/CD Pipeline Standards list DAST as a **required PR check**. Recording
Trivy or GitLeaks against that row would produce a documented-but-false control: an auditor reading
the table would conclude the check is satisfied, and no one would go looking for the real one. A
visible gap is recoverable. A false green is not.

> [!IMPORTANT]
> The DAST row stays **OPEN**, addressed to **AppSec**. Do not close it by relabelling a static
> scanner. Close it by selecting a DAST tool and wiring it against a deployed environment.

`[TBD: no specific DAST tool is named in the CI/CD Pipeline Standards.]`

`[TBD: the standards do not state which environment DAST should run against, nor whether the check
gates the PR or the release.]`

## Full seven-scan mapping

The coverage table above is the five-row summary. The CI/CD standard actually enumerates seven
scans; this is the complete mapping, so that API scanning is not lost between the rows.

| # | Required scan | Named in the standard | Also available via GHAS | Approval | Owner |
|---|---|---|---|---|---|
| 1 | SAST | Checkmarx | CodeQL | Checkmarx: required | AppSec |
| 2 | SCA | Checkmarx | Dependabot alerts and updates | Checkmarx: required | AppSec |
| 3 | DAST | `[TBD: no tool named]` | — | `[TBD]` | `[TBD]` |
| 4 | Secret scanning | GitLeaks | GitHub secret scanning, push protection | GitLeaks: none needed | AppSec |
| 5 | API scanning | Checkmarx | — | Required | AppSec |
| 6 | Container scanning | Trivy **or** Checkmarx | — | Trivy: none needed | AppSec |
| 7 | IaC scanning | Checkmarx | — | Required | AppSec |

> [!CAUTION]
> **The standard names Checkmarx, GitLeaks and Trivy. It does not name CodeQL, Dependabot or
> GitHub secret scanning.** Those are GitHub Advanced Security capabilities that Patterson
> licenses (see [`github-advanced-security.md`](github-advanced-security.md)); listing them in the
> coverage table is a statement about what Patterson *has*, not a claim that the standard requires
> them. Do not cite this skill as authority for a Checkmarx exemption.
>
> `[TBD: the CI/CD Pipeline Standards do not state whether a GHAS control may substitute for the
> named Checkmarx control, or only supplement it. Ask AppSec before treating CodeQL as the SAST
> control of record.]`

## Notes carried from the CI/CD skill

- The Approved Software standard records **"Checkmarx will replace this tool"** against Trivy.
  Trivy remains approved today; new work should account for the migration.
- **JFrog** (approval required, AppSec) covers 3rd-party package security. The CI/CD standard does
  not list it among the required CI scans. It appears in the SCA row above because it is part of
  Patterson's real dependency-security stack, not because the standard requires it there.
- **Qualys** (approval required, AppSec) is vulnerability scanning and runs nightly under the
  Monitoring & Alerting standard. It is not one of the seven CI scans and is not DAST.

## What the validator can say about this

[`../scripts/check-security-config.ts`](../scripts/check-security-config.ts) emits
`INFO|.|0|coverage/dast-open|...` on **every** run. That is deliberate: the gap is a property of
the tooling stack, not of any one repository, so no repository can be configured into closing it.
