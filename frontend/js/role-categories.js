import { api } from "./api.js";
import { state, dom, ui } from "./state.js";
import { showAlert, openConfirm, requireAdminMode, refreshRoleCategories } from "./app.js";

export function openRoleCategoryModal(id = null) {
    if (!requireAdminMode("Admin mode required to manage categories.")) return;

    const isEdit = id !== null;
    const category = isEdit ? state.roleCategories.find(c => c.id === id) : null;

    if (isEdit && !category) {
        showAlert("Category not found.", "danger");
        return;
    }

    dom.roleCategoryModalTitle.textContent = isEdit ? "Edit Category" : "Create Category";
    dom.roleCategoryId.value = id || "";
    dom.roleCategoryName.value = category ? category.name : "";
    dom.roleCategoryDeleteBtn.classList.toggle("d-none", !isEdit);

    ui.roleCategoryModal.show();
}

export async function saveRoleCategory(event) {
    event.preventDefault();
    if (!requireAdminMode()) return;

    const id = dom.roleCategoryId.value ? Number(dom.roleCategoryId.value) : null;
    const name = dom.roleCategoryName.value;

    try {
        const payload = { name };
        const promise = id ? api.updateRoleCategory(id, payload) : api.createRoleCategory(payload);
        await promise;
        showAlert(`Role Category ${id ? 'updated' : 'created'} successfully.`, "success");
        ui.roleCategoryModal.hide();
        await refreshRoleCategories();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

export function promptDeleteRoleCategory(id) {
    if (!requireAdminMode()) return;
    const category = state.roleCategories.find(c => c.id === id);
    if (!category) return;

    openConfirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`);
    state.pendingDelete = async () => {
        await api.deleteRoleCategory(id);
        await refreshRoleCategories();
    };
}
