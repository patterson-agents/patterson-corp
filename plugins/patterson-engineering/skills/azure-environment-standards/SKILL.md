---
name: azure-environment-standards
description: Applies the Patterson Azure Environment Standards covering the Sandbox, Dev, Test, Stage and Production tiers. Use when deciding which environment gets customer data, setting up a new subscription, writing a landing zone or management group policy, tagging or budgeting resources, defining DR requirements, or answering "can we use prod data in test", "do prod and non-prod share a subscription", "who approves this exception", "who owns the SLA" or "which environment needs a playbook".
---

# Azure Environment Standards

The five environment tiers, what data each may hold, and who owns which decision.

Authoritative source: ServiceNow IT Standards & Guidelines, **Azure Environment Standards**
(`sys_kb_id=a507920d2b25c7941f16fc8bee91bfc4`). Owner: Infra CloudOps.

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. Where the standard is
> silent, say `[TBD]`.

## The five environments

There are exactly five: **Sandbox, Dev, Test, Stage, Production**.

| | Sandbox | Dev | Test | Stage | Production |
|---|---|---|---|---|---|
| Customer data | No | No | No, or de-identified | Yes (controlled) | Yes |
| Change control | Minimal | Minimal | Moderate | High | Strict |
| Playbook required | No | No | No | No | **Yes** |
| Disaster recovery | None | None | None | Optional | **Required, with a set RPO and RTO** |

De-identification in Test is the job of **Tonic** (approval required — see
`approved-software-check`).

## Decision rules

### Isolation — the hard one

- **Production workloads live in dedicated subscriptions.**
- **Non-production and production must NEVER share a subscription.** There is no exception path for
  this in the standard.

> [!CAUTION]
> If a design puts a prod resource and a non-prod resource in the same subscription, that is a
> blocking finding. Say so plainly.

### Data

- Never place customer data in Sandbox or Dev.
- Test may hold **no customer data at all, or de-identified customer data**. Real customer data in
  Test is a violation.
- Stage holds customer data **under control**; Production holds it outright.
  `[TBD: the standard does not define what "controlled" means for Stage — who grants access, for how
  long, or under what logging.]`

### Governance

- **Budgets are required at the subscription level.**
- **Standard tagging on all resources.**
  `[TBD: the standard does not enumerate the required tag keys or their allowed values. The Storage
  & Data standard separately requires a data-classification tag on storage resources.]`
- **All infrastructure is deployed via IaC.** Terraform is the approved IaC tool (approved modules
  only).
- **Policy enforcement happens at the Management Group level**, not per subscription.

### Roles — route the question to the right owner

| Role | Owns |
|---|---|
| **Business Owner** | SLAs, budgets, **approves exceptions** |
| **Technical Owner** | Performance and scaling triggers, SKU selection |
| **Application Owner** | Application lifecycle, configuration, alert response |
| **Requestor** | Submits requests. **Does NOT provision.** |

A Requestor asking to provision directly is a process violation: they submit a request; someone else
provisions.

## Validator

> [!NOTE]
> There is **no validator script for this standard**, deliberately. Its requirements — subscription
> isolation, change-control tier, DR RPO/RTO, role assignment, exception approval — are
> organisational facts that do not appear in an IaC file. A script would either read subscription
> IDs it cannot interpret or guess. See [`scripts/README.md`](scripts/README.md).

Use the checklist below by hand, and use `standards-compliance-reviewer` for a repo-wide pass.

- [ ] Which environment is this? Does the data placement match the table?
- [ ] Is the subscription dedicated to production, or shared with non-prod?
- [ ] Is there a budget at the subscription level?
- [ ] Are all resources tagged?
- [ ] Is everything deployed by IaC, with policy at the Management Group?
- [ ] For Production: is there a playbook, and a documented RPO and RTO?
- [ ] Who is the Business Owner, Technical Owner and Application Owner?

## Reference material

| File | Contents |
|---|---|
| [`references/environment-matrix.md`](references/environment-matrix.md) | The full tier table with all five dimensions |
| [`references/isolation-and-governance.md`](references/isolation-and-governance.md) | Subscriptions, budgets, tagging, IaC, policy |
| [`references/roles-and-responsibilities.md`](references/roles-and-responsibilities.md) | The four roles and their decision rights |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |
