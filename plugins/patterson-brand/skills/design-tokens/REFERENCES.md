# Canonical references — design-tokens

> [!IMPORTANT]
> Everything in this skill is a text extraction snapshot dated 2026-08-11. Check the canonical
> location before publishing anything derived from it.

Contact: **corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`.

---

## Brand documents (SharePoint)

| Resource | URL |
|---|---|
| **Corporate Branding hub** `[BG25 p.50]` | `https://pattersoncompanies.sharepoint.com/sites/Corporate/SitePages/Corporate-Branding.aspx` |
| Corporate Materials document library | `https://pattersoncompanies.sharepoint.com/sites/Corporate/Corporate%20Materials/` |
| Legacy "old inside" document library | `https://pattersoncompanies.sharepoint.com/sites/oldinside/Corporate/Documents/` |
| **Patterson Companies Brand Guide 2025** — the authoritative source for the palette (p.24), typography (p.25–27) and button spec (p.57) | `[TBD: no SharePoint URL appears in the guide's own link annotations. Expected under the Corporate Branding hub.]` |
| **DesignSystem_042120** — source of the WCAG-adjusted digital palette | Listed by its own slide 39 as living under the "Corporate Branding" tab on Inside Patterson. `[TBD: no direct URL.]` |
| **ImageSpecs_042120** — image and icon export specs | `[TBD: no direct URL; same Corporate Branding tab.]` |

## Production implementations (live values)

| Resource | URL |
|---|---|
| **Digital Pattern Library (DPL) v5.7.2** `toolkit.css` — the shipped implementation these tokens corroborate against | `https://cdn.cloud.pattersoncompanies.com/patternlibrary/releases/5.7.2/assets/toolkit/styles/toolkit.css` |
| DPL toolkit images | `https://cdn.cloud.pattersoncompanies.com/patternlibrary/releases/5.7.2/assets/toolkit/images/` |
| pattersoncompanies.com theme (independent confirmation of the palette) | `https://www.pattersoncompanies.com/wp-content/themes/patterson/build/styles/theme-styles.min.css` |

The DPL release path is versioned. `[TBD: verify whether a release newer than 5.7.2 exists before
pinning to it.]`

## Fonts — reference the kit, never ship the file

| Resource | URL |
|---|---|
| **Adobe Fonts kit `uth1qfm`** (DPL) — **use this one**, 10 faces: 400/500/600/700/800 × normal+italic | `https://use.typekit.net/uth1qfm.css` |
| Adobe Fonts kit `rul6mjk` (pattersoncompanies.com) — superseded, 4 faces: 400/700 × normal+italic only | `https://use.typekit.net/rul6mjk.css` |
| Adobe Fonts | `https://fonts.adobe.com/` — `[TBD: Patterson account owner unknown.]` |

> [!CAUTION]
> **Reference the kit; never ship the binaries.** Adobe's terms forbid re-hosting Typekit payloads —
> no font files, no `@font-face`. `[TBD: whether the Patterson licence permits self-hosting.]`

> [!NOTE]
> **Weight coverage is resolved.** `uth1qfm` serves Semibold (600) and Extrabold (800); only `rul6mjk`
> lacks them. Verified 2026-08-11 by counting `@font-face` blocks in both stylesheets. The fix is a
> kit swap, not an Adobe negotiation. `[TBD: confirmation from the Adobe Fonts account owner that
> uth1qfm is an active, sanctioned Patterson kit and not a legacy one — it was last published
> 2019-03-05, older than rul6mjk (2024-08-01), so its serving weights show it is live, not approved.]`

## External specifications

| Spec | URL |
|---|---|
| W3C Design Tokens Community Group format (the format of `tokens.json`) | `https://tr.designtokens.org/format/` |
| Tailwind CSS v4 CSS-first configuration (`@theme`) | `https://tailwindcss.com/docs/theme` |
| shadcn/ui theming variables (the semantic contract in `:root`) | `https://ui.shadcn.com/docs/theming` |
| WCAG 2.0 — the standard `[DS20 p.7]` cites | `https://www.w3.org/TR/WCAG20/` |

## Reproducing this skill's artifacts

```bash
node scripts/build-theme.ts        # tokens.json -> assets/theme.css
./scripts/verify-theme.sh          # byte-compare; exit 1 on drift
```

> [!NOTE]
> No network access, no dependencies — Node 22.18+ builtins only.
