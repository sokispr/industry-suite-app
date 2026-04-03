import { api } from "./api.js";
import { state, dom, ui } from "./state.js";
import { showAlert, openConfirm, requireAdminMode, refreshInventoryCategories } from "./app.js";

export function openCategoryModal(id = null) {
    if (!requireAdminMode("Admin mode required to manage categories.")) return;

    const isEdit = id !== null;
    const category = isEdit ? state.inventoryCategories.find(c => c.id === id) : null;

    if (isEdit && !category) {
        showAlert("Category not found.", "danger");
        return;
    }

    dom.inventoryCategoryModalTitle.textContent = isEdit ? "Edit Category" : "Create Category";
    dom.inventoryCategoryId.value = id || "";
    dom.inventoryCategoryName.value = category ? category.name : "";
    dom.inventoryCategoryDeleteBtn.classList.toggle("d-none", !isEdit);

    ui.inventoryCategoryModal.show();
}

export async function saveCategory(event) {
    event.preventDefault();
    if (!requireAdminMode()) return;

    const id = dom.inventoryCategoryId.value ? Number(dom.inventoryCategoryId.value) : null;
    const name = dom.inventoryCategoryName.value;

    try {
        const payload = { name };
        const promise = id ? api.updateInventoryCategory(id, payload) : api.createInventoryCategory(payload);
        await promise;
        showAlert(`Category ${id ? 'updated' : 'created'} successfully.`, "success");
        ui.inventoryCategoryModal.hide();
        await refreshInventoryCategories();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

export function promptDeleteCategory(id) {
    if (!requireAdminMode()) return;
    const category = state.inventoryCategories.find(c => c.id === id);
    if (!category) return;

    openConfirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`);
    state.pendingDelete = async () => {
        await api.deleteInventoryCategory(id);
        await refreshInventoryCategories();
    };
}
