# Source conflicts and open gaps

> [!IMPORTANT]
> Resolution rule throughout this plugin: **prefer the 2025 Brand Guide** `[BG25]`. Every known
> conflict is listed here; do not resolve one silently in code.

---

## 1. Conflicts

| # | Topic | 2025 Brand Guide | Older source | Resolution |
|---|---|---|---|---|
| 1 | **Sky blue for digital** | `#00A8E1` is the primary sky and the explicit default button color `[p.57]` | `[DS20 p.7]` defines `#269BCB` as the WCAG-compliant digital sky; `[DPL]` ships `#269BCB` on every button | **Unresolved by the sources.** BG25 does not acknowledge the digital palette; DS20 does not claim to override BG25 (it calls itself "complimentary"). `theme.css` defaults to `#00A8E1` and offers `.patterson-a11y` for `#269BCB`. **Escalate to Corporate Marketing.** |
| 2 | **Titles: caps or sentence case** | Sentence case everywhere in digital; titles *may* be all caps in print `[p.25]`; a whole page argues for sentence case `[p.26]` | 2022 guide: "Titles should be all caps"; the vendor guide sets all its own headings in caps | **2025 wins.** Sentence case is the default; all-caps is the exception. |
| 3 | **Purple hex** | `#522E91` (PMS 7679) `[p.24]` | `[DS20 p.8]` and `[DPL]` use `#512E91`; `[PCOM]` uses `#522E91` | **2025 wins** (`#522E91`). The one-digit difference is almost certainly a transcription slip. Both recorded. |
| 4 | **Green** | Tertiary green `#7BC24D` (PMS 369) `[p.24]` | `[DS20 p.8]` accent green `#0CA50F`; `[DPL]` uses `#0CA50F` for success | Different colors for different purposes. `#7BC24D` = brand/infographic green; `#0CA50F` = digital accent + success state. **Keep both; do not merge.** |
| 5 | **Teal** | Tertiary teal `#00817D` (PMS 7718) `[p.24]` | `[DS20 p.8]` accent teal `#008E8B` | Same pattern as #4. `#00817D` is the brand value and the shipped eyebrow color; `#008E8B` is the on-dark accent. |
| 6 | **Button height** | 46px `[p.57]` | `[DPL]` `min-height: 45px` | Design to **46px**; existing code is 45px. Flagged for engineering. |
| 7 | **Co-brand partner logo size** | "proportionally slightly smaller" `[p.18]` | 2022 vendor guide: "25% smaller" | 2025 wins as a direction; 25% remains the only numeric guidance. |
| 8 | **Secondary logo shape** | Handshake and serif type centred within a **square**; may bleed **or float** `[p.13, p.16]` | 2022 vendor guide: the **wave-topped box**, base bleeds off the bottom | **2025 wins.** The square is now primary and floating is permitted. |
| 9 | **Primary logo placement** | "lower right corner **or upper left**" `[p.15]` | 2022 vendor guide: lower right only | 2025 broadens it. |
| 10 | **Trademark symbol** | **®** as of 2023 `[p.28]` | Some 2019-era sample artwork still shows ™ | Use **®**. Artwork with ™ is legacy. |
| 11 | **Brand promise punctuation** | Designed form "Trusted Expertise. Unrivaled Support.®" (periods, ®); in running copy "Trusted Expertise, Unrivaled Support" (comma, **no ®**) `[p.6]` | — | Not a conflict, but the most common mistake. |
| 12 | **Body line height** | 125–150% of size `[p.27]` | `[DPL]` ships 1.5 | Consistent; 1.5 sits at the top of the published range. |

The three colors at the centre of conflicts #1, #3 and #5:

