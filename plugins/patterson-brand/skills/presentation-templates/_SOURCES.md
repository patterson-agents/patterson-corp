# Sources — presentation-templates skill

Extraction date: **2026-08-11**. Read locally from Patterson-owned PDFs. Nothing was invented.

---

> [!IMPORTANT]
> **No template binaries are shipped.** No `.potx`, `.pptx`, `.dotx`, image or font file is committed
> — they are large, they live on SharePoint, and they are governed there. See
> [`REFERENCES.md`](REFERENCES.md).

## Confidence scale

| Rating | Meaning |
|---|---|
| **High** | The rule appears as literal text in the source document. |
| **Medium** | Derived from a documented rule, or OCR'd. |
| **Low** | Inferred. Treat as a hypothesis. |

## Documents

| Key | Document | Date | Confidence | What this skill takes from it |
|---|---|---|---|---|
| `[BG25 p.N]` | **Patterson Companies Brand Guide, VERSION 3.2025** | 2025-04-08 | **High** | Arial for OfficeSuite (p.25), sentence case (p.25–27, p.59), palette and infographic designation (p.24), logo rules (p.13–20), email signatures (p.28–32), internal comms and image sizes (p.43–46), video (p.52–53), CTA limit (p.10) |
| `[DS20 p.N]` | DesignSystem_042120.pdf | 2020-04 | High | Eyebrow pattern (p.16), UI copy rules (p.10), accent-color restriction (p.8), governance quote (p.40) |
| `[COPY22]` | Patterson Companies Copy Style Guide 2022 | 04/2022 | High | The PowerPoint ampersand allowance, phone/URL formatting, department and title capitalization |
| `[IMG20 p.N]` | ImageSpecs_042120.pdf (image-only, OCR'd) | 2020-04-21 | **Medium** | Icon export at 80 × 80 |

## The significant gap in this skill

> [!WARNING]
> `[BG25 p.50]` is titled **"PowerPoint best practices"** and also carries the asset links. Its
> individual bullets were **not recovered** in the extraction this plugin is built from — only the
> page title and the fact that it links to the Corporate Branding, Logos and Icons pages.

Consequently:

- `[TBD: the PowerPoint best-practice bullets at BG25 p.50.]`
- `[TBD: the SharePoint path of the Patterson PowerPoint template itself.]`
- `[TBD: named slide layouts / slide masters in the official template.]`
- `[TBD: slide dimensions and aspect-ratio standard — not published in any extracted source.]`
- `[TBD: Word document, letterhead and report template specifications.]`

> [!CAUTION]
> Everything in [`references/deck-construction.md`](references/deck-construction.md) about slide roles
> is **derived from documented Brand Guide rules**, not from a published Patterson layout inventory,
> and says so in place. Do not present it as the official template structure.

## Escalation

**corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`. Patterson Priorities submissions go
to Corporate Communications `[BG25 p.43]`.
