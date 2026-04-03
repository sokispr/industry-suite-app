import { api, getUserRole } from "./api.js";
import { state, dom, ui } from "./state.js";
import { requireAdminMode, showAlert, openConfirm, refreshRolesAndEmployees } from "./app.js";

export function openRoleById(id) {
  const role = state.roles.find((entry) => entry.id === id);
  if (!role) {
    showAlert("Role not found.", "warning");
    return;
  }
  openRoleModal(role);
}

export function openRoleModal(role = null) {
  if (getUserRole() !== "ADMIN") {
    showAlert("Switch to ADMIN mode for role changes.", "warning");
    return;
  }

  document.getElementById("role-form").reset();
  dom.roleDeleteModal.classList.add("d-none");

  if (!role) {
    dom.roleModalTitle.textContent = "New role";
    dom.roleId.value = "";
    dom.roleColor.value = "#4f46e5";
  } else {
    dom.roleModalTitle.textContent = "Edit role";
    dom.roleId.value = String(role.id);
    dom.roleCode.value = role.code;
    dom.roleName.value = role.displayName;
    dom.roleCategory.value = role.category?.id || "";
    dom.roleColor.value = role.colorHex;
    dom.roleSystem.checked = role.systemRole;
    dom.roleDeleteModal.classList.remove("d-none");
  }

  ui.roleModal.show();
}

export async function saveRole(submitEvent) {
  submitEvent.preventDefault();
  if (!requireAdminMode("Switch to ADMIN mode to save role changes.")) {
    return;
  }

  const payload = {
    code: dom.roleCode.value.trim(),
    displayName: dom.roleName.value.trim(),
    categoryId: dom.roleCategory.value ? Number(dom.roleCategory.value) : null,
    colorHex: dom.roleColor.value,
    systemRole: dom.roleSystem.checked
  };

  try {
    if (dom.roleId.value) {
      await api.updateRole(Number(dom.roleId.value), payload);
      showAlert("Role updated.", "success");
    } else {
      await api.createRole(payload);
      showAlert("Role created.", "success");
    }

    ui.roleModal.hide();
    await refreshRolesAndEmployees();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

export function promptDeleteRole(id) {
  if (!id) {
    return;
  }

  if (getUserRole() !== "ADMIN") {
    showAlert("ADMIN mode required.", "warning");
    return;
  }

  state.pendingDelete = async () => {
    await api.deleteRole(id);
    ui.roleModal.hide();
    await refreshRolesAndEmployees();
  };

  openConfirm("Delete this role? Linked crew role entries will be removed.");
}
