# Virtual machine standards

Source: Azure Compute Standards, `sys_kb_id=937eb90b3b650f107f43b50236e45a16`.

---

## Table of contents

- [T-shirt sizing](#t-shirt-sizing)
- [VDI profiles](#vdi-profiles)
- [Security — required on every VM](#security--required-on-every-vm)
- [Networking](#networking)
- [Identity](#identity)
- [Terraform shape that satisfies these rules](#terraform-shape-that-satisfies-these-rules)

## T-shirt sizing

| Workload class | Series |
|---|---|
| Generally Optimized | DDSv5 |
| Memory Optimized | EDsv5 |
| Compute Optimized | Fsv2 |

Sizes within each series: **xsmall, small, medium, large, xlarge, xxlarge**.

> [!WARNING]
> `[TBD: the standard's table maps T-shirt names to series, but the vCPU/memory values behind each
> T-shirt size are not reproduced here. Read the size table in the source article before quoting a
> specific SKU such as Standard_D4ds_v5.]`

Selecting the SKU is the **Technical Owner's** responsibility (Azure Environment Standards).

## VDI profiles

| Profile | vCPU | Memory | Storage |
|---|---|---|---|
| Light | 2 | 8 GiB | 32 GB |
| Medium | 4 | 16 GiB | 32 GB |
| Heavy | 8 | 32 GiB | 32 GB |

All three profiles use 32 GB storage. Applies to AVD and Windows 365, both in scope.

`[TBD: the standard does not state which VM series backs each VDI profile.]`

## Security — required on every VM

| Control | Setting |
|---|---|
| VM generation | **Generation 2** |
| Secure Boot | **Enabled** |
| Integrity Monitoring | **Enabled** |
| vTPM | **Enabled** |
| Encryption at host | **Enabled** |

> [!IMPORTANT]
> These are not risk-ranked. All five, on every VM.

## Networking

| Control | Setting |
|---|---|
| Public IP | **Never.** No VM or VMSS may have a public IP. |
| Accelerated Networking | **On** |
| NSG | **Never deploy into a subnet without an NSG** |

## Identity

**System-assigned managed identity on all VMs and VMSS.**

`[TBD: the standard does not state whether a user-assigned managed identity may be attached in
addition to the required system-assigned one.]`

## Terraform shape that satisfies these rules

```hcl
resource "azurerm_linux_virtual_machine" "app" {
  size                       = "Standard_D2ds_v5" # Generally Optimized = DDSv5
  secure_boot_enabled        = true
  vtpm_enabled               = true
  encryption_at_host_enabled = true
  identity { type = "SystemAssigned" }
  source_image_reference {
    sku = "22_04-lts-gen2" # Generation 2
  }
}
```

Plus: `enable_accelerated_networking = true` on the NIC, an
`azurerm_subnet_network_security_group_association`, and no `azurerm_public_ip`.
