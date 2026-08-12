# Encryption and identity

Source: Storage & Data Standards, `sys_kb_id=fdc09a4d93548f908037f8bd1dba10ed`.

---

## Identity

| Control | Requirement |
|---|---|
| Primary identity | **Entra ID / AD wherever supported** |
| SQL authentication | **Still needed for some Azure SQL** — permitted where required |
| Shared keys | **Disabled unless approved** |
| SAS tokens | **Expiry required** + **least privilege** |
| Public network access | **Disabled unless approved** |
| Private endpoints | **Required for production sensitive workloads** |

> [!IMPORTANT]
> Two of these carry an explicit "unless approved" escape: shared keys and public network access.
> Both go through the storage exception path (risk assessment + compensating controls + EA Team
> approval), not an informal sign-off.

`[TBD: the standard does not state a maximum SAS token lifetime, nor whether user-delegation SAS is
preferred over account SAS.]`

## Encryption

| Control | Requirement |
|---|---|
| At rest | **Mandatory** |
| In transit | **TLS 1.2 minimum, 1.3+ where supported** |
| High-sensitivity data | **CMK**, stored in **Key Vault** |
| Key rotation | **At least annually** |

> [!NOTE]
> "1.3+ where supported" means: if the service supports TLS 1.3, use it. Setting 1.2 on a service
> that supports 1.3 is a gap, not a hard violation — the floor is 1.2.

"High-sensitivity" maps to Restricted, and to Confidential where required. The standard's phrasing
for Restricted/Confidential is "Key Vault managed keys **where required**", so CMK is not
unconditional for Confidential.

`[TBD: the standard does not define "high-sensitivity" beyond the classification levels, nor does it
state who determines when Key Vault managed keys are "required".]`

## Terraform shape

```hcl
resource "azurerm_storage_account" "data" {
  min_tls_version               = "TLS1_2"
  https_traffic_only_enabled    = true
  shared_access_key_enabled     = false
  public_network_access_enabled = false

  customer_managed_key {
    key_vault_key_id = azurerm_key_vault_key.data.id
  }

  tags = { data_classification = "Restricted" }
}

resource "azurerm_private_endpoint" "data" { /* required for Restricted/Confidential */ }
```
