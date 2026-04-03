import { api } from "./api.js";
import { state, dom, ui } from "./state.js";
import { requireAdminMode, showAlert, openConfirm, refreshEmployeesAndEvents } from "./app.js";
import { syncEmployeeRoleSelect } from "./render.js";

export function addEmployeeRoleFromPicker() {
  const selectedId = Number(dom.employeeRolePicker.value);
  if (!selectedId) {
    showAlert("Select a role first.", "warning");
    return;
  }

  state.employeeDraftRoleIds.add(selectedId);
  syncEmployeeRoleSelect();
}

export function removeEmployeeRole(roleId) {
  if (!roleId) {
    return;
  }
  state.employeeDraftRoleIds.delete(Number(roleId));
  syncEmployeeRoleSelect();
}

export function openEmployeeById(id) {
  const employee = state.employees.find((entry) => entry.id === id);
  if (!employee) {
    showAlert("Employee not found.", "warning");
    return;
  }
  openEmployeeModal(employee);
}

export function openEmployeeModal(employee = null) {
  if (!requireAdminMode("Switch to ADMIN mode to edit employees.")) {
    return;
  }

  document.getElementById("employee-form").reset();
  dom.employeeDeleteModal.classList.add("d-none");
  state.employeeDraftRoleIds = new Set();
  syncEmployeeRoleSelect();

  if (!employee) {
    dom.employeeModalTitle.textContent = "New employee";
    dom.employeeId.value = "";
    dom.employeeActive.checked = true;
  } else {
    dom.employeeModalTitle.textContent = "Edit employee";
    dom.employeeId.value = String(employee.id);
    dom.employeeFirst.value = employee.firstName;
    dom.employeeLast.value = employee.lastName;
    dom.employeeEmail.value = employee.email || "";
    dom.employeePhone.value = employee.phone || "";
    dom.employeeActive.checked = employee.active;
    dom.employeeDeleteModal.classList.remove("d-none");
    state.employeeDraftRoleIds = new Set(employee.roles.map((role) => role.id));
    syncEmployeeRoleSelect();
  }

  ui.employeeModal.show();
}

export async function saveEmployee(submitEvent) {
  submitEvent.preventDefault();
  if (!requireAdminMode("Switch to ADMIN mode to save employee changes.")) {
    return;
  }

  const roleIds = [...state.employeeDraftRoleIds];

  const payload = {
    firstName: dom.employeeFirst.value.trim(),
    lastName: dom.employeeLast.value.trim(),
    email: dom.employeeEmail.value.trim() || null,
    phone: dom.employeePhone.value.trim() || null,
    active: dom.employeeActive.checked,
    roleIds
  };

  try {
    if (dom.employeeId.value) {
      await api.updateEmployee(Number(dom.employeeId.value), payload);
      showAlert("Employee updated.", "success");
    } else {
      await api.createEmployee(payload);
      showAlert("Employee created.", "success");
    }

    ui.employeeModal.hide();
    await refreshEmployeesAndEvents();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

export function promptDeleteEmployee(id) {
  if (!id) {
    return;
  }

  if (!requireAdminMode("Switch to ADMIN mode to delete employees.")) {
    return;
  }

  state.pendingDelete = async () => {
    await api.deleteEmployee(id);
    ui.employeeModal.hide();
    await refreshEmployeesAndEvents();
  };

  openConfirm("Delete this employee and remove related assignments?");
}
