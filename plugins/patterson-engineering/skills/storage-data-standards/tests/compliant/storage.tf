# Fixture: a storage account that satisfies the Storage & Data Standards.
resource "azurerm_storage_account" "data" {
  name                          = "stpattersondata01"
  account_replication_type      = "GZRS"
  min_tls_version               = "TLS1_2"
  https_traffic_only_enabled    = true
  shared_access_key_enabled     = false
  public_network_access_enabled = false

  customer_managed_key {
    key_vault_key_id = azurerm_key_vault_key.data.id
  }

  blob_properties {
    delete_retention_policy {
      days = 30
    }
  }

  tags = {
    data_classification = "Restricted"
    backup              = "commvault-daily"
  }
}

resource "azurerm_private_endpoint" "data" {
  name      = "pe-stpattersondata01"
  subnet_id = azurerm_subnet.data.id
}
