# Sources — Monitoring & Alerting

Every factual claim in this skill traces to a single ServiceNow knowledge base article. Nothing here
was inferred, extrapolated, or carried over from another organisation's practice.

---

## Primary source

| Field | Value |
|---|---|
| System | ServiceNow — `patterson.service-now.com` |
| Knowledge base | IT Standards & Guidelines |
| Article | **Monitoring & Alerting** |
| `sys_kb_id` | `972394c02b80835ce9affd3fc891bf04` |
| URL | <https://patterson.service-now.com/esc?id=kb_article_view&sys_kb_id=972394c02b80835ce9affd3fc891bf04> |
| Owner | Infra CloudOps |
| Retrieved | 2026-08-11 |

> [!IMPORTANT]
> Where the standard is silent, the text says `[TBD: not specified in the Monitoring & Alerting standard]` rather than
> filling the gap.

## Provenance rules for maintainers

1. Do not add a requirement to this skill unless it appears in the article above.
2. When the article changes, update `references/` first, then trim [`SKILL.md`](SKILL.md) back to
   the decision rules an agent needs immediately.
3. Every `[TBD]` marker in this skill is a real gap in the source article. Resolve it by getting
   the standard amended, not by writing a plausible answer here.
4. Validator scripts under `scripts/` must only enforce rules that are quoted in `references/`.
   A rule with no citation is a bug.
