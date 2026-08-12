---
name: approved-software-check
description: Checks developer and observability tooling against the Patterson Approved Software list and reports approved, approval-required or unknown with the owning team. Use before adding a dependency, a CI action, a scanner, an APM agent or a SaaS integration — and when asked "can I use Snyk", "is Trivy approved", "do I need approval for Dynatrace", "what do we use for secret scanning", "can I make this repo public" or "who owns Checkmarx".
---

# Approved Software

Developer and observability tooling, checked against the Patterson Approved Software list.

Authoritative source: ServiceNow IT Standards & Guidelines, **Approved Software**
(`sys_kb_id=9af6a1812b6587941f16fc8bee91bf3c`). Owner: Infra CloudOps.
Scope as summarised here: **developer and observability tooling**.

---

> [!IMPORTANT]
> Do not add tools to this list. If a tool is not below, the answer is "not listed — request
> review", never "probably fine".

## Approved — no approval needed

| Tool | Owner | Conditions |
|---|---|---|
| **GitHub** | Infra CloudOps | **Enterprise managed org only.** **Public repos require approval.** |
| **Terraform** | Infra CloudOps | **Approved modules only.** |
| **Trivy** | AppSec | Container security. The standard notes: *"Checkmarx will replace this tool."* |
| **GitLeaks** | AppSec | Secret scanning. |

## Approved — approval REQUIRED

| Tool | Owner | Purpose |
|---|---|---|
| **Azure DevOps** | Infra CloudOps | Source control and pipelines |
| **Visual Studio** | `[TBD]` | **Professional** for non-Principal; **Enterprise** for Principal and above |
| **Lucid Suite** | `[TBD]` | Diagramming |
| **LaunchDarkly** | `[TBD]` | Feature flags |
| **Tonic** | `[TBD]` | Data de-identification |
| **JFrog** | AppSec | 3rd-party package security |
| **Checkmarx** | AppSec | SAST, SCA, API and IaC scanning |
| **Qualys** | AppSec | Vulnerability scanning |
| **Dynatrace** | Infra CloudOps | APM |
| **PagerDuty** | Infra CloudOps | Alerting and on-call |
| **Azure App Insights** | Infra CloudOps | Application telemetry |
| **Confluence** | `[TBD]` | Documentation |
| **SnagIT** | `[TBD]` | Screen capture |

## Approved, no approval needed, but costs money

| Tool | Owner | Note |
|---|---|---|
| **Log Analytics Workspace** | Infra CloudOps | No approval required, but it **has a cost**. |

## Ownership

The standard states: **AppSec owns the security tools; Infra CloudOps owns source control,
Terraform, and observability.** Owners above are assigned from that sentence. Tools falling into
neither category are marked `[TBD: owner not specified in the Approved Software standard]`.

## Decision rules

1. Is the tool in one of the three tables? If not → **not listed. Request review.** Say so plainly;
   do not reason by analogy from a similar approved tool.
2. If approved with no approval needed → check the conditions column. GitHub's public-repo caveat
   and Terraform's approved-modules caveat are real constraints, not footnotes.
3. If approval required → name the **owner** so the requester knows who to ask.
4. Never present an unapproved alternative as equivalent. Snyk is not "basically Checkmarx"; Grype
   is not "basically Trivy". They are not on the list.

### Frequent substitutions to reject

| Someone proposes | Approved equivalent |
|---|---|
| Snyk, Dependabot-as-the-SCA, OWASP Dependency-Check | **Checkmarx** (SCA) |
| SonarQube, Semgrep, CodeQL | **Checkmarx** (SAST) |
| Grype, Clair, Anchore | **Trivy** or **Checkmarx** (container scanning) |
| TruffleHog, detect-secrets | **GitLeaks** (secret scanning) |
| Checkov, tfsec, Terrascan | **Checkmarx** (IaC scanning) |
| Datadog, New Relic | **Dynatrace** (APM) |
| Opsgenie, VictorOps | **PagerDuty** |

> [!WARNING]
> This mapping is *inference from purpose*, not text from the standard — the standard does not list
> rejected tools. Present it as "the approved tool for this purpose is X", not as "the standard
> prohibits Y".

## Validator

```bash
# Look up one tool
node "${CLAUDE_PLUGIN_ROOT}/skills/approved-software-check/scripts/check-tooling.ts" trivy

# Scan a repo, manifest, lockfile, CI file or Dockerfile
node "${CLAUDE_PLUGIN_ROOT}/skills/approved-software-check/scripts/check-tooling.ts" ./
```

Prints `LEVEL|file|line|rule|message`.

| Level | Meaning |
|---|---|
| `OK` | Approved |
| `WARN` | Approved, but approval required |
| `ERROR` | Not listed |

| Exit code | Meaning |
|---|---|
| `0` | No `ERROR` findings |
| `1` | `ERROR` findings |
| `2` | Could not evaluate |

**What it catches:** the tools in the three tables above, by name and by common alias
(`aquasecurity/trivy-action`, `hashicorp/terraform`, `kics`, `oneagent`, `artifactory`, …), plus a
curated list of frequently-seen tools that are *not* on the standard, which it names explicitly
rather than reporting as generic unknowns.

**What it does NOT catch.** It is a substring and word-boundary matcher over text files, so: it does
not resolve transitive dependencies — a package that pulls in an unapproved scanner is invisible; it
does not read binary lockfiles or private registries; it cannot tell whether a tool that requires
approval **has actually been approved** for your team, so a `WARN` means "confirm the approval
exists", not "you are blocked"; it cannot tell whether GitHub is being used in the enterprise
managed org, whether a repository is public, or whether a Terraform module is an approved one; and
an unlisted tool mentioned only in a comment or a README will still be reported.

> [!CAUTION]
> Treat `ERROR` findings as prompts to check, not as automatic rejections.

Fixtures and a test harness: [`tests/run-tests.sh`](tests/run-tests.sh).

## Reference material

| File | Contents |
|---|---|
| [`references/approved-tools.md`](references/approved-tools.md) | The full list with conditions and owners |
| [`references/ownership-and-approval.md`](references/ownership-and-approval.md) | Who owns what, how to request approval |
| [`_SOURCES.md`](_SOURCES.md) · [`REFERENCES.md`](REFERENCES.md) | Provenance and KB links |
