import { api, getUserRole, setUserRole } from "./api.js";
import { state, dom, ui, STATUS_COLORS, VIEW_TITLES, ADMIN_ACTIONS } from "./state.js"; // Assuming state.js exists
import {
  renderClock, renderStats, renderOverviewTable,
  renderCalendarEvents, renderProjectsTable, renderInventoryGroups, renderInventoryTable,
  renderSidebarProjects, renderInventoryCategorySelect, renderInventoryCategoriesTable,
  updateBulkDeleteBtn, renderSidebarInventoryCategories, renderWarehouseSelect
} from "./render.js";
import { openEventById, openEventModal, addEquipmentRow, saveEvent, promptDeleteEvent } from "./events.js";
import { openInventoryById, openInventoryModal, saveInventoryItem, promptDeleteInventoryItem } from "./inventory.js"; // Assuming inventory.js exists
import { openCategoryModal, saveCategory, promptDeleteCategory } from "./inventory-categories.js";

const ACTION_HANDLERS = {
  "refresh-data": async () => {
    showAlert("Ενημέρωση δεδομένων...", "info");
    await refreshAll();
    showAlert("Τα δεδομένα ανανεώθηκαν με επιτυχία.", "success");
  },
  "open-master-calendar": () => {
    ui.masterCalendarModal.show();
  },
  "toggle-sidebar": () => {
    dom.appLayout?.classList.toggle("sidebar-collapsed");

    // Ενημερώνουμε το μέγεθος του Calendar διαρκώς όσο διαρκεί το CSS animation
    const interval = setInterval(() => {
      if (state.calendar) state.calendar.updateSize();
      window.dispatchEvent(new Event('resize'));
    }, 30);

    // Σταματάμε την ενημέρωση μόλις τελειώσει το animation (350ms)
    setTimeout(() => clearInterval(interval), 350);
  },
  "open-event-create": () => {
    window.location.hash = "project-new";
  },
  "open-event-edit": ({ id }) => {
    window.location.hash = `project-${id}`;
  },
  "open-map-location": () => {
    const loc = dom.eventLocation.value.trim();
    if (loc) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, "_blank");
    } else {
      showAlert("Please enter a location first.", "warning");
    }
  },
  "bulk-delete-projects": () => promptBulkDelete('projects'),
  "bulk-delete-inventory": () => promptBulkDelete('inventory'),
  "bulk-delete-inventory-categories": () => promptBulkDelete('inventory-categories'),
  "open-inventory-create": () => openInventoryModal(),
  "open-inventory-edit": ({ id }) => openInventoryById(id),
  "open-inventory-category-create": () => openCategoryModal(),
  "open-inventory-category-edit": ({ id }) => openCategoryModal(id),
  "delete-event": ({ id }) => promptDeleteEvent(id),
  "delete-event-current": () => promptDeleteEvent(Number(dom.eventId.value)),
  "delete-inventory": ({ id }) => promptDeleteInventoryItem(id),
  "delete-inventory-current": () => promptDeleteInventoryItem(Number(dom.inventoryId.value)),
  "delete-inventory-category": ({ id }) => promptDeleteCategory(id),
  "delete-inventory-category-current": () => promptDeleteCategory(Number(dom.inventoryCategoryId.value)),
  "filter-inventory": ({ actionNode }) => {
    state.inventoryCategoryFilter = actionNode.dataset.category;
    renderInventoryGroups();
    renderInventoryTable();
    renderSidebarInventoryCategories();
  },
  "equipment-add": () => addEquipmentRow(),
  "equipment-remove": ({ actionNode }) => {
    actionNode.closest(".equipment-row")?.remove();
  },
  "close-editor": () => closeProjectEditor()
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  initModals();
  bindEvents();
  initCalendar();
  initClock();

  dom.userRole.value = getUserRole();
  applyRoleMode();

  await refreshAll();
  handleHashChange();

  // Register Service Worker for PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }

  showAlert("Control panel loaded.", "success");
}

function initModals() {
  const inventoryModalEl = document.getElementById("inventory-modal");
  if (inventoryModalEl) {
    ui.inventoryModal = new bootstrap.Modal(inventoryModalEl);
  }

  const inventoryCategoryModalEl = document.getElementById("inventory-category-modal");
  if (inventoryCategoryModalEl) {
    ui.inventoryCategoryModal = new bootstrap.Modal(inventoryCategoryModalEl);
  }

  const masterCalModalEl = document.getElementById("master-calendar-modal");
  if (masterCalModalEl) {
    ui.masterCalendarModal = new bootstrap.Modal(masterCalModalEl);
    masterCalModalEl.addEventListener('shown.bs.modal', () => {
      if (state.calendar) state.calendar.updateSize();
    });
  }

  const confirmModalEl = document.getElementById("confirm-modal");
  if (confirmModalEl) {
    ui.confirmModal = new bootstrap.Modal(confirmModalEl);
  }
}

