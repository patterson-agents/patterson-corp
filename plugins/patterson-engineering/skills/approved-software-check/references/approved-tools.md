# Approved software — full list

Source: Approved Software, `sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`.
Scope as summarised: developer and observability tooling.

---

## Table of contents

- [Tier 1 — approved, no approval needed](#tier-1--approved-no-approval-needed)
- [Tier 2 — approved, approval required](#tier-2--approved-approval-required)
- [Tier 3 — approved, no approval needed, carries a cost](#tier-3--approved-no-approval-needed-carries-a-cost)
- [Conditions worth restating](#conditions-worth-restating)
- [Gaps](#gaps)

## Tier 1 — approved, NO approval needed

| Tool | Category | Conditions | Owner |
|---|---|---|---|
| GitHub | Source control | **Enterprise managed org only.** **Public repos require approval.** | Infra CloudOps |
| Terraform | IaC | **Approved modules only.** | Infra CloudOps |
| Trivy | Container security | Standard notes: *"Checkmarx will replace this tool."* | AppSec |
| GitLeaks | Secret scanning | — | AppSec |

## Tier 2 — approved, approval REQUIRED

| Tool | Category | Conditions | Owner |
|---|---|---|---|
| Azure DevOps | Source control / pipelines | — | Infra CloudOps |
| Visual Studio | IDE | **Professional** for non-Principal engineers; **Enterprise** for Principal and above | `[TBD]` |
| Lucid Suite | Diagramming | — | `[TBD]` |
| LaunchDarkly | Feature flags | — | `[TBD]` |
| Tonic | Data de-identification | — | `[TBD]` |
| JFrog | 3rd-party package security | — | AppSec |
| Checkmarx | SAST / SCA / API / IaC scanning | — | AppSec |
| Qualys | Vulnerability scanning | — | AppSec |
| Dynatrace | APM | — | Infra CloudOps |
| PagerDuty | Alerting | — | Infra CloudOps |
| Azure App Insights | Application telemetry | — | Infra CloudOps |
| Confluence | Documentation | — | `[TBD]` |
| SnagIT | Screen capture | — | `[TBD]` |

## Tier 3 — approved, no approval needed, carries a cost

| Tool | Category | Note | Owner |
|---|---|---|---|
| Log Analytics Workspace | Log storage / KQL | **No approval, but has a cost** | Infra CloudOps |

## Conditions worth restating

- **GitHub public repos require approval.** Making a repository public is an approval event, not a
  routine setting change.
- **GitHub enterprise managed org only.** Personal accounts and non-EMU orgs are out of scope of the
  approval.
- **Terraform: approved modules only.** Using Terraform is approved; using an arbitrary module from
  the public registry is not covered by that approval.
- **Trivy is being replaced by Checkmarx.** Trivy remains approved today. New container-scanning
  work should account for the migration.
- **Visual Studio edition is tied to level.** Professional below Principal, Enterprise at Principal
  and above.

## Gaps

> [!WARNING]
> `[TBD: the standard does not state how to request approval, the SLA for a decision, or what
> happens to a tool already in use that turns out to be unlisted.]`
>
> `[TBD: the standard does not cover non-developer tooling, so the absence of a business
> application from this list says nothing about its status.]`
>
> `[TBD: no DAST tool is named in any of the six standards, although DAST is a required CI scan.]`
