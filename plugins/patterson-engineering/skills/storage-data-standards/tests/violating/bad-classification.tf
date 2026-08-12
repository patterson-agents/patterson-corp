# Fixture: an invalid data-classification value.
resource "azurerm_mssql_database" "app" {
  name = "sqldb-app"
  tags = {
    data_classification = "Top Secret"
  }
}