function bindEvents() {
  document.addEventListener("click", handleActionClick);
  document.addEventListener("dblclick", (event) => {
    if (event.target.closest("button")) return; // Αν κάνει διπλό κλικ πάνω σε κουμπί (π.χ. Edit/Delete), αγνόησέ το

    const row = event.target.closest("tr[data-event-id]");
    if (row) {
      const eventId = row.dataset.eventId;
      const baseUrl = window.location.href.split('#')[0]; // Παίρνουμε το βασικό URL
      window.open(baseUrl + "#project-" + eventId, "_blank"); // Ανοίγουμε νέο Browser Tab
    }
  });
  window.addEventListener("hashchange", handleHashChange);

  dom.userRole?.addEventListener("change", () => {
    setUserRole(dom.userRole.value);
    applyRoleMode();
  });

  dom.masterCalendarFilter?.addEventListener("change", () => {
    renderCalendarEvents();
  });

  dom.warehouseSelectFilter?.addEventListener("change", (e) => {
    state.warehouseFilter = e.target.value;
    renderInventoryTable();
  });

  dom.projectSearch?.addEventListener("input", () => {
    renderProjectsTable();
  });

  const setupBulkSelect = (domNode, cbClass, type) => {
    domNode?.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll(cbClass).forEach(cb => cb.checked = isChecked);
      updateBulkDeleteBtn(type);
    });
  };

  setupBulkSelect(dom.selectAllProjects, ".project-select-cb", "projects");
  setupBulkSelect(dom.selectAllInventory, ".inventory-select-cb", "inventory");
  setupBulkSelect(dom.selectAllInventoryCategories, ".inventory-category-select-cb", "inventory-categories");

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("project-select-cb")) updateBulkDeleteBtn("projects");
    else if (e.target.classList.contains("inventory-select-cb")) updateBulkDeleteBtn("inventory");
    else if (e.target.classList.contains("inventory-category-select-cb")) updateBulkDeleteBtn("inventory-categories");
  });

  dom.eventStatus?.addEventListener("change", () => {
    if (dom.eventId && !dom.eventId.value && dom.eventColor) {
      dom.eventColor.value = STATUS_COLORS[dom.eventStatus.value] ?? "#4e6fb5";
    }
  });

  document.getElementById("event-form")?.addEventListener("submit", saveEvent);
  document.getElementById("inventory-form")?.addEventListener("submit", saveInventoryItem);
  document.getElementById("inventory-category-form")?.addEventListener("submit", saveCategory);

  dom.confirmAccept?.addEventListener("click", executePendingDelete);
}

function initClock() {
  renderClock();
  window.setInterval(renderClock, 1000);
}

function initCalendar() {
  if (!dom.calendar) {
    return;
  }

  state.calendar = new FullCalendar.Calendar(dom.calendar, {
    initialView: window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek",
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    nowIndicator: true,
    selectable: true,
    allDaySlot: true,
    slotDuration: "00:30:00",
    expandRows: true,
    height: "100%",
    eventOverlap: false,
    select: (info) => {
      if (!requireAdminMode("Switch to ADMIN mode to add events from timeline.")) {
        return;
      }
      setView("project-editor");
      ui.masterCalendarModal.hide();
      openEventModal(null, info.start, info.end);
    },
    eventClick: (info) => {
      const parentEventId = Number(info.event.extendedProps.parentEventId);
      if (!parentEventId) {
        return;
      }
      if (!requireAdminMode("Viewer mode is read-only for event editing.")) {
        return;
      }
      ui.masterCalendarModal.hide();
      window.location.hash = `project-${parentEventId}`;
    }
  });

  state.calendar.render();
}

async function refreshAll() {
  const [warehouses, events, inventory, inventoryCategories] = await Promise.all([
    api.listWarehouses(),
    api.listEvents(),
    api.listInventory(),
    api.listInventoryCategories()
  ]);

  state.warehouses = warehouses;
  state.events = events;
  state.inventory = inventory;
  state.inventoryCategories = inventoryCategories;

  renderAll();
}

function renderAll() {
  renderStats();
  renderOverviewTable();
  renderCalendarEvents();
  renderProjectsTable();
  renderSidebarProjects();
  renderWarehouseSelect();
  renderInventoryCategorySelect();
  renderInventoryGroups();
  renderInventoryTable();
  renderSidebarInventoryCategories();
  renderInventoryCategoriesTable();
  applyRoleMode();
}

function handleHashChange() {
  let hash = window.location.hash.replace("#", "");

  if (hash.startsWith("project-")) {
    const idPart = hash.split("-")[1];
    setView("project-editor");

    if (idPart === "new") {
      setTimeout(() => { openEventModal(); }, 100);
    } else {
      const eventId = Number(idPart);
      if (eventId) {
        setTimeout(() => { openEventById(eventId); }, 100);
      }
    }
    return;
  }

  if (!hash || !VIEW_TITLES[hash]) {
    hash = "overview";
    window.history.replaceState(null, null, "#" + hash);
  }
  setView(hash);
}

