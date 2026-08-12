# Service connections and secrets

Source: CI/CD Pipeline Standards, `sys_kb_id=c70e79833b650f107f43b50236e45a7d`.

---

## Service connections

| Rule | Detail |
|---|---|
| Credential type | **Federated credentials only.** |
| Exceptions | **b2c** and **vendor integration** — these two only. |
| Separation | **Different credentials per environment.** |
| Privilege | **Least privilege.** Broad `Contributor` or `Owner` is prohibited. |
| Production | **Approval required** for a production service connection. |

### What federated looks like

| Platform | Shape |
|---|---|
| Azure DevOps | `authenticationScheme: WorkloadIdentityFederation` |
| GitHub Actions | `permissions: id-token: write` plus `azure/login` with `client-id`, `tenant-id`, `subscription-id` — and **no** `client-secret` and **no** `creds` blob |
| Terraform | `use_oidc = true` / `ARM_USE_OIDC`, never `ARM_CLIENT_SECRET` |

### What is a violation

- `ServicePrincipalKey`
- `authenticationScheme: ServicePrincipal` backed by a secret
- `ARM_CLIENT_SECRET`
- `azure/login` with `creds: ${{ secrets.AZURE_CREDENTIALS }}`
- Any `client-secret` used to obtain a pipeline identity

`[TBD: the standard does not state a rotation period for the b2c and vendor-integration exception
credentials, nor who approves those exceptions.]`

## Secrets

- **Never in code.**
- Use a **dedicated secrets manager**: **Vault** or a **cloud-native** secrets manager.

`[TBD: the standard does not designate which of Vault or the cloud-native option is preferred, nor
does it state a secret rotation interval. Note the Storage & Data standard does require key rotation
at least annually for encryption keys — that is a different control.]`

> [!WARNING]
> The plugin's PreToolUse hook blocks high-confidence hardcoded secrets at write time. It catches
> recognisable credential formats only; it is **not** a substitute for GitLeaks in CI.
