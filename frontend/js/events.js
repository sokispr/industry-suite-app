import { api } from "./api.js";
import { toInputDateTime, toApiDateTime, escapeHtml } from "./utils.js";
import { state, dom, ui, STATUS_COLORS } from "./state.js";
import { requireAdminMode, showAlert, openConfirm, refreshEventsOnly, closeProjectEditor } from "./app.js";

export function openEventById(id) {
  const selected = state.events.find((eventItem) => eventItem.id === id);
  if (!selected) {
    showAlert("Event not found.", "warning");
    return;
  }
  openEventModal(selected);
}

export function openEventModal(eventItem = null, start = null, end = null) {
  if (!requireAdminMode("Switch to ADMIN mode to edit project events.")) {
    return;
  }

  document.getElementById("event-form").reset();
  dom.assignmentList.innerHTML = "";
  dom.equipmentList.innerHTML = "";
  dom.eventDeleteModal.classList.add("d-none");

  // Reset to General tab
  document.getElementById("general-tab")?.click();

  if (!eventItem) {
    dom.eventModalTitle.textContent = "New project event";
    dom.eventId.value = "";
    dom.eventStatus.value = "PLANNED";
    dom.eventColor.value = STATUS_COLORS.PLANNED;
    dom.eventStart.value = toInputDateTime(start || new Date());
    dom.eventEnd.value = toInputDateTime(end || new Date(Date.now() + 60 * 60 * 1000));
  } else {
    dom.eventModalTitle.textContent = "Edit project event";
    dom.eventId.value = String(eventItem.id);
    dom.eventTitle.value = eventItem.title;
    dom.eventStatus.value = eventItem.status;
    dom.eventStart.value = toInputDateTime(eventItem.startAt);
    dom.eventEnd.value = toInputDateTime(eventItem.endAt);
    dom.eventColor.value = eventItem.colorHex;
    dom.eventLocation.value = eventItem.location || "";
    dom.eventDescription.value = eventItem.description || "";
    dom.eventDeleteModal.classList.remove("d-none");

    eventItem.equipmentRegisters?.forEach((equipmentItem) => addEquipmentRow(equipmentItem));
  }
}

export function addEquipmentRow(prefill = null) {
  const row = document.createElement("div");
  row.className = "equipment-row";

  const inventoryOptions = state.inventory
    .map((item) => {
      const selected = Number(prefill?.inventoryItemId) === item.id ? "selected" : "";
      return `<option value="${item.id}" ${selected}>${escapeHtml(item.sku)} · ${escapeHtml(item.name)}</option>`;
    })
    .join("");

  row.innerHTML = `
    <select class="form-select equipment-item">
      <option value="">Select equipment item</option>
      ${inventoryOptions}
    </select>
    <input class="form-control equipment-quantity" type="number" min="1" step="1" value="${Number(
      prefill?.quantityReserved || 1
    )}" />
    <input class="form-control equipment-notes" placeholder="Notes" value="${escapeHtml(prefill?.notes || "")}" />
    <button class="btn btn-outline-danger" type="button" data-action="equipment-remove">×</button>
  `;

  dom.equipmentList.appendChild(row);
}

function collectEquipmentRegisters() {
  return [...dom.equipmentList.querySelectorAll(".equipment-row")]
    .map((row) => {
      const inventoryItemId = Number(row.querySelector(".equipment-item").value);
      if (!inventoryItemId) {
        return null;
      }

      const quantityReserved = Number(row.querySelector(".equipment-quantity").value);
      if (!Number.isFinite(quantityReserved) || quantityReserved < 1) {
        throw new Error("Equipment quantity must be at least 1.");
      }

      const notes = row.querySelector(".equipment-notes").value.trim();
      return {
        inventoryItemId,
        quantityReserved,
        notes: notes || null
      };
    })
    .filter(Boolean);
}

export async function saveEvent(submitEvent) {
  submitEvent.preventDefault();
  if (!requireAdminMode("Switch to ADMIN mode to save event changes.")) {
    return;
  }

  const payload = {
    title: dom.eventTitle.value.trim(),
    status: dom.eventStatus.value,
    startAt: toApiDateTime(dom.eventStart.value),
    endAt: toApiDateTime(dom.eventEnd.value),
    colorHex: dom.eventColor.value,
    location: dom.eventLocation.value.trim() || null,
    description: dom.eventDescription.value.trim() || null,
    equipmentRegisters: collectEquipmentRegisters()
  };

  try {
    if (dom.eventId.value) {
      await api.updateEvent(Number(dom.eventId.value), payload);
      showAlert("Event updated.", "success");
    } else {
      await api.createEvent(payload);
      showAlert("Event created.", "success");
    }

    closeProjectEditor();
    await refreshEventsOnly();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

export function promptDeleteEvent(id) {
  if (!id) {
    return;
  }

  if (!requireAdminMode("Switch to ADMIN mode to delete events.")) {
    return;
  }

  state.pendingDelete = async () => {
    await api.deleteEvent(id);
    closeProjectEditor();
    await refreshEventsOnly();
  };

  openConfirm("Delete this project event?");
}
