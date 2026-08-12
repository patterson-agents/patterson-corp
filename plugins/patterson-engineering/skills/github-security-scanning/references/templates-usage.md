# Installing the templates

Every file in `assets/` is a template that gets **copied into the target repository**. None of them
does anything where it currently sits.

---

## Install map

| Template | Destination in the target repository |
|---|---|
| `assets/secret_scanning.yml` | `.github/secret_scanning.yml` |
| `assets/codeql.yml` | `.github/workflows/codeql.yml` |
| `assets/dependabot.yml` | `.github/dependabot.yml` |
| `assets/security.yml` | `.github/workflows/security.yml` |

The source paths use the literal `${CLAUDE_PLUGIN_ROOT}` placeholder, which the plugin runtime
resolves. Do not expand it by hand into an absolute path.

```bash
cp "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/assets/secret_scanning.yml" \
   .github/secret_scanning.yml

cp "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/assets/codeql.yml" \
   .github/workflows/codeql.yml

cp "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/assets/dependabot.yml" \
   .github/dependabot.yml

cp "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/assets/security.yml" \
   .github/workflows/security.yml
```

## Order

`secret_scanning.yml` goes first and gets merged before push protection is enabled. See
[`secret-scanning-and-push-protection.md`](secret-scanning-and-push-protection.md). The other three
have no ordering constraint between them.

## Per-template notes

### `secret_scanning.yml`

Ships with one exclusion, `plugins/patterson-engineering/hooks/tests/**`. Delete it if the target
repository has no hook fixtures; add one entry per additional fixture location that carries
synthetic credentials. Keep entries specific.

### `codeql.yml`

Analyses `javascript-typescript` with `build-mode: none`. Read
[`codeql-configuration.md`](codeql-configuration.md) before trusting the first green check — the
"files analysed" count is the thing to verify, not the check mark.

Adjust the `branches` filters if the target repository's default branch is not `main`.

### `dependabot.yml`

Declares the `github-actions` ecosystem **only**. This is deliberate: a Patterson
agent-configuration repository has no package manifest, and declaring an ecosystem with no manifest
to read produces a Dependabot error on every scheduled run, which trains reviewers to ignore the
Dependabot tab. Add an ecosystem when the corresponding manifest actually lands.

The `commit-message.prefix` is `chore`, matching conventional-commit enforcement.

### `security.yml`

Wires GitLeaks (secret scanning) and Trivy (dependency and misconfiguration scanning), and uploads
Trivy results to code scanning as SARIF. Both tools are sanctioned by the standards — see
[`required-scans-mapping.md`](required-scans-mapping.md).

Checkmarx jobs are left commented out: Checkmarx requires approval before use, and
`[TBD: no Patterson source specifies the Checkmarx GitHub Action, tenant URL, or credential
names.]`

`[TBD: no Patterson source names the organisation's GitLeaks licence secret. GitLeaks requires
GITLEAKS_LICENSE for organisation-owned repositories; confirm the secret name with AppSec.]`

This workflow is **not** DAST and must not be recorded as satisfying the DAST check.

## After installing

Run the auditor against the repository root:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/github-security-scanning/scripts/check-security-config.ts" .
```

Expect `WARN push-protection/unverifiable` and `INFO coverage/dast-open` on a fully configured
repository. Both are standing caveats, not findings you can configure away.

Then enable the server-side settings, which no template can set. See
[`github-advanced-security.md`](github-advanced-security.md).

## Action pinning

Templates pin actions by major version (`actions/checkout@v4`, `github/codeql-action/init@v3`),
matching the convention in the repository's other workflow templates. `aquasecurity/trivy-action`
is the exception: it publishes no floating major tag, so an exact version is pinned and Dependabot's
`github-actions` ecosystem raises the bump.
