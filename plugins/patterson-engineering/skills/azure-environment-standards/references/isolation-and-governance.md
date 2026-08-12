# Isolation and governance

Source: Azure Environment Standards, `sys_kb_id=a507920d2b25c7941f16fc8bee91bfc4`.

---

## Subscription isolation

- **Production workloads run in dedicated subscriptions.**
- **Non-production and production must NEVER share a subscription.**

> [!CAUTION]
> The standard states this without exception. Treat any shared-subscription design as a blocking
> finding.

`[TBD: the standard does not say whether each non-production tier needs its own subscription, or
whether Sandbox, Dev, Test and Stage may share one between them.]`

## Governance

| Control | Requirement |
|---|---|
| Budgets | **Required at the subscription level.** |
| Tagging | **Standard tagging on all resources.** |
| Infrastructure | **All infrastructure via IaC.** |
| Policy | **Enforced at the Management Group level.** |

### Tagging

`[TBD: the required tag keys and allowed values are not enumerated in the Azure Environment
Standards.]`

The only tag requirement stated anywhere in the six standards is the **data-classification** tag on
storage resources, from the Storage & Data standard (`Public`, `Internal`, `Confidential`,
`Restricted`).

### IaC

All infrastructure is deployed via IaC. **Terraform** is approved with no approval needed, but
**approved modules only** (Approved Software standard). IaC scanning with **Checkmarx** is a
required CI stage (CI/CD Pipeline Standards).

`[TBD: the standard does not say whether Bicep or ARM templates are acceptable IaC alternatives to
Terraform.]`

### Policy

Policy enforcement is at the **Management Group** level.

> [!IMPORTANT]
> Do not propose per-subscription policy assignment as the primary control.

`[TBD: the standard does not enumerate the required Azure Policy definitions or initiatives, nor the
management group hierarchy.]`

## Exceptions

Exceptions are approved by the **Business Owner** (see
[`roles-and-responsibilities.md`](roles-and-responsibilities.md)).

> [!NOTE]
> The Storage & Data standard has a stricter, separate exception path for storage: documented risk
> assessment, compensating controls, and **EA Team approval**.
