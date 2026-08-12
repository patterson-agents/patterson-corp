# Ownership and approval

Source: Approved Software, `sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`.

---

## The ownership statement

The standard states:

- **AppSec owns the security tools.**
- **Infra CloudOps owns source control, Terraform, and observability.**

That is the entire basis for owner assignment in this skill.

### Derived assignments

| Owner | Tools | Basis |
|---|---|---|
| **AppSec** | Trivy, GitLeaks, Checkmarx, Qualys, JFrog | Security tooling |
| **Infra CloudOps** | GitHub, Azure DevOps | Source control |
| **Infra CloudOps** | Terraform | Named explicitly |
| **Infra CloudOps** | Dynatrace, PagerDuty, Azure App Insights, Log Analytics Workspace | Observability |
| `[TBD]` | Visual Studio, Lucid Suite, LaunchDarkly, Tonic, Confluence, SnagIT | Neither category |

JFrog is assigned to AppSec because the standard describes it as **3rd-party package security**. If
your organisation treats it as an artifact repository owned elsewhere, confirm with both teams — the
standard's one-line ownership rule does not settle it.

> [!IMPORTANT]
> ``[TBD: the standard does not assign owners tool-by-tool. Every assignment above is derived from the single ownership sentence, and the `[TBD]` row is genuinely unowned in the source.]``

## Requesting approval

`[TBD: the standard does not describe the approval request process, the intake form, the approver of
record per tool, or the decision SLA.]`

What the standard *does* establish:

| Situation | Rule |
|---|---|
| Tier 2 tools | Approval is required **before use** |
| Making a **GitHub repository public** | Requires approval even though GitHub itself does not |
| **Production service connections** | Require approval (CI/CD Pipeline Standards) |
| **Exceptions** to the Azure Environment Standards | Approved by the **Business Owner** |
| **Storage exceptions** | Documented risk assessment, compensating controls, and **EA Team** approval (Storage & Data Standards) |

Route an approval question to whichever of those applies. If none does, say the process is not
documented in the standard rather than guessing.

## Relationship to the CI/CD required scans

Five of the seven required CI scans map to tools on this list:

| Scan | Tool | Tier |
|---|---|---|
| SAST | Checkmarx | Approval required |
| SCA | Checkmarx | Approval required |
| API scanning | Checkmarx | Approval required |
| IaC scanning | Checkmarx | Approval required |
| Container scanning | Trivy **or** Checkmarx | Trivy: no approval. Checkmarx: approval required |
| Secret scanning | GitLeaks | No approval |
| DAST | `[TBD: no tool named in any standard]` | `[TBD]` |

A team standing up a compliant pipeline therefore needs Checkmarx approval for four of the seven
scans, and has no named tool for the fifth.
