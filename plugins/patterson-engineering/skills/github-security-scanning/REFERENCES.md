# References — GitHub Security Scanning

Canonical locations for everything this skill asserts.

---

## Authoritative standard

**None.** No ServiceNow IT Standards & Guidelines article covers GitHub security scanning.

`[TBD: not specified in the six ServiceNow KB sources]`

The nearest standard is **CI/CD Pipeline Standards** (owner: Infra CloudOps), which defines the
seven required CI scans this skill maps onto but names no GitHub-side control:

<https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=c70e79833b650f107f43b50236e45a7d>

## Related Patterson standards

| Standard | `sys_kb_id` |
|---|---|
| GitHub Security Scanning | `[TBD: no article exists]` |
| CI/CD Pipeline Standards | `c70e79833b650f107f43b50236e45a7d` |
| Approved Software | `9af6a1812b6587941f16fc8bee91bf3c` |
| Storage & Data Standards | `fdc09a4d93548f908037f8bd1dba10ed` |
| Azure Environment Standards | `a507920d2b25c7941f16fc8bee91bfc4` |
| Azure Compute Standards | `937eb90b3b650f107f43b50236e45a16` |
| Monitoring & Alerting | `972394c02b80835ce9affd3fc891bf04` |

All rows with a `sys_kb_id` resolve at
`https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=<sys_kb_id>`.

## Related skills

| Skill | Why it is relevant here |
|---|---|
| `cicd-pipeline-standards` | Defines the seven required CI scans, the 2-approver PR policy, and the required PR checks this skill's coverage table reports against |
| `approved-software-check` | Approval status and owner for GitLeaks, Trivy, Checkmarx and JFrog |
| `azure-compute-standards` | Approved base images, which are a separate CI requirement from container scanning |

## Non-ServiceNow evidence

**GHAS licensing** — a GitHub Advanced Security active-committers export exists at
`downloads/patterson/ghas_active_committers_techdays-ai_patterson-cli_2026-07-31T0213.csv`.

> [!CAUTION]
> Cited as a **path only**. The export lists named committers against repositories. Do not open,
> quote, summarise, or copy any row of it into a skill, a reference file, a commit message, or a
> pull request.

## Local reference files

Detailed rationale lives in `references/` next to this file.

| File | Contents |
|---|---|
| `references/required-scans-mapping.md` | Coverage table, the DAST gap, full seven-scan mapping |
| `references/github-advanced-security.md` | What GHAS provides, licensing evidence, files versus settings |
| `references/secret-scanning-and-push-protection.md` | Ordering rule, exclusion file, blocked-push recovery |
| `references/codeql-configuration.md` | The extractor caveat on manifest-less repositories |
| `references/templates-usage.md` | Install map for each `assets/` template |

> [!TIP]
> [`SKILL.md`](SKILL.md) carries only the decision rules. Load a reference file when you need the
> full rationale in order to cite it — particularly before telling anyone that DAST is covered.
