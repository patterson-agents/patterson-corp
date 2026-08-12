# Backup, redundancy and disaster recovery

Source: Storage & Data Standards, `sys_kb_id=fdc09a4d93548f908037f8bd1dba10ed`.

---

## Backup

| Control | Requirement |
|---|---|
| Coverage | **All critical data services** |
| Production standard | **Immutable + air-gapped** |
| Full backup | **Weekly** |
| Incremental | **Daily differential or incremental** |
| SQL full recovery model | **15-minute transaction logs** |
| Copies | **Two** — primary + secondary |
| Retention | **30 days** |
| Blob soft delete | **Recommended** |

> [!NOTE]
> Blob soft delete is *recommended*, not required. Report its absence as advisory, never as a
> violation.

`[TBD: the standard does not define "critical data services" — which services qualify is not
enumerated.]`
`[TBD: the standard does not state where the secondary copy must live (region, subscription or
tenant).]`

**Commvault** is the backup tool monitored under the Monitoring & Alerting standard, and appears in
its list of in-scope systems.

## Redundancy

Choose from **LRS, ZRS, GRS, GZRS**, aligned to criticality and to the application's RPO and RTO.

| Option | Scope |
|---|---|
| LRS | Locally redundant |
| ZRS | Zone redundant |
| GRS | Geo redundant |
| GZRS | Geo-zone redundant |

`[TBD: the standard does not map criticality levels or RPO/RTO thresholds to specific redundancy
options. The choice is the application owner's, aligned to their documented RPO/RTO.]`

## Disaster recovery

- **RPO and RTO documented per application**, by **the owner**.
- **Failover tested at least annually.**

This dovetails with the Azure Environment Standards: DR is not required for Sandbox, Dev or Test; it
is optional for Stage; and it is **required with a set RPO and RTO for Production**.

`[TBD: the standard does not state target RPO/RTO values, nor what evidence an annual failover test
must produce.]`

## Delivery and exceptions

- **All storage via IaC.** Terraform, approved modules only.
- Exceptions require **all three**:
  1. a documented risk assessment,
  2. compensating controls,
  3. **EA Team approval**.

> [!IMPORTANT]
> This is a stricter path than the general Azure Environment Standards exception route, where the
> Business Owner approves. For storage, the EA Team is the approver.
