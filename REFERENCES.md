# References — patterson-corp

Authoritative sources for what this repository's plugins assert. This file is an **index**,
not a duplicate — the full clause text, `sys_kb_id` citations, and confidence notes live beside
each skill in its own `REFERENCES.md` and `_SOURCES.md`. Follow the links below rather than
copying URLs out of this file.

> [!IMPORTANT]
> Where a source is silent, the gap is recorded as `[TBD: what is missing]` rather than filled.
> See `CONTRIBUTING.md` for the policy and `grep -rn '\[TBD' plugins/` to list every open item.

## Engineering standards — ServiceNow IT Standards & Guidelines

Owner: Infra CloudOps. Every row with a `sys_kb_id` resolves at
`https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=<sys_kb_id>`.

| Standard | `sys_kb_id` | Skill |
|---|---|---|
| CI/CD Pipeline Standards | `c70e79833b650f107f43b50236e45a7d` | [`cicd-pipeline-standards`](plugins/patterson-engineering/skills/cicd-pipeline-standards/REFERENCES.md) |
| Approved Software | `9af6a1812b6587941f16fc8bee91bf3c` | [`approved-software-check`](plugins/patterson-engineering/skills/approved-software-check/REFERENCES.md) |
| Storage & Data Standards | `fdc09a4d93548f908037f8bd1dba10ed` | [`storage-data-standards`](plugins/patterson-engineering/skills/storage-data-standards/REFERENCES.md) |
| Azure Environment Standards | `a507920d2b25c7941f16fc8bee91bfc4` | [`azure-environment-standards`](plugins/patterson-engineering/skills/azure-environment-standards/REFERENCES.md) |
| Azure Compute Standards | `937eb90b3b650f107f43b50236e45a16` | [`azure-compute-standards`](plugins/patterson-engineering/skills/azure-compute-standards/REFERENCES.md) |
| Monitoring & Alerting | `972394c02b80835ce9affd3fc891bf04` | [`monitoring-alerting-standards`](plugins/patterson-engineering/skills/monitoring-alerting-standards/REFERENCES.md) |
| GitHub Security Scanning | `[TBD: no ServiceNow article exists]` | [`github-security-scanning`](plugins/patterson-engineering/skills/github-security-scanning/REFERENCES.md) |

## Brand — Patterson Companies Brand Guide 2025

The Brand Guide 2025 (`BG25`) is the authoritative source for `patterson-brand`. Each skill's
`REFERENCES.md` cites the specific `BG25` page numbers behind its assertions, plus the
SharePoint hubs, the Digital Pattern Library CDN, and the Adobe Fonts kit that carry the guide
into production.

| Skill | What it covers | Canonical references |
|---|---|---|
| `brand-identity` | Logos, icon library, photography, release forms | [`REFERENCES.md`](plugins/patterson-brand/skills/brand-identity/REFERENCES.md) |
| `design-tokens` | Color, type, and spacing tokens; the Tailwind v4 theme generator | [`REFERENCES.md`](plugins/patterson-brand/skills/design-tokens/REFERENCES.md) |
| `copy-style-guide` | Editorial mechanics — punctuation, capitalization, terminology | [`REFERENCES.md`](plugins/patterson-brand/skills/copy-style-guide/REFERENCES.md) |
| `voice-and-tone` | Sub-brand voice, published social examples | [`REFERENCES.md`](plugins/patterson-brand/skills/voice-and-tone/REFERENCES.md) |
| `presentation-templates` | Slide and deck templates | [`REFERENCES.md`](plugins/patterson-brand/skills/presentation-templates/REFERENCES.md) |

> [!CAUTION]
> Proxima Nova is licensed through Adobe Fonts. Load the CDN kit (`uth1qfm`, per
> `brand-identity/REFERENCES.md`) — never vendor font binaries into this repository or any
> plugin that depends on it.

## Vendor and platform documentation

Point-in-time captures of the agent-platform surfaces this repository targets — Claude Code,
GitHub Copilot, VS Code, and the open specs they implement — live in a sibling repository, not
here, so that a capture date never silently drifts against this repository's own history.

| Resource | Location |
|---|---|
| Vendor documentation captures, open specs, and assessments | [`patterson-agents/patterson-platform-docs`](https://github.com/patterson-agents/patterson-platform-docs) |
| Dual-manifest pattern (how one source tree serves Claude, Copilot, and VS Code) | [`references/assessments/dual-manifest-pattern.md`](https://github.com/patterson-agents/patterson-platform-docs/blob/main/references/assessments/dual-manifest-pattern.md) |
| This repository's own architecture decisions | [`docs/decisions/`](docs/decisions/) |

## Project-level documents

| Document | Location |
|---|---|
| Charter and scope | [`PROJECT-CHARTER.md`](../PROJECT-CHARTER.md) — outside this repository, at the `patterson-agents` workspace root. `[TBD: canonical published home once the workspace root is itself versioned or the charter is mirrored into a repo.]` |

## Per-skill provenance convention

Every skill under `plugins/*/skills/<name>/` carries exactly two provenance files, and this
index defers to them:

| File | Purpose |
|---|---|
| `_SOURCES.md` | Where the skill's content came from, with a confidence note per source |
| `REFERENCES.md` | Canonical, authoritative locations — the URLs to check before publishing anything the skill asserts |

A skill missing either file is incomplete, per `CONTRIBUTING.md`.
