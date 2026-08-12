# Canonical references — brand-identity

Where the **official** version of each asset lives.

> [!IMPORTANT]
> Everything in this skill is a text extraction snapshot dated 2026-08-11 — **always check the
> canonical location before publishing.**

> [!NOTE]
> All SharePoint URLs below were harvested programmatically from the link annotations embedded in the
> *Patterson Companies Brand Guide 2025* PDF, so they are the URLs the guide itself points at. None
> were guessed.

Contact for anything not listed: **corporatemarketing@pattersoncompanies.com** `[BG25 p.47, p.51]`.

---

## Hubs

| Resource | URL |
|---|---|
| **Corporate Branding hub** — top-level entry point `[BG25 p.50]` | `https://pattersoncompanies.sharepoint.com/sites/Corporate/SitePages/Corporate-Branding.aspx` |
| **Logos** `[BG25 p.50]` | `https://pattersoncompanies.sharepoint.com/sites/Corporate/SitePages/Logos.aspx` |
| **Icons** — the 300+ icon library `[BG25 p.41, p.50]` | `https://pattersoncompanies.sharepoint.com/sites/Corporate/SitePages/Icons.aspx` |
| Corporate Materials document library | `https://pattersoncompanies.sharepoint.com/sites/Corporate/Corporate%20Materials/` |
| Legacy "old inside" document library | `https://pattersoncompanies.sharepoint.com/sites/oldinside/Corporate/Documents/` |

> `DesignSystem_042120` slide 39 adds: *"All documents can be found under the 'Corporate Branding' tab
> on the Inside Patterson SharePoint."*

## Documents

| Document | Canonical URL |
|---|---|
| **Patterson Companies Brand Guide 2025** — the authoritative source for this skill | `[TBD: no SharePoint URL for the guide appears in its own link annotations. Expected under the Corporate Branding hub above.]` |
| **2021 Model Release Form — External** (Photo and Video Model Release) `[BG25 p.35, 37, 38]` | `https://pattersoncompanies.sharepoint.com/sites/oldinside/Corporate/Documents/Forms/AllItems.aspx?id=%2Fsites%2Foldinside%2FCorporate%2FDocuments%2FPatterson%20Companies%20Release%20Forms%2F2021%20Model%20Release%20Form%20%2D%20External%2Epdf&parent=%2Fsites%2Foldinside%2FCorporate%2FDocuments%2FPatterson%20Companies%20Release%20Forms` |
| **Patterson Dental PPE Photo Requirements** `[BG25 p.36, 38]` | `https://pattersoncompanies.sharepoint.com/sites/oldinside/Corporate/Documents/Forms/AllItems.aspx?id=%2Fsites%2Foldinside%2FCorporate%2FDocuments%2FPatterson%20Dental%20PPE%20Photo%20Requirements%2Epdf&parent=%2Fsites%2Foldinside%2FCorporate%2FDocuments` |
| **AHI photo requirements (2020)** `[BG25 p.36]` | `https://pattersoncompanies.sharepoint.com/sites/oldinside/Corporate/Documents/Forms/AllItems.aspx?id=%2Fsites%2Foldinside%2FCorporate%2FDocuments%2FPatterson%20Companies%20Release%20Forms%2FAHI%20photo%20requirements%5F2020%2Epdf&parent=%2Fsites%2Foldinside%2FCorporate%2FDocuments%2FPatterson%20Companies%20Release%20Forms` |
| **Brand Promise Guide** (`PDCO_PromiseGuideUsageP_Aug2019.docx`) `[BG25 p.28]` | `https://pattersoncompanies.sharepoint.com/:w:/r/sites/CorpMarketingComm/_layouts/15/Doc.aspx?sourcedoc=%7B57E24422-12CE-43E5-A1F6-9534438C574D%7D&file=PDCO_PromiseGuideUsageP_Aug2019.docx&action=default&mobileredirect=true` |

## Production code and CDN

| Resource | URL |
|---|---|
| **Digital Pattern Library (DPL) v5.7.2** — shipped implementation of the 2020 design system | `https://cdn.cloud.pattersoncompanies.com/patternlibrary/releases/5.7.2/assets/toolkit/styles/toolkit.css` |
| DPL toolkit images (icons, unit logos) | `https://cdn.cloud.pattersoncompanies.com/patternlibrary/releases/5.7.2/assets/toolkit/images/` |
| Corporate site theme (WordPress) | `https://www.pattersoncompanies.com/wp-content/themes/patterson/build/styles/theme-styles.min.css` |
| Corporate logo SVGs | `https://www.pattersoncompanies.com/wp-content/uploads/2024/10/patterson-logo.svg` · `https://www.pattersoncompanies.com/wp-content/uploads/2024/10/pdco_brandpromise_r_2_rgb.svg` |
| Vet media gateway (icons, vendor logos) | `https://gw.pattersoncompanies.com/mediagateway/vetcontent/` |

The DPL release path is versioned. `[TBD: check for a release newer than 5.7.2 before pinning.]`

## Typography

| Resource | URL |
|---|---|
| **Adobe Fonts kit `uth1qfm`** — serves Proxima Nova to the DPL; **use this one** (400/500/600/700/800, normal + italic) | `https://use.typekit.net/uth1qfm.css` |
| Adobe Fonts kit `rul6mjk` — serves Proxima Nova to pattersoncompanies.com; superseded (400/700 only) | `https://use.typekit.net/rul6mjk.css` |
| Adobe Fonts account | `https://fonts.adobe.com/` — `[TBD: Patterson account owner unknown.]` |

> [!CAUTION]
> **Load the kit; do not ship the files.** See [`references/typography.md`](references/typography.md)
> §2 — including why `uth1qfm` is the kit to load, and the account-owner sign-off still outstanding
> on it.

## Public web properties

| Property | URL | Notes |
|---|---|---|
| Patterson Companies (corporate) | `https://www.pattersoncompanies.com` | WordPress |
| Patterson Dental | `https://www.pattersondental.com` | Kentico + DPL |
| Patterson Veterinary | `https://www.pattersonvet.com` | Kentico + DPL |
| Patterson Vet blog | `https://blog.pattersonvet.com` | |

## External specification

| Resource | URL |
|---|---|
| Google Stitch DESIGN.md standard — the format [`references/DESIGN.md`](references/DESIGN.md) conforms to | `https://stitch.withgoogle.com/docs/design-md/specification` · normative source: `https://github.com/google-labs-code/stitch-skills` (`plugins/stitch-utilities/skills/design-md/SKILL.md`) |

## Owners named in the sources

| Name / team | Role |
|---|---|
| Corporate Marketing and Communications | Owns PVV graphical treatment, the brand guide, social favicon changes, general escalation `[BG25 p.5, 41, 47, 49, 51]` |
| Corporate Communications | Owns the icon library and Patterson Priorities submissions `[BG25 p.41, 43]` |
| Legal team | Monitors the marketplace for trademark misuse `[BG25 p.6]` |
| Business unit creative teams | Design secondary email signature graphics `[BG25 p.29]` |

`[TBD: current owners of the digital design system. The named UX contacts in DesignSystem_042120 slide
40 are from April 2020 and are six years stale — verify before routing anything to them.]`
