# Monitoring layers and KPIs

Source: Monitoring & Alerting, `sys_kb_id=972394c02b80835ce9affd3fc891bf04`.

---

## The eight layers

| # | Layer |
|---|---|
| 1 | Infrastructure |
| 2 | Network |
| 3 | SQL DB & Storage |
| 4 | Application |
| 5 | User Experience |
| 6 | Business |
| 7 | Security & Compliance |
| 8 | Disaster Recovery |

`[TBD: the standard does not enumerate the specific signals, metrics or thresholds required within
each layer.]`

## What every layer requires

**PagerDuty is the primary alerting path.** Each of the eight layers requires:

1. **Service(s) defined** in PagerDuty
2. An **escalation policy**
3. **Schedules**

> [!IMPORTANT]
> All three, for every layer. A layer is not covered because an alert exists somewhere; it is
> covered when the alert reaches a defined PagerDuty service with an escalation policy and an
> on-call schedule behind it.

PagerDuty itself is **approved but requires approval** before use (Approved Software standard).

## Universal KPIs

| KPI | Meaning |
|---|---|
| **MTTD** | Mean time to detect |
| **MTTA** | Mean time to acknowledge |
| **MTTR** | Mean time to resolve |

These are universal — they apply to every layer, not only to production incidents.

## DORA metrics

| Metric |
|---|
| Deployment frequency |
| Lead time for changes |
| MTTR |
| Change failure rate |

Deployment frequency, lead time and change failure rate are produced by the CI/CD pipeline, which
ties this standard to the CI/CD Pipeline Standards. MTTR is shared between the universal KPIs and
DORA.

> [!WARNING]
> `[TBD: no target values, thresholds or reporting frequency are stated for any KPI or DORA
> metric. Do not quote industry benchmarks as if they were Patterson targets.]`

## Review cadence

**Annually.** This is the only one of the six standards that states its own review cadence.
