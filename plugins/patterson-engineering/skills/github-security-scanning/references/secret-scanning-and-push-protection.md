# Secret scanning and push protection

The ordering rule, the exclusion file, and why the two must not be swapped.

---

## The ordering rule

1. Add `.github/secret_scanning.yml` with the exclusions the repository needs.
2. Merge it to the default branch.
3. Enable secret scanning.
4. Enable push protection.

> [!WARNING]
> **Do not enable push protection first.**
>
> Patterson engineering repositories carry deliberately synthetic credentials in their hook test
> fixtures — `plugins/patterson-engineering/hooks/tests/` holds payloads with fake AWS keys and
> fake connection strings, because those payloads are the inputs that prove the PreToolUse guard
> detects credentials. Push protection cannot tell a fixture from a live key. Enabled first, it
> blocks the author's next push on the repository's own test data, and the exclusion file that
> would fix it cannot be pushed either.
>
> The recovery is a bypass request per push, which is worse than doing the two steps in order.

## The exclusion file

`.github/secret_scanning.yml` is the only secret-scanning setting expressible as a file. It
suppresses **alerts** for the listed paths.

```yaml
paths-ignore:
  - "plugins/patterson-engineering/hooks/tests/**"
```

Rules for maintaining it:

- One entry per fixture location. Keep each entry as specific as the fixture layout allows.
- A broad exclusion (`"**"`, `"plugins/**"`) silences real findings alongside the fixtures. It is
  worse than no scanning, because the Security tab reads as clean.
- Justify every added entry in the pull request that adds it.

`[TBD: no Patterson standard specifies an approval path for adding a secret-scanning exclusion.
Treat it as a security-relevant change and get AppSec review.]`

## Enabling the settings

Documentation only. This skill contains no script, hook, workflow or test that executes it.

```bash
gh api -X PATCH repos/<org>/<repo> \
  -f security_and_analysis[secret_scanning][status]=enabled \
  -f security_and_analysis[secret_scanning][push_protection][status]=enabled
```

Requires admin on the target repository. There is no dry-run, and the repository is named
positionally, so check `<org>/<repo>` before running it.

## If push protection blocks a legitimate push

In order of preference:

1. **The credential is real.** Rotate it. The push being blocked is the control working. Rotate
   first, then remove it from the branch; a credential that reached a remote is compromised even
   after the commit is rewritten.
2. **The credential is a fixture and the path is missing from the exclusion file.** Add the path,
   merge that change, and retry. Exclusions apply to alerts; a bypass may still be needed for the
   push that carries the fixture itself.
3. **Bypass.** Recorded, reviewable, and the option of last resort. Never the routine answer.

## What the auditor checks

| Rule | Level | Meaning |
|---|---|---|
| `secret-scanning/missing` | ERROR when fixture directories exist, otherwise WARN | No exclusion file found |
| `secret-scanning/no-exclusions` | ERROR | File exists but declares no `paths-ignore` entries while fixtures are present |
| `secret-scanning/fixture-not-excluded` | WARN | A detected fixture directory is not covered by any entry |
| `push-protection/unverifiable` | WARN, always | Whether the settings are actually on is server-side and unreadable from files |

Fixture-directory detection is deliberately narrow: paths ending in `hooks/tests` or
`tests/fixtures`. A repository that keeps synthetic credentials anywhere else must add its own
exclusions by hand — the auditor does not guess, because guessing wide would suppress the finding
it exists to raise.
