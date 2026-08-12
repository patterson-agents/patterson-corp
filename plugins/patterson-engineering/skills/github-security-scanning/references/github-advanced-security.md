# GitHub Advanced Security at Patterson

What GHAS provides, what evidence there is that Patterson licenses it, and what remains a
server-side setting that no file in the repository can record.

---

## Licensing evidence

Patterson holds a GitHub Advanced Security licence. The evidence available to this skill is a GHAS
**active-committers export**, downloaded from the GitHub organisation's billing settings:

```
downloads/patterson/ghas_active_committers_techdays-ai_patterson-cli_2026-07-31T0213.csv
```

> [!IMPORTANT]
> That path is cited as **evidence that the export exists**, and nothing more. The file lists named
> committers against repositories. Do not open it, quote it, summarise it, or copy any row of it
> into a skill, a reference file, a commit message or a pull request. GitHub only produces an
> active-committers report for an organisation that has GHAS enabled, so the existence of the
> export is the whole of the claim being made here.

`[TBD: this skill has no source stating which Patterson GitHub organisations or repositories the
licence covers, how many seats are purchased, or whether GHAS is enabled by default on new
repositories. Confirm with the GitHub org owners before assuming a given repository is covered.]`

## What GHAS provides

| Capability | What it does | Configured by |
|---|---|---|
| Code scanning (CodeQL) | Static analysis of source, results in the Security tab and on PRs | A workflow file: `.github/workflows/codeql.yml` |
| Secret scanning | Detects committed credentials against a partner pattern set | Repository setting (server-side) |
| Push protection | Blocks a push that introduces a detected credential | Repository setting (server-side) |
| Secret scanning exclusions | Suppresses alerts for listed paths | A file: `.github/secret_scanning.yml` |
| Dependency review | Flags vulnerable dependencies introduced by a PR | An action in a workflow |

Dependabot alerts and Dependabot version updates are **not** part of GHAS — they are available on
every repository — but they belong in the same setup pass, so this skill ships the template.

## Files versus settings

This is the distinction that decides what the auditor can and cannot check.

| Control | Lives in | Auditable from files? |
|---|---|---|
| Code scanning workflow | `.github/workflows/codeql.yml` | Yes |
| Dependabot configuration | `.github/dependabot.yml` | Yes |
| Secret scanning exclusions | `.github/secret_scanning.yml` | Yes |
| Security policy | `SECURITY.md` | Yes |
| Secret scanning enabled | Repository settings | **No** |
| Push protection enabled | Repository settings | **No** |
| GHAS enabled for the repo | Repository / org settings | **No** |
| Whether CodeQL analysed any files | Workflow run logs | **No** |

[`../scripts/check-security-config.ts`](../scripts/check-security-config.ts) emits
`WARN|.|0|push-protection/unverifiable|...` on every run to keep the bottom half of that table
visible. A clean audit means the four file-backed controls are in place. It does not mean the
repository is hardened.

## Enabling the server-side settings

Documentation only. Nothing in this skill executes it.

```bash
gh api -X PATCH repos/<org>/<repo> \
  -f security_and_analysis[secret_scanning][status]=enabled \
  -f security_and_analysis[secret_scanning][push_protection][status]=enabled
```

> [!WARNING]
> **Merge `.github/secret_scanning.yml` first.** See
> [`secret-scanning-and-push-protection.md`](secret-scanning-and-push-protection.md) for why the
> ordering is not optional.

Running this requires admin on the target repository, and it mutates a remote. Confirm the `<org>`
and `<repo>` before pasting: the command names the repository explicitly and there is no dry-run.
