---
name: github-security-scanning
description: Installs and audits GitHub security scanning controls in a Patterson repository — CodeQL code scanning, Dependabot, secret scanning with push protection, and a security policy. Use when setting up or reviewing a repository's security configuration, enabling GitHub Advanced Security features, adding a scanning workflow, or answering which required scans a repository actually covers — and when asked "set up security scanning", "enable CodeQL", "configure Dependabot", "harden this repo", "is DAST covered", or "why is push protection blocking my push".
---

# GitHub Security Scanning

Configures the GitHub-side security controls in a repository, audits which of them are present, and
states the control coverage honestly — including where it is short.

Patterson licenses **GitHub Advanced Security**. Evidence: a GHAS active-committers export exists at
`downloads/patterson/ghas_active_committers_techdays-ai_patterson-cli_2026-07-31T0213.csv` (cited as
a path only — never open, quote or copy its contents). GitHub only produces that report for an
organisation with GHAS enabled.

Related standard: ServiceNow IT Standards & Guidelines, **CI/CD Pipeline Standards**
(`sys_kb_id=c70e79833b650f107f43b50236e45a7d`), for the required-scan list. Owner: Infra CloudOps.

---

> [!IMPORTANT]
> Do not add requirements that are not in this file or in `references/`. **No ServiceNow article
> covers GitHub security scanning** — see [`_SOURCES.md`](_SOURCES.md). Where this skill describes
> GitHub product behaviour, that is vendor behaviour, not a Patterson requirement, and it is
> labelled as such. If the standard does not cover something, say so and mark it `[TBD]`.

## Decision rules

### 1. Order of operations

1. `.github/secret_scanning.yml` — exclusions, merged to the default branch.
2. `.github/workflows/codeql.yml` — code scanning.
3. `.github/dependabot.yml` — dependency updates.
4. `.github/workflows/security.yml` — GitLeaks and Trivy.
5. `SECURITY.md` — security policy.
6. **Then** enable secret scanning and push protection server-side.

Step 1 before step 6 is not a preference. See rule 3.

### 2. GHAS is already licensed

Do not open a licensing request, and do not propose a third-party substitute for a control GHAS
already provides. Code scanning, secret scanning and push protection are available; what varies is
whether a given repository has them **enabled**, which is a server-side setting no file records.

`[TBD: no source states which Patterson organisations or repositories the licence covers. Confirm
with the GitHub org owners before assuming a repository is in scope.]`

### 3. Exclusions before push protection

> [!WARNING]
> **Add and merge `.github/secret_scanning.yml` excluding `plugins/patterson-engineering/hooks/tests/`
> BEFORE enabling push protection.**
>
> Those fixtures hold deliberately synthetic AWS keys and connection strings — they are the inputs
> that prove the PreToolUse guard detects credentials. Push protection cannot tell a fixture from a
> live key. Enabled first, it blocks your next push on your own test data, and the exclusion file
> that would fix it cannot be pushed either.

The enablement command, **documentation only — nothing in this skill executes it**:

```bash
gh api -X PATCH repos/<org>/<repo> \
  -f security_and_analysis[secret_scanning][status]=enabled \
  -f security_and_analysis[secret_scanning][push_protection][status]=enabled
```

Requires admin on the target repository. It names the repository positionally and has no dry-run;
check `<org>/<repo>` before running it.

### 4. CodeQL: verify the count, not the colour

The `.ts` files here have **no `package.json` and no `tsconfig.json`**, by design. The
`javascript-typescript` extractor can complete successfully having analysed **zero files**, and the
workflow still reports success.

> [!IMPORTANT]
> On the first run, open the `Analyze (javascript-typescript)` job log and read the **"files
> analysed"** count. If it is `0`, or far below the number of `.ts` files in the repository, code
> scanning is green and covering nothing. A green check is not evidence of analysis.

Use `languages: javascript-typescript` (one extractor, both languages) and `build-mode: none`.

### 5. Dependabot: `github-actions` only

Declare the `github-actions` ecosystem and nothing else. There is no npm ecosystem in these
repositories to read. Declaring one anyway produces a Dependabot error on every scheduled run, which
trains reviewers to ignore the Dependabot tab. Add an ecosystem when its manifest actually lands.

Pinned action versions are the real third-party dependency surface here, so this is not a token
configuration.

### 6. Control coverage — DAST is open

| Required check | Patterson tools | Covered? |
|---|---|---|
| SAST | CodeQL, Checkmarx | yes |
| SCA | Dependabot, Trivy, JFrog | yes |
| Secret scanning | GitLeaks, GitHub secret scanning | yes |
| Container / IaC | Trivy, Checkmarx | yes |
| **DAST** | **—** | **NO** |

