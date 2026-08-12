# No validator for this skill — on purpose

The Monitoring & Alerting standard regulates configuration that lives in PagerDuty, Azure Monitor,
Dynatrace, Sentinel, Qualys and ServiceNow — not in a repository.

---

Whether each of the eight layers has a PagerDuty service, an escalation policy and a schedule cannot
be determined by reading files.

> [!WARNING]
> A script that scanned a repo for the word "pagerduty" would produce confident, meaningless
> results.

Verify against the source systems, or use the `standards-compliance-reviewer` agent for the parts
that *are* visible in a repo:

- committed alert rules
- App Insights instrumentation
- dashboards-as-code
- Log Analytics queries

## Related validators that *are* scriptable

| Skill | Validator |
|---|---|
| `cicd-pipeline-standards` | [`../../cicd-pipeline-standards/scripts/check-pipeline.ts`](../../cicd-pipeline-standards/scripts/check-pipeline.ts) |
| `azure-compute-standards` | [`../../azure-compute-standards/scripts/check-compute.ts`](../../azure-compute-standards/scripts/check-compute.ts) |
| `storage-data-standards` | [`../../storage-data-standards/scripts/check-storage.ts`](../../storage-data-standards/scripts/check-storage.ts) |
| `approved-software-check` | [`../../approved-software-check/scripts/check-tooling.ts`](../../approved-software-check/scripts/check-tooling.ts) |