function setView(viewName, options = {}) {
  state.view = viewName;

  document.querySelectorAll(".view-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `view-${viewName}`);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("href") === `#${viewName}`);
  });

  dom.currentViewTitle.textContent = VIEW_TITLES[viewName] ?? "Overview";
}

function handleActionClick(event) {
  const actionNode = event.target.closest("[data-action]");
  if (!actionNode) {
    return;
  }

  const action = actionNode.dataset.action;
  const handler = ACTION_HANDLERS[action];
  if (!handler) {
    return;
  }

  if (ADMIN_ACTIONS.has(action) && !requireAdminMode("Switch to ADMIN mode to modify records.")) {
    return;
  }

  handler({
    actionNode,
    action,
    view: actionNode.dataset.view,
    id: Number(actionNode.dataset.id)
  });
}

function applyRoleMode() {
  const isAdmin = isAdminMode();

  dom.adminBadge.textContent = isAdmin ? "ADMIN" : "VIEWER";
  dom.adminBadge.className = `badge ${isAdmin ? "text-bg-success" : "text-bg-dark"}`;
  applyActionPermissions();
}

function applyActionPermissions() {
  const isAdmin = isAdminMode();
  document.querySelectorAll("[data-action]").forEach((element) => {
    if (!ADMIN_ACTIONS.has(element.dataset.action)) {
      return;
    }
    element.classList.toggle("is-locked", !isAdmin);
    element.setAttribute("aria-disabled", String(!isAdmin));
  });
}

export function isAdminMode() {
  return getUserRole() === "ADMIN";
}

export function requireAdminMode(message) {
  if (isAdminMode()) {
    return true;
  }
  showAlert(message, "warning");
  return false;
}

export function closeProjectEditor() {
  window.location.hash = "projects";
}

export function openConfirm(message) {
  dom.confirmMessage.textContent = message;
  ui.confirmModal.show();
}

export function promptBulkDelete(type) {
  if (!requireAdminMode("Switch to ADMIN mode to delete records.")) return;

  let cbClass, deleteApi, refreshFn;

  if (type === 'projects') {
    cbClass = ".project-select-cb";
    deleteApi = api.deleteEvent;
    refreshFn = refreshEventsOnly;
  } else if (type === 'inventory') {
    cbClass = ".inventory-select-cb";
    deleteApi = api.deleteInventoryItem;
    refreshFn = refreshInventoryOnly;
  } else if (type === 'inventory-categories') {
    cbClass = ".inventory-category-select-cb";
    deleteApi = api.deleteInventoryCategory;
    refreshFn = refreshInventoryCategories;
  } else return;

  const checked = document.querySelectorAll(`${cbClass}:checked`);
  const ids = Array.from(checked).map(cb => Number(cb.value));

  if (ids.length === 0) return;

  openConfirm(`Are you sure you want to delete ${ids.length} selected items? This cannot be undone.`);
  state.pendingDelete = async () => {
    try {
      await Promise.all(ids.map(id => deleteApi(id)));
      showAlert(`Successfully deleted ${ids.length} items.`, "success");
    } catch (error) {
      showAlert("Some items could not be deleted (they might be referenced elsewhere).", "warning");
    }
    await refreshFn();
  };
}

async function executePendingDelete() {
  if (!state.pendingDelete) {
    return;
  }

  const callback = state.pendingDelete;
  state.pendingDelete = null;

  try {
    await callback();
    showAlert("Delete completed.", "success");
  } catch (error) {
    showAlert(error.message, "danger");
  } finally {
    ui.confirmModal.hide();
  }
}

export async function refreshEventsOnly() {
  state.events = await api.listEvents();
  renderOverviewTable();
  renderCalendarEvents();
  renderProjectsTable();
  renderSidebarProjects();
  renderStats();
  applyRoleMode();
}

export async function refreshInventoryOnly() {
  state.inventory = await api.listInventory();
  renderInventoryCategorySelect();
  renderInventoryGroups();
  renderInventoryTable();
  renderSidebarInventoryCategories();
  renderStats();
  applyRoleMode();
}

export async function refreshInventoryCategories() {
  const [inventory, inventoryCategories] = await Promise.all([api.listInventory(), api.listInventoryCategories()]);
  state.inventory = inventory;
  state.inventoryCategories = inventoryCategories;

  renderInventoryCategoriesTable();
  renderInventoryGroups();
  renderInventoryCategorySelect();
  renderSidebarInventoryCategories();
}

export function showAlert(message, variant = "info") {
  dom.alert.className = `alert alert-${variant}`;
  dom.alert.textContent = message;
  dom.alert.classList.remove("d-none");

  window.clearTimeout(showAlert.timer);
  showAlert.timer = window.setTimeout(() => {
    dom.alert.classList.add("d-none");
  }, 3500);
}
