# Sources — voice-and-tone skill

Extraction date: **2026-08-11**. Every rule and example was read from Patterson-owned PDFs held
locally.

---

> [!NOTE]
> The ✅/❌ example pairs are the source documents' own; none were written for this skill. They are
> quoted content, and are the only place in this plugin where such marks appear.

> [!IMPORTANT]
> **No binaries are shipped.** Canonical originals: see [`REFERENCES.md`](REFERENCES.md).

## Confidence scale

| Rating | Meaning |
|---|---|
| **High** | The rule appears as literal text in the source document. |
| **Medium** | Derived or OCR'd, or the source is materially out of date. |
| **Low** | Inferred. Treat as a hypothesis. |

## Documents

| Key | Document | Date | Text layer | Confidence |
|---|---|---|---|---|
| `[BG25 p.N]` | **Patterson Companies Brand Guide, VERSION 3.2025** — corporate voice (p.10–12), social (p.47–49), internal comms (p.43–46), email (p.28–32, p.58) | 2025-04-08 | Yes, complete | **High** |
| `[VOICE18]` | **Patterson Dental Marketing Copy Voice** — "An addendum to the Patterson Brand Guide" | Updated **9/25/18** | Yes, complete (2,629 chars) | **High for content; age is a caveat** |
| `[SOC19]` | **Patterson Companies Social Media Writing Guidelines** | **09/2019** | Yes, complete (4,756 chars) | **High for rules; audience data is stale** |
| `[COPY22]` | Patterson Companies Copy Style Guide 2022 | 04/2022 | Yes, complete | High — used here only for terminology cross-references |
| `[DS20 p.N]` | DesignSystem_042120.pdf | 2020-04 | Yes | High — UI copy rules (p.10) |

## Layering, as the sources themselves state it

- `[VOICE18]` calls itself *"an addendum to the Patterson Brand Guide"* — it **adds to** the corporate
  voice rather than replacing it.
- `[SOC19]` states *"the same writing guidelines outlined in the Brand Voice section should be
  followed on social media"* — again additive.
- `[BG25 p.12]` links out to `[VOICE18]`, and `[BG25 p.47]` links out to `[SOC19]`, which is why both
  are treated as still in force despite their age.

This is why the skill keeps the three voices explicitly separate rather than merging them.

## Age caveats — read these before quoting

| Item | Issue |
|---|---|
| "140+ years in business" `[VOICE18]` | Written in 2018. **Verify the current figure before reuse.** |
| Social audience demographics `[SOC19]` | From 09/2019, **seven years old**. Do not use for targeting. |
| `[VOICE18]` campaign example links | Titles only in the PDF text layer; no URLs are recoverable. `[TBD]` |
| Patterson Veterinary / AHI voice | `[TBD: no voice addendum exists for either.]` Do not invent one; use the corporate voice and say so. |
| Value proposition text `[BG25 p.8–9]` | Published verbatim in the guide but **not reproduced in this plugin** — read it from the source. |

## Escalation

**corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`. Patterson Priorities submissions go
to Corporate Communications `[BG25 p.43]`.
