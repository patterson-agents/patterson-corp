# Sources — copy-style-guide skill

Extraction date: **2026-08-11**. All rules were read from Patterson-owned PDFs held locally; nothing
was invented, and nothing was pulled from the open internet.

---

> [!IMPORTANT]
> **No binaries are shipped.** Canonical originals: see [`REFERENCES.md`](REFERENCES.md).

## Confidence scale

| Rating | Meaning |
|---|---|
| **High** | The rule appears as literal text in the source document. |
| **Medium** | Derived, OCR'd, or taken from a production implementation rather than a style document. |
| **Low** | Inferred from usage. Treat as a hypothesis. |

## Documents

| Key | Document | Date | Text layer | Confidence |
|---|---|---|---|---|
| `[COPY22]` | **Patterson Companies Copy Style Guide 2022** — the primary source for this skill | 04/2022 | Yes, complete (21,044 chars) | **High** — an alphabetical style dictionary; every entry extracted verbatim |
| `[BG25 p.N]` | Patterson Companies Brand Guide, VERSION 3.2025 | 2025-04-08 | Yes, complete | **High** — source of the sentence-case mandate (p.25–26, p.57, p.58, p.59), CTA limits (p.10), AP/AMA baseline (p.11), brand promise usage (p.6, p.28) |
| `[DS20 p.N]` | DesignSystem_042120.pdf | 2020-04 | Yes | **High** for UI copy rules (p.10, p.16, p.37) |
| `[SOC19]` | Patterson Companies Social Media Writing Guidelines | 09/2019 | Yes, complete | **High** for the hashtag capitalization rule |

> [!NOTE]
> `[COPY22]` has **no page numbers** — it is a continuous alphabetical listing, so entries are cited
> by document rather than page.

`[COPY22]` names its own base references: The Associated Press Stylebook (2022) and Webster's New
World College Dictionary. Its header carries:

```text
PATTERSON COMPANIES | 1031 Mendota Heights Road | Saint Paul, MN 55120
```

## Age caveats

> [!WARNING]
> `[COPY22]` is four years old at time of extraction. Its AP base reference is the 2022 Stylebook; AP
> has published newer editions. Product-name and job-title entries should be re-confirmed against a
> current source before being treated as legally exact.

Where `[COPY22]` and `[BG25]` overlap, **`[BG25]` wins** — most consequentially on case. The 2022
Brand Guide's "Titles should be all caps" is superseded by `[BG25 p.25–26]`.

## Rules that came from more than one source

| Rule | Sources | Confidence |
|---|---|---|
| Sentence case everywhere in digital | `[BG25 p.25, p.26, p.57, p.58, p.59]`, `[DS20 p.10]` | **High** — stated five separate times |
| No punctuation in buttons; no phone numbers in buttons; CTAs never questions | `[DS20 p.10]` | High |
| One CTA, never more than three | `[BG25 p.10]` | High |
| Brand promise punctuation (comma in copy, periods + ® in graphics) | `[BG25 p.6, p.28]` | High |
| Active voice; AP style, AMA for medical | `[BG25 p.11]` | High |

## Escalation

**corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`.
