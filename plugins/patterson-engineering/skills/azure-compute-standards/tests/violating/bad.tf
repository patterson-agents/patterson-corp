# Fixture: multiple Azure Compute Standards violations.
resource "azurerm_public_ip" "vm" {
  name              = "pip-vm-app"
  allocation_method = "Static"
}

resource "azurerm_subnet" "app" {
  name             = "snet-app"
  address_prefixes = ["10.10.1.0/24"]
}

resource "azurerm_linux_virtual_machine" "app" {
  name = "vm-app-01"
  size = "Standard_D2s_v3"
}

resource "azurerm_container_group" "legacy" {
  name = "aci-legacy-worker"
}

resource "azurerm_linux_web_app" "api" {
  name                       = "app-api"
  https_only                 = false
  remote_debugging_enabled   = true
  site_config {
    ftps_state          = "AllAllowed"
    minimum_tls_version = "1.0"
    cors {
      allowed_origins = ["*"]
    }
  }
}
