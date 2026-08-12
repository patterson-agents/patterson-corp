# CodeQL on a repository with no package manifest

Why a green check is not evidence that anything was analysed, and what to read instead.

---

## The caveat

Patterson agent-configuration repositories carry `.ts` files with **no `package.json` and no
`tsconfig.json`**, by design: the scripts are zero-dependency TypeScript run directly under Node's
native type stripping, so there is nothing to install and nothing to configure.

CodeQL's `javascript-typescript` extractor is built for repositories that have a manifest. Without
one it falls back to file discovery, and it can complete **successfully having analysed zero
files**. The workflow reports success. The Security tab shows no alerts. Both are consistent with
"the analysis found nothing" and with "the analysis looked at nothing", and the check mark does not
distinguish them.

> [!IMPORTANT]
> On the first CodeQL run against a repository, open the `Analyze (javascript-typescript)` job log
> and read the extractor summary reporting how many **files analysed**. Compare it against the
> number of `.ts` files in the repository. If the count is `0`, or far below, code scanning is
> green and covering nothing.
>
> Repeat this check after any change to `paths`, `paths-ignore`, or the repository layout.

## Configuration that matters here

| Setting | Value | Why |
|---|---|---|
| `languages` | `javascript-typescript` | One extractor covers both. `javascript` and `typescript` are not separate valid values. |
| `build-mode` | `none` | Correct for a repository with no build step. It is also what makes the file count worth checking: with no build to observe, the extractor relies entirely on file discovery. |
| `permissions` | `security-events: write` | Required to upload results. Without it the run fails outright, which is at least a loud failure. |
| Schedule | Weekly | A dormant repository still gets re-analysed against current query packs. |

## If the count is wrong

Usual causes, in the order worth checking:

1. A `paths-ignore` filter that is broader than intended.
2. Sources outside the checked-out working directory, or a checkout that missed them.
3. A `paths` filter that names a directory that no longer exists.

Adjust, re-run, re-read the count. Do not close the finding on the strength of the check mark.

## What the auditor checks

| Rule | Level | Meaning |
|---|---|---|
| `code-scanning/missing` | ERROR | No workflow under `.github/workflows` runs CodeQL analysis |
| `code-scanning/no-language` | WARN | CodeQL runs but no javascript or typescript language is declared |

Neither rule can tell you whether the extractor found any files — that lives in the run logs, not
in the repository. The auditor makes no network call and reads no workflow run.

## Relationship to Checkmarx

CodeQL is a SAST tool. So is Checkmarx, which is the tool the CI/CD Pipeline Standards actually
name for SAST. Running CodeQL does not remove the Checkmarx requirement, and this skill is not
authority for a Checkmarx exemption. See
[`required-scans-mapping.md`](required-scans-mapping.md).

CodeQL is **not** DAST. It reads source; it never starts the application.
