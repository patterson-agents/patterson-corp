# Monitoring tooling and signal routing

Source: Monitoring & Alerting, `sys_kb_id=972394c02b80835ce9affd3fc891bf04`.
Approval status: Approved Software, `sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`.

---

## Alerting path

**PagerDuty is the primary alerting path.** Every layer routes through it. ReliaQuest, the
third-party 24x7 managed security provider, also **calls via PagerDuty for high and critical**
findings — so PagerDuty is the single pane for both machine-generated and human-escalated alerts.

## Tools

| Tool | Purpose | Approval | Owner |
|---|---|---|---|
| **PagerDuty** | Primary alerting, escalation, schedules | Required | Infra CloudOps |
| **Azure Monitor Baseline Alerts (AMBA)** | **Sev 1 & 2 as the starting point** | `[TBD]` | `[TBD]` |
| **Dynatrace** | APM | Required | Infra CloudOps |
| **Azure App Insights** | Application telemetry | Required | Infra CloudOps |
| **Log Analytics Workspace** | Log storage and **KQL** query | None needed, **has a cost** | Infra CloudOps |
| **Microsoft Defender for Cloud** | Cloud security posture | `[TBD]` | `[TBD]` |
| **Sentinel** | **Anything security** | `[TBD]` | `[TBD]` |
| **SQL Sentry** | **Critical SQL instances** | `[TBD]` | `[TBD]` |
| **Commvault** | Backup | `[TBD]` | `[TBD]` |
| **Qualys** | Vulnerability scanning — **nightly, creates ServiceNow tickets** | Required | AppSec |
| **ReliaQuest** | 3rd-party 24x7 managed security — **calls via PagerDuty for high/critical** | `[TBD]` | `[TBD]` |

> [!NOTE]
> Ownership above follows the Approved Software standard's rule that AppSec owns the security tools
> and Infra CloudOps owns source control, Terraform and observability. Tools that appear only in the
> Monitoring standard have no stated owner and are marked `[TBD]`.

## Routing rules

- **Anything security → Sentinel.** This is stated as a blanket rule.
- **AMBA sev 1 & 2 is the *starting point*.** It is the baseline to build from, not the complete
  alert set.
- **Qualys findings become ServiceNow tickets**, not PagerDuty alerts. Nightly cadence.
- **ReliaQuest escalations arrive through PagerDuty**, at high and critical severity.
- **SQL Sentry covers critical SQL instances** specifically — not all SQL.

`[TBD: the standard does not state which tool owns which of the eight layers, so the mapping above
is by tool purpose, not by an explicit layer assignment in the source.]`

## Overlap between Dynatrace and App Insights

Both are listed, both require approval, both are APM/telemetry.

`[TBD: the standard does not state when to use Dynatrace versus Azure App Insights, nor whether both
are expected on the same workload.]`
