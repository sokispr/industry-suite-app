import { api } from "./api.js";
import { state, dom, ui } from "./state.js";
import { requireAdminMode, showAlert, openConfirm, refreshInventoryOnly } from "./app.js";

export function openInventoryById(id) {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item) {
    showAlert("Inventory item not found.", "warning");
    return;
  }
  openInventoryModal(item);
}

export function openInventoryModal(item = null) {
  if (!requireAdminMode("Switch to ADMIN mode to edit inventory.")) {
    return;
  }

  document.getElementById("inventory-form").reset();
  dom.inventoryDeleteModal.classList.add("d-none");

  if (!item) {
    dom.inventoryModalTitle.textContent = "New inventory item";
    dom.inventoryId.value = "";
    dom.inventoryStatus.value = "AVAILABLE";
  } else {
    dom.inventoryModalTitle.textContent = "Edit inventory item";
    dom.inventoryId.value = String(item.id);
    dom.inventorySku.value = item.sku;
    dom.inventoryName.value = item.name;
    dom.inventoryCategory.value = item.category?.id || "";
    dom.inventoryLocation.value = item.warehouseLocation || "";
    dom.inventoryTotal.value = String(item.quantityTotal);
    dom.inventoryReserved.value = String(item.quantityReserved);
    dom.inventoryStatus.value = item.status;
    dom.inventoryDeleteModal.classList.remove("d-none");
  }

  ui.inventoryModal.show();
}

export async function saveInventoryItem(submitEvent) {
  submitEvent.preventDefault();
  if (!requireAdminMode("Switch to ADMIN mode to save inventory changes.")) {
    return;
  }

  const payload = {
    sku: dom.inventorySku.value.trim(),
    name: dom.inventoryName.value.trim(),
    categoryId: dom.inventoryCategory.value ? Number(dom.inventoryCategory.value) : null,
    warehouseLocation: dom.inventoryLocation.value.trim() || null,
    quantityTotal: Number(dom.inventoryTotal.value),
    quantityReserved: Number(dom.inventoryReserved.value),
    status: dom.inventoryStatus.value
  };

  try {
    if (dom.inventoryId.value) {
      await api.updateInventoryItem(Number(dom.inventoryId.value), payload);
      showAlert("Inventory item updated.", "success");
    } else {
      await api.createInventoryItem(payload);
      showAlert("Inventory item created.", "success");
    }

    ui.inventoryModal.hide();
    await refreshInventoryOnly();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

export function promptDeleteInventoryItem(id) {
  if (!id) {
    return;
  }

  if (!requireAdminMode("Switch to ADMIN mode to delete inventory items.")) {
    return;
  }

  state.pendingDelete = async () => {
    await api.deleteInventoryItem(id);
    ui.inventoryModal.hide();
    await refreshInventoryOnly();
  };

  openConfirm("Delete this inventory item?");
}
