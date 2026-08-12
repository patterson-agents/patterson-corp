# No validator for this skill — on purpose

The Azure Environment Standards regulate facts that do not appear in a repository.

---

| Requirement | Where the answer actually lives |
|---|---|
| Which subscription a workload lands in | Azure subscription and management group layout |
| Whether Test holds de-identified data | The data itself, and the Tonic pipeline |
| Whether a subscription-level budget exists | Azure Cost Management |
| Who the Business Owner is | The service record, not the code |
| Whether Production has a playbook and a documented RPO and RTO | Runbook and DR documentation |

> [!IMPORTANT]
> A script scanning IaC could only guess at these. Guessing produces confident, wrong compliance
> claims, which is worse than no check.

Use the manual checklist in [`../SKILL.md`](../SKILL.md), or run the `standards-compliance-reviewer`
agent, which reasons over repository context rather than pattern-matching.

## Related validators that *are* scriptable

| Skill | Validator |
|---|---|
| `azure-compute-standards` | [`../../azure-compute-standards/scripts/check-compute.ts`](../../azure-compute-standards/scripts/check-compute.ts) |
| `storage-data-standards` | [`../../storage-data-standards/scripts/check-storage.ts`](../../storage-data-standards/scripts/check-storage.ts) |
| `cicd-pipeline-standards` | [`../../cicd-pipeline-standards/scripts/check-pipeline.ts`](../../cicd-pipeline-standards/scripts/check-pipeline.ts) |
| `approved-software-check` | [`../../approved-software-check/scripts/check-tooling.ts`](../../approved-software-check/scripts/check-tooling.ts) |
