---
name: presentation-templates
description: Building Patterson-branded PowerPoint decks, Word documents and other OfficeSuite deliverables - Arial substitution, sentence case, chart and infographic colors, slide structure, image sizing, and where the official templates live. Use when creating or reviewing a Patterson deck or document, asking "make me a Patterson PowerPoint", "what template do we use", "what colors for this chart", "how should the title slide look", or preparing an internal presentation.
---

# Patterson presentations and documents

The official `.potx` / `.pptx` / `.dotx` templates are **not committed here**. They are large binaries
and they live on SharePoint, where they are versioned and governed by Corporate Marketing. This skill
tells you the rules; `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/REFERENCES.md` tells you
where to get the file.

---

> [!IMPORTANT]
> **Always start from the official template if one is available.** Only build from scratch if the user
> has confirmed they cannot access it, and say so explicitly when you do.

`[TBD: the exact SharePoint path of the Patterson PowerPoint template is not recorded in any extracted
source. Brand Guide 2025 p.50 covers "PowerPoint best practices" and links to the asset pages, but the
template's own URL was not recoverable. Start at the Corporate Branding hub in
`${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/REFERENCES.md`.]`

## Typography in OfficeSuite — Arial, not Proxima Nova

`[BG25 p.25]` designates **Arial** for Outlook, PowerPoint, Teams and SharePoint. Proxima Nova is an
Adobe Fonts web/desktop licence and is **not** installed on most Patterson machines — a deck built in
it will reflow on someone else's computer.

| Element | Face |
|---|---|
| Titles, headlines | Arial **Bold** |
| Subheads | Arial **Bold** |
| Body, bullets | Arial **Regular** |
| Extra light weight, where installed | Arial Nova Light |

> [!CAUTION]
> Never embed or attach a Proxima Nova font file to a deck. See the plugin README for the licensing
> position.

## Case — the rule people break in decks

Titles, headlines, subheads, body text and captions are **sentence case** `[BG25 p.59]`. All-caps
reads as shouting and degrades screen readers `[BG25 p.25–26]`.

> [!NOTE]
> The one deck-relevant exception: **titles and footer text may be all caps** when set in Extrabold or
> Semibold `[BG25 p.27]` — in OfficeSuite, Arial Bold. Use it for a running footer, not for slide
> headlines.

## Color

| Surface | Value | Source |
|---|---|---|
| Slide ground, content-heavy | ![](https://img.shields.io/badge/-FFFFFF-FFFFFF) white `#FFFFFF` | `[BG25 p.24]` |
| Slide ground, section dividers and emphasis | ![](https://img.shields.io/badge/-003767-003767) navy `#003767` | `[BG25 p.52]` |
| Headlines | ![](https://img.shields.io/badge/-003767-003767) navy `#003767` | `[BG25 p.24]` |
| Body text | ![](https://img.shields.io/badge/-58585B-58585B) `#58585B` | `[BG25 p.24]` |

**Charts and infographics use the tertiary palette** — `[BG25 p.24]` designates green, teal and purple
"for infographics and presentations to add depth and interest." A five-series ramp that matches the
shipped theme:

| # | Swatch | Hex |
|---|---|---|
| 1 | <img src="https://img.shields.io/badge/-003767-003767" alt="003767"> | `#003767` navy |
| 2 | <img src="https://img.shields.io/badge/-00A8E1-00A8E1" alt="00A8E1"> | `#00A8E1` sky |
| 3 | <img src="https://img.shields.io/badge/-7BC24D-7BC24D" alt="7BC24D"> | `#7BC24D` green |
| 4 | <img src="https://img.shields.io/badge/-00817D-00817D" alt="00817D"> | `#00817D` teal |
| 5 | <img src="https://img.shields.io/badge/-522E91-522E91" alt="522E91"> | `#522E91` purple |

- Tints (75/50/25) are available for shading, "if used sparingly" `[BG25 p.24]`.
- Secondary colors add depth but must not dominate `[BG25 p.24]`.

> [!WARNING]
> **Never use a color outside the palette**, especially for icons `[BG25 p.42]`.

## Logo on a deck

- Colorways: navy, sky, dark gray, black, white reverse `[BG25 p.14]`.
- Clear space in digital = **half the height of the "P"** in PATTERSON `[BG25 p.14]`.
- Placement: lower right or upper left `[BG25 p.15]`. In a narrow space, centre it.
- A square/secondary logo stays under ~20% of the width of a vertical page, ~15% of a horizontal area
  `[BG25 p.17]`.
- Never over an image, never recolored, never resized in part, never rearranged `[BG25 p.20]`.
- Co-branded deck: Patterson on the **left**, dominant; partner slightly smaller, vertical rule
  between `[BG25 p.18]`.

## Content rules that apply to decks

- **One CTA, never more than three** `[BG25 p.10]`.
- Brand promise appears **once per piece**, and only as a headline in broad whole-company decks
  `[BG25 p.6]`. Designed form takes periods and ®; running copy takes a comma and no ®.
- Ampersands are permitted in PowerPoint titles and bullets to save space — **be consistent within the
  deck** `[COPY22]`. Elsewhere, spell out *and*.
- Icons are supporting cues at 80 × 80px and must never be the main visual `[BG25 p.41]`.
- Photography follows the same rules as everywhere else: authentic, natural light, shallow depth of
  field, tone mapped to a Patterson value `[BG25 p.33]`.

## What is genuinely unknown

> [!CAUTION]
> `[BG25 p.50]` is titled "PowerPoint best practices" but its bullet content was not recoverable in
> the extraction this plugin is built from. **Do not invent slide-master names, a slide-size standard,
> or a layout inventory.** If asked for something that would require them, say the source is not
> available and point at the Corporate Branding hub.

`[TBD: PowerPoint best-practice bullets, BG25 p.50.]`
`[TBD: slide dimensions / aspect ratio standard — not published in any extracted source.]`
`[TBD: named slide layouts in the official template.]`
`[TBD: Word document / letterhead template specifications.]`

## References

| File | When |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/references/deck-construction.md` | Slide-by-slide guidance, chart specs, image sizes, review checklist |
| `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/references/office-suite.md` | Arial specification, email signatures, internal comms surfaces and their exact image sizes |
| `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/assets/deck-outline.md` | A starting outline for a standard Patterson deck |
| `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/_SOURCES.md` · `${CLAUDE_PLUGIN_ROOT}/skills/presentation-templates/REFERENCES.md` | Provenance and extraction confidence; where the official templates live |

> [!TIP]
> For palette detail use **brand-identity**; for copy mechanics use **copy-style-guide**; for tone use
> **voice-and-tone**.
