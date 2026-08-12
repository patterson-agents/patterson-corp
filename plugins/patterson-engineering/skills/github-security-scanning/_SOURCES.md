# Sources — GitHub Security Scanning

Unlike its sibling skills, this one has **no single authoritative ServiceNow article**. That is the
first fact recorded here rather than a gap papered over. Nothing below was inferred, extrapolated,
or carried over from another organisation's practice.

---

## Primary source

| Field | Value |
|---|---|
| System | ServiceNow — `patterson.service-now.com` |
| Knowledge base | IT Standards & Guidelines |
| Article | `[TBD: not specified in the six ServiceNow KB sources]` |
| `sys_kb_id` | `[TBD: not specified in the six ServiceNow KB sources]` |
| URL | `[TBD: not specified in the six ServiceNow KB sources]` |
| Owner | `[TBD: not specified in the six ServiceNow KB sources]` |
| Retrieved | — |

None of the six known IT Standards & Guidelines articles — CI/CD Pipeline Standards, Approved
Software, Storage & Data Standards, Azure Environment Standards, Azure Compute Standards,
Monitoring & Alerting — covers GitHub security scanning, GitHub Advanced Security, CodeQL,
Dependabot, or secret scanning as a subject.

> [!IMPORTANT]
> **No `sys_kb_id` was invented for this skill.** The row above stays `[TBD]` until an article
> exists. Resolve it by getting a standard written, not by borrowing a neighbouring article's id.

## Contributing sources

These articles do not cover GitHub security scanning, but they do define requirements this skill
maps onto.

| Article | `sys_kb_id` | What it contributes |
|---|---|---|
| CI/CD Pipeline Standards | `c70e79833b650f107f43b50236e45a7d` | The seven required CI scans, including DAST as a required PR check; GitLeaks approved for secret scanning; Trivy or Checkmarx for container scanning; Checkmarx for SAST, SCA, API and IaC |
| Approved Software | `9af6a1812b6587941f16fc8bee91bf3c` | Tool approval status and owners; the "Checkmarx will replace this tool" note against Trivy |

Both resolve at
`https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=<sys_kb_id>`.
Retrieved 2026-08-11 by the `cicd-pipeline-standards` and `approved-software-check` skills; this
skill cites them rather than re-retrieving them.

## Non-ServiceNow evidence

| Claim | Evidence | Form of citation |
|---|---|---|
| Patterson licenses GitHub Advanced Security | `downloads/patterson/ghas_active_committers_techdays-ai_patterson-cli_2026-07-31T0213.csv` | **Path only.** GitHub produces an active-committers report only for an organisation with GHAS enabled, so the existence of the export is the whole claim. The file lists named committers; do not open, quote, summarise or copy any row of it. |
| The hook fixtures carry synthetic credentials | `plugins/patterson-engineering/hooks/tests/` in this repository | Directory reference. Those payloads are the inputs that prove the PreToolUse guard detects credentials. |

## Unsourced by design

Descriptions of **GitHub product behaviour** — how the CodeQL extractor handles a repository with no
package manifest, what `paths-ignore` in `.github/secret_scanning.yml` suppresses, which locations
GitHub accepts for `SECURITY.md`, what `gh api -X PATCH` toggles — are vendor behaviour, not
Patterson requirements. They are labelled as such in `references/` and must never be presented as
Patterson standards or used to justify a deviation from one.

## Provenance rules for maintainers

1. Do not add a **requirement** to this skill unless it appears in one of the contributing articles
   above. Vendor behaviour may be described; it may not be promoted to a requirement.
2. When an article changes, update `references/` first, then trim [`SKILL.md`](SKILL.md) back to
   the decision rules an agent needs immediately.
3. Every `[TBD]` marker in this skill is a real gap. Resolve it by getting the standard amended or
   written, not by writing a plausible answer here.
4. Validator scripts under `scripts/` must only enforce rules that are quoted in `references/`.
   A rule with no citation is a bug. `scripts/check-security-config.ts` deliberately does **not**
   audit `assets/security.yml`, because no source makes that workflow mandatory.
5. The DAST row stays open. Closing it requires a named DAST tool wired against a running
   application — not a re-reading of a static scanner already in the stack.
6. The GHAS export is cited by path and never by content. A future maintainer who needs seat counts
   or repository scope should re-export from GitHub billing, not quote this file.
