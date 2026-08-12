# App Service, Functions and Logic Apps

Source: Azure Compute Standards, `sys_kb_id=937eb90b3b650f107f43b50236e45a16`.

App Service Plans are in scope, covering **Logic Apps, App Services and Functions**.

---

## Hosting and scale

| Control | Requirement |
|---|---|
| Hosting | **App Service Environments** |
| Scaling | **Horizontal** |
| Instance count | **≥ 2 in production** |
| SKU | **I1 / I2 / I3 in production; I1 in non-production** |

## Transport and protocol

| Control | Requirement |
|---|---|
| SFTP / FTPS | **Disabled** |
| Traffic | **HTTPS, TCP/443 only** |
| HTTP version | **HTTP 2.0** |
| TLS | **1.2 minimum** |

## Application configuration

| Control | Requirement |
|---|---|
| Remote debugging | **Off** |
| CORS | **No wildcard origins** |
| Platform | **64-bit only** |
| Basic auth | **Off** |
| Custom domains | **Required for public workloads** |
| Identity | **Managed identity where possible** |
| API surface | **Remove unused API endpoints** |

## Logic Apps

**Production Logic Apps: single tenant only.**

`[TBD: the standard does not state a requirement for non-production Logic Apps tenancy.]`

## Terraform shape that satisfies these rules

```hcl
resource "azurerm_linux_web_app" "api" {
  https_only               = true
  remote_debugging_enabled = false

  site_config {
    minimum_tls_version                    = "1.2"
    ftps_state                             = "Disabled"
    http2_enabled                          = true
    use_32_bit_worker                      = false
    cors { allowed_origins = ["https://www.pattersoncompanies.com"] }
  }

  identity { type = "SystemAssigned" }
}
```

> [!WARNING]
> Note `ftps_state = "Disabled"`: `"FtpsOnly"` still leaves FTPS enabled and is a violation of
> "disable SFTP/FTPS".

`[TBD: the standard does not state a minimum instance count or SKU for Functions specifically, only
for App Service Plans generally.]`
