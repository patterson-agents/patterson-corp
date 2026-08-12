# Required CI scans

Source: CI/CD Pipeline Standards, `sys_kb_id=c70e79833b650f107f43b50236e45a7d`.
Tool approval status and ownership: Approved Software, `sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`.

---

## The seven scans

CI must include all of the following:

| # | Scan | Named tool | Approval | Owner |
|---|---|---|---|---|
| 1 | SAST | Checkmarx | Required | AppSec |
| 2 | SCA | Checkmarx | Required | AppSec |
| 3 | DAST | `[TBD: no tool named]` | `[TBD]` | `[TBD]` |
| 4 | Secret scanning | GitLeaks | None needed | AppSec |
| 5 | API scanning | Checkmarx | Required | AppSec |
| 6 | Container scanning | **Trivy or Checkmarx** | Trivy: none needed. Checkmarx: required | AppSec |
| 7 | IaC scanning | **Checkmarx** | Required | AppSec |

## Additional CI requirement

**Approved base images.** Only security-approved images may be used. Unmodified Microsoft
marketplace images qualify (Azure Compute Standards).

`[TBD: the standards do not enumerate an approved *container* base image or registry list.]`

## Notes

- The Approved Software standard records that **"Checkmarx will replace this tool"** against Trivy.
  Trivy remains approved today; new work should account for the migration.
- JFrog (approval required, AppSec) covers **3rd-party package security**. The CI/CD standard does
  not list it among the required CI scans; it is listed here only so you do not mistake it for one.
- Qualys (approval required, AppSec) is **vulnerability scanning**, and in the Monitoring & Alerting
  standard runs nightly and creates ServiceNow tickets. It is not one of the seven CI scans.

## Enforcement

[`../scripts/check-pipeline.ts`](../scripts/check-pipeline.ts) detects each scan by keyword.

> [!IMPORTANT]
> Keyword detection proves a *string* is present, not that the scan runs, gates the build, or is
> configured correctly. Confirm gating manually.
