# Environment matrix

Source: Azure Environment Standards, `sys_kb_id=a507920d2b25c7941f16fc8bee91bfc4`.

Five environments, in promotion order: **Sandbox → Dev → Test → Stage → Production**.

---

## The matrix

| Dimension | Sandbox | Dev | Test | Stage | Production |
|---|---|---|---|---|---|
| Customer data | No | No | No, or de-identified | Yes (controlled) | Yes |
| Change control | Minimal | Minimal | Moderate | High | Strict |
| Playbook required | No | No | No | No | **Yes** |
| Disaster recovery | None | None | None | Optional | **Required, with a set RPO and RTO** |

## Reading the table

- **"No, or de-identified"** for Test means either is acceptable. It does not mean de-identified
  data is preferred over none.
- **Playbooks are required for Production only.** Do not tell a team they need a playbook for Stage;
  the standard does not require one.
- **DR is optional at Stage.** "Optional" is the standard's word. A team that skips Stage DR is
  compliant.
- **Production DR requires a *set* RPO and RTO** — specific documented numbers, not a statement that
  DR exists. The Storage & Data standard adds that RPO and RTO are documented per application by the
  owner and that failover is tested at least annually.

## Gaps

> [!WARNING]
> `[TBD: the standard does not define the change-control tiers (Minimal / Moderate / High /
> Strict) in terms of concrete approvals, freeze windows or CAB involvement.]`
>
> `[TBD: the standard does not state whether every application must have all five environments, or
> whether tiers may be skipped.]`
>
> `[TBD: the standard does not state target RPO/RTO values for Production; it requires only that
> they be set.]`
