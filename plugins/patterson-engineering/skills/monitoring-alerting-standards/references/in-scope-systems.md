# In-scope systems

Source: Monitoring & Alerting, `sys_kb_id=972394c02b80835ce9affd3fc891bf04`.

---

## The named systems

The standard states that in-scope systems **include**:

| System |
|---|
| Eaglesoft |
| CAESY |
| Dolphin |
| Fuse |
| eCommerce |
| TurnKey |
| Redbook |
| NVS |
| MarketHound |
| NaVetor |
| SAP |
| Commvault |

## How to read this list

> [!IMPORTANT]
> The word is **"include"**, not "are". The list is illustrative, not exhaustive. A system not on
> this list is **not** automatically out of scope.

`[TBD: the standard does not provide a complete in-scope inventory, nor a rule for determining
whether an unlisted system is in scope.]`
`[TBD: the standard does not state per-system monitoring requirements — which layers apply to
Eaglesoft versus SAP, for example, is not specified.]`

Commvault appears twice in the standard: once as a monitored in-scope system, and once as the backup
tool. Both readings are correct — the backup platform is itself monitored.

## Cross-reference

The Storage & Data Standards name Commvault-style backup requirements (immutable, air-gapped, weekly
full plus daily incremental, 30-day retention, two copies). Monitoring the backup platform is how
those requirements are shown to be met.