![](https://img.shields.io/badge/-00A8E1-00A8E1) `#00A8E1` vs
![](https://img.shields.io/badge/-269BCB-269BCB) `#269BCB` ·
![](https://img.shields.io/badge/-522E91-522E91) `#522E91` vs
![](https://img.shields.io/badge/-512E91-512E91) `#512E91` ·
![](https://img.shields.io/badge/-00817D-00817D) `#00817D` vs
![](https://img.shields.io/badge/-008E8B-008E8B) `#008E8B`

## 2. Gaps — every `[TBD]`

> [!NOTE]
> A `[TBD]` is working as designed. It records where Patterson has published nothing, so that nothing
> gets manufactured to fill the silence.

1. `[TBD: tint step percentages are not labelled in BG25 p.24.]` The 75/50/25 ramp was recovered by
   sampling the printed swatches.
2. `[TBD: no spacing scale is published in any Patterson source.]` The 5px grid is inferred from the
   production pattern library.
3. `[TBD: no elevation/shadow scale is published.]` The only documented shadow is
   `box-shadow: inset 2px 2px 3px #E8E8E88F` on text inputs `[DPL]`. `theme.css` deliberately does not
   define a shadow scale rather than invent one.
4. `[TBD: no motion/easing tokens are published.]` The only documented transition is
   `background-color .3s ease-out, color .3s ease-out` on `.button` `[DPL]`.
5. `[TBD: no status/semantic colors appear in BG25.]` Status values come from the production DPL.
6. `[TBD: no on-dark error color is published.]` The dark variant reuses `#D0021B`, which is low
   contrast on navy.
7. `[TBD: "Proxima Heavy" (BG25 p.60) is not defined in the typography section.]`
8. `[TBD: WCAG conformance target and version.]` DS20 says WCAG 2.0; BG25 says only "ADA standards".
9. `[TBD: ImageSpecs_042120.pdf pixel-dimension labels.]` That PDF is image-only; small wireframe
   dimension labels did not OCR reliably.
10. `[TBD: icon library contents.]` "Over 300 different icons" `[BG25 p.41]` live on SharePoint.
11. `[TBD: dark-mode surface ramp.]` Patterson publishes an on-navy accent system, not a dark theme.
12. `[TBD: canonical SharePoint location of the Brand Guide 2025 itself.]`
13. `[TBD: whether Patterson's Adobe Fonts licence permits self-hosting.]`
14. `[TBD: whether a DPL release newer than v5.7.2 exists.]`
15. `[TBD: current owners of the design system.]` The named UX contacts are from an April 2020 deck.

Escalation address for all of the above: **corporatemarketing@pattersoncompanies.com**
`[BG25 p.47, p.51]`.

## 3. Resolved

> [!NOTE]
> A gap moves here only when it was closed by **evidence**, not by assumption. The evidence and the
> method are recorded so the finding can be re-checked.

### R1. Proxima Nova Semibold (600) and Extrabold (800) weight coverage

**Formerly gap #8**, and formerly stated throughout this plugin as an unresolved licensing blocker
requiring someone to "fix the kit with Adobe."

| | Verdict |
|---|---|
| **Was recorded as** | The licensed Adobe Fonts kit serves only 400/700/italic, so the Semibold 600 subheads and Extrabold 800 headlines `[BG25 p.25, p.27]` cannot render. Blocked on Adobe. |
| **Actually true of** | Kit **`rul6mjk` only.** |
| **Resolution** | Kit **`uth1qfm`** — already in evidence, already cited in this plugin as the DPL's kit — serves the **complete range**. The fix is a **kit swap**, not an Adobe negotiation. |

Verified 2026-08-11 by fetching both stylesheets and counting `@font-face` blocks and their
`font-weight` values:

| Kit | Faces | Weights served | Last published |
|---|---|---|---|
| `rul6mjk` | 4 | 400, 400i, 700, 700i | 2024-08-01 |
| **`uth1qfm`** | **10** | **400, 400i, 500, 500i, 600, 600i, 700, 700i, 800, 800i** | 2019-03-05 |

Both kits are live and currently serving. All plugin guidance now names `uth1qfm`.

> [!WARNING]
> **Resolved pending account-owner sign-off — do not treat as fully closed.** `uth1qfm` was last
> published **2019-03-05**, *older* than `rul6mjk` (2024-08-01), yet carries more weights. The
> weights being served is evidence the kit is **live**; it is not proof the kit is **sanctioned**.
> Whoever owns Patterson's Adobe Fonts account must confirm `uth1qfm` is an active, correctly-licensed
> Patterson kit rather than a legacy one, and say whether `rul6mjk` can be retired. Tracked as
> `[TBD]` in `typography.md` §2 until then.

The **no-self-hosting rule is unaffected** and still stands: Adobe's terms forbid re-hosting Typekit
payloads. Reference the kit; ship no font binaries and no `@font-face`. Open gap #13 above (whether
the licence permits self-hosting) is a separate question and remains open.