> [!CAUTION]
> **Trivy and GitLeaks are not DAST.** Both are static: they read files, history, images and
> manifests. DAST requires exercising a **running** application — OWASP ZAP, Burp Suite, Checkmarx
> DAST. The CI/CD standard lists DAST as a required PR check, so recording a static scanner against
> that row creates a documented-but-false control that downstream audits would inherit.
>
> The row stays **OPEN**, addressed to **AppSec**. Close it by selecting a DAST tool, not by
> relabelling a scanner you already run.

`[TBD: no specific DAST tool is named in the CI/CD Pipeline Standards.]`

The standard names Checkmarx, GitLeaks and Trivy; it does **not** name CodeQL, Dependabot or GitHub
secret scanning. Listing those is a statement about what Patterson has, not a Checkmarx exemption.
Full seven-scan mapping: [`references/required-scans-mapping.md`](references/required-scans-mapping.md).

### 7. Templates are copied, not referenced

Everything in `assets/` is installed **into the target repository**. Nothing runs from where it
sits. Install map and per-template notes:
[`references/templates-usage.md`](references/templates-usage.md).

## Validator

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/scripts/check-security-config.ts" <repo-root>
```

Takes a repository root directory. Prints `LEVEL|file|line|rule|message`; paths are relative to the
audited root and `line` is `0` for a file-scope finding.

| Exit code | Meaning |
|---|---|
| `0` | No errors |
| `1` | `ERROR` findings |
| `2` | Could not evaluate |

`ERROR` sets the exit code; `WARN` and `INFO` are advisory and do not.

**What it catches:** no CodeQL analysis in any workflow (`code-scanning/missing`), including the
case where a workflow uploads SARIF without running CodeQL; a CodeQL workflow that declares no
javascript or typescript language (`code-scanning/no-language`); a missing Dependabot configuration
(`dependabot/missing`); a Dependabot configuration that does not cover the `github-actions`
ecosystem (`dependabot/no-github-actions`); an npm ecosystem declared with no `package.json` present
(`dependabot/npm-without-manifest`); a missing secret-scanning exclusion file
(`secret-scanning/missing`, escalated to ERROR when fixture directories exist); an exclusion file
with no `paths-ignore` entries while fixtures are present (`secret-scanning/no-exclusions`); a
fixture directory no entry covers (`secret-scanning/fixture-not-excluded`); a missing security policy
at any of GitHub's three accepted locations (`security-policy/missing`).

**What it does NOT catch.** It reads repository files and makes **no network call**, so it cannot
verify a single server-side setting: whether secret scanning is enabled, whether push protection is
on, whether GHAS is enabled for the repository, whether any workflow has ever run, or whether the
CodeQL extractor analysed any files. It is a regex scanner over raw lines, not a YAML parser, so it
cannot follow reusable-workflow or `template:` includes — a scan that runs in an included workflow
reads as missing — and it cannot tell whether a scan gates the pull request or merely runs. It does
not evaluate glob semantics in `paths-ignore`; coverage is a prefix match. Fixture detection is
deliberately narrow (`hooks/tests`, `tests/fixtures`), so synthetic credentials kept anywhere else
are invisible to it. It does not audit `security.yml`, because no Patterson source makes that
workflow mandatory.

Two findings appear on **every** run by design: `push-protection/unverifiable` (WARN) and
`coverage/dast-open` (INFO). Neither can be configured away — the first is a property of where the
setting lives, the second a property of the tooling stack.

> [!CAUTION]
> Treat a clean run as "the four file-backed controls are in place", not as "this repository is
> hardened".

Fixtures and a test harness: [`tests/run-tests.sh`](tests/run-tests.sh).

## Reference material

| File | Contents |
|---|---|
| [`references/required-scans-mapping.md`](references/required-scans-mapping.md) | Coverage table, the DAST gap, full seven-scan mapping |
| [`references/github-advanced-security.md`](references/github-advanced-security.md) | What GHAS provides, licensing evidence, files versus settings |
| [`references/secret-scanning-and-push-protection.md`](references/secret-scanning-and-push-protection.md) | Ordering rule, exclusion file, blocked-push recovery |
| [`references/codeql-configuration.md`](references/codeql-configuration.md) | The extractor caveat and what to read instead of the check mark |
| [`references/templates-usage.md`](references/templates-usage.md) | Install map for each `assets/` template |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |
