# Fixture: a VM that satisfies the Azure Compute Standards.
resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  address_prefixes     = ["10.10.1.0/24"]
}

resource "azurerm_subnet_network_security_group_association" "app" {
  subnet_id                 = azurerm_subnet.app.id
  network_security_group_id = azurerm_network_security_group.app.id
}

resource "azurerm_network_interface" "app" {
  name                          = "nic-app"
  enable_accelerated_networking = true
  ip_configuration {
    name                          = "internal"
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "app" {
  name                        = "vm-app-01"
  size                        = "Standard_D2ds_v5" # Generally Optimized = DDSv5
  secure_boot_enabled         = true
  vtpm_enabled                = true
  encryption_at_host_enabled  = true
  integrity_monitoring        = true
  identity {
    type = "SystemAssigned"
  }
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2" # Generation V2
    version   = "latest"
  }
}
