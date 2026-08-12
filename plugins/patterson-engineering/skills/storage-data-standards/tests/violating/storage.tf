# Fixture: multiple Storage & Data Standards violations.
resource "azurerm_storage_account" "data" {
  name                          = "stpattersondata02"
  min_tls_version               = "TLS1_0"
  https_traffic_only_enabled    = false
  shared_access_key_enabled     = true
  public_network_access_enabled = true
  allow_blob_public_access      = true

  tags = {
    owner = "app-team"
  }
}

data "azurerm_storage_account_sas" "upload" {
  connection_string = azurerm_storage_account.data.primary_connection_string
  start             = "2026-01-01"
}
