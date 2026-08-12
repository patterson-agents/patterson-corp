---
name: monitoring-alerting-standards
description: Applies the Patterson Monitoring & Alerting standard covering the eight monitoring layers, PagerDuty routing, MTTD/MTTA/MTTR and DORA metrics. Use when instrumenting a service, defining alerts or escalation policies, setting up dashboards or on-call schedules, choosing a monitoring tool — and when asked "what do we need to monitor", "where do alerts go", "do we use Dynatrace or App Insights", "what metrics do we report", "who gets paged" or "is this system in scope for monitoring".
---

# Monitoring & Alerting

Eight monitoring layers, one alerting path, and the KPIs reported across all of them.

Authoritative source: ServiceNow IT Standards & Guidelines, **Monitoring & Alerting**
(`sys_kb_id=972394c02b80835ce9affd3fc891bf04`). Owner: Infra CloudOps.
**Review cadence: annually.**

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. Where the standard is
> silent, say `[TBD]`.

## The eight layers

Monitoring is organised into eight layers. Every one must be covered:

1. Infrastructure
2. Network
3. SQL DB & Storage
4. Application
5. User Experience
6. Business
7. Security & Compliance
8. Disaster Recovery

## Per-layer requirement — the same three, every layer

**PagerDuty is the primary alerting path.** For each of the eight layers you must define:

1. **Service(s)** in PagerDuty
2. An **escalation policy**
3. **Schedules**

> [!WARNING]
> A layer with alerts but no PagerDuty service, or a service with no escalation policy or schedule,
> is incomplete. Check all three.

## Universal KPIs

**MTTD · MTTA · MTTR** — mean time to detect, acknowledge, resolve. These apply across all layers.

## DORA metrics

Tracked: **deployment frequency · lead time for changes · MTTR · change failure rate.**

Note MTTR appears in both sets. `[TBD: the standard does not state target values or thresholds for
any KPI or DORA metric.]`

## Tooling — route the question to the right tool

| Need | Tool | Notes |
|---|---|---|
| Starting alert set | **Azure Monitor Baseline Alerts (AMBA)**, **sev 1 & 2** | The stated starting point |
| APM | **Dynatrace** | Approval required |
| Application telemetry | **Azure App Insights** | Approval required |
| Log query | **Log Analytics Workspace + KQL** | No approval needed, but has a cost |
| Cloud posture | **Microsoft Defender for Cloud** | |
| **Anything security** | **Sentinel** | Security signals go to Sentinel |
| Critical SQL instances | **SQL Sentry** | |
| Backup | **Commvault** | |
| Vulnerability scanning | **Qualys** | Nightly scans, **creating ServiceNow tickets** |
| 24x7 managed security | **ReliaQuest** (3rd party) | **Calls via PagerDuty for high/critical** |

Two routing rules worth stating explicitly:

- **Anything security → Sentinel.** Do not propose a general-purpose log pipeline for security
  events.
- **AMBA sev 1 & 2 is the starting point**, not the finished alert set. Build on it.

## In-scope systems

Eaglesoft · CAESY · Dolphin · Fuse · eCommerce · TurnKey · Redbook · NVS · MarketHound · NaVetor ·
SAP · Commvault.

The standard says in-scope systems *include* these, so the list is not exhaustive.
`[TBD: the standard does not give a complete in-scope system inventory, nor per-system monitoring
requirements.]`

## Validator

> [!NOTE]
> There is **no validator script for this standard**, deliberately. Its requirements — a PagerDuty
> service with an escalation policy and a schedule per layer, MTTD/MTTA/MTTR and DORA reporting,
> which tool covers which layer — live in PagerDuty, Azure Monitor, Dynatrace and ServiceNow, not in
> a repository. A file scanner would have nothing accurate to read. See
> [`scripts/README.md`](scripts/README.md).

Verify against those systems directly, or use `standards-compliance-reviewer` for what *is* visible
in a repo (alert rules committed as IaC, App Insights instrumentation, dashboards as code).

Manual checklist, per layer:

- [ ] Is there a PagerDuty service?
- [ ] Is there an escalation policy attached?
- [ ] Are there schedules covering it?
- [ ] Which tool from the table above produces the signal?
- [ ] Are MTTD, MTTA and MTTR being measured for it?

## Reference material

| File | Contents |
|---|---|
| [`references/layers-and-kpis.md`](references/layers-and-kpis.md) | The eight layers, universal KPIs, DORA metrics |
| [`references/tooling-and-routing.md`](references/tooling-and-routing.md) | Every tool, what it is for, approval status |
| [`references/in-scope-systems.md`](references/in-scope-systems.md) | The named systems and what the list does not tell you |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |
