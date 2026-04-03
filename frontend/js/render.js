import { state, dom } from "./state.js";
import { formatDateTime, formatTimeOnly, withAlpha, escapeHtml } from "./utils.js";

export function renderClock() {
  if (!dom.clockLabel) return;
  const now = new Date();
  dom.clockLabel.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function renderStats() {
  if (!dom.overviewStats) return;

  const runningEvents = state.events.filter((eventItem) => eventItem.status === "IN_PROGRESS").length;
  const upcomingEvents = state.events.filter((eventItem) => new Date(eventItem.startAt) >= new Date()).length;
  const availableUnits = state.inventory.reduce(
    (sum, item) => sum + (item.quantityAvailable ?? item.quantityTotal - item.quantityReserved),
    0
  );

  dom.overviewStats.innerHTML = [
    { label: "Live operations", value: runningEvents },
    { label: "Upcoming projects", value: upcomingEvents },
    { label: "Available stock units", value: availableUnits }
  ]
    .map(
      (card) => `
      <div class="stat-card">
        <div class="stat-label">${card.label}</div>
        <div class="stat-value">${card.value}</div>
      </div>
    `
    )
    .join("");
}

export function renderOverviewTable() {
  if (!dom.overviewProjectsBody) return;

  const rows = state.events
    .slice()
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 8)
    .map((eventItem) => {
      return `
      <tr data-event-id="${eventItem.id}" style="cursor: pointer;" title="Double-click to open in new tab">
        <td data-label="Project">${escapeHtml(eventItem.title)}</td>
        <td data-label="Time Window">${formatDateTime(eventItem.startAt)} - ${formatDateTime(eventItem.endAt)}</td>
        <td data-label="Status"><span class="badge" style="background:${eventItem.colorHex};">${eventItem.status}</span></td>
      </tr>
    `;
    })
    .join("");

  dom.overviewProjectsBody.innerHTML = rows || '<tr><td colspan="3" class="text-center text-secondary">No projects yet.</td></tr>';
}

export function renderCalendarEvents() {
  if (!state.calendar) return;

  const filterValue = dom.masterCalendarFilter?.value || "ALL";
  state.calendar.removeAllEvents();

  state.events.forEach((eventItem) => {
    // 1. PROJECTS
    if (filterValue === "ALL" || filterValue === "PROJECTS") {
      state.calendar.addEvent({
        id: `event-${eventItem.id}`,
        title: `${eventItem.eventType === 'INTERNAL' ? '🏢' : '📦'} ${eventItem.title}`,
        start: eventItem.startAt,
        end: eventItem.endAt,
        color: eventItem.colorHex,
        extendedProps: {
          parentEventId: eventItem.id
        }
      });
    }

    // 3. EQUIPMENT (INVENTORY)
    if (filterValue === "ALL" || filterValue === "INVENTORY") {
      eventItem.equipmentRegisters?.forEach((eq) => {
        state.calendar.addEvent({
          id: `eq-${eq.id || Math.random()}`,
          title: `🔧 ${eq.quantityReserved}x ${eq.inventoryItemName} (${eventItem.title})`,
          start: eventItem.startAt,
          end: eventItem.endAt,
          color: "#c026d3", // Purple
          extendedProps: { parentEventId: eventItem.id }
        });
      });
    }
  });
}

export function renderProjectsTable() {
  if (!dom.projectsBody || !dom.projectSearch) return;

  const term = dom.projectSearch.value.trim().toLowerCase();

  const rows = state.events
    .filter((eventItem) => {
      if (!term) return true;
      return [eventItem.title, eventItem.location, eventItem.status].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .map((eventItem) => {
      return `
      <tr data-event-id="${eventItem.id}" style="cursor: pointer;" title="Double-click to open in new tab">
        <td data-label="Select" onclick="event.stopPropagation();"><input class="form-check-input project-select-cb" type="checkbox" value="${eventItem.id}"></td>
        <td data-label="Title"><span class="badge bg-secondary me-2">${eventItem.eventType === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL'}</span>${escapeHtml(eventItem.title)}</td>
        <td data-label="Location">${eventItem.location ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventItem.location)}" target="_blank" class="text-info text-decoration-none" onclick="event.stopPropagation();"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(eventItem.location)}</a>` : "-"}</td>
        <td data-label="Time Window">${formatDateTime(eventItem.startAt)} - ${formatDateTime(eventItem.endAt)}</td>
        <td data-label="Status"><span class="badge" style="background:${eventItem.colorHex};">${eventItem.status}</span></td>
        <td data-label="Actions">
          <button class="btn btn-sm btn-outline-light" data-action="open-event-edit" data-id="${eventItem.id}">Edit</button>
        </td>
      </tr>
    `;
    })
    .join("");

  dom.projectsBody.innerHTML = rows || '<tr><td colspan="6" class="text-center text-secondary">No projects found.</td></tr>';
  updateBulkDeleteBtn("projects");
}

export function renderSidebarProjects() {
  if (!dom.sidebarProjectsList) return;

  const links = state.events
    .slice()
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .map((eventItem) => {
      const color = eventItem.colorHex || "#5f88ff";
      return `
      <div class="sidebar-sub-item d-flex align-items-center">
        <a href="#project-${eventItem.id}" class="sidebar-sub-link flex-grow-1 text-truncate" title="${escapeHtml(eventItem.title)}">
          <span style="display:inline-block; width:6px; height:6px; flex-shrink: 0; border-radius:50%; background-color:${color}; margin-right:8px;"></span>
          <span>${escapeHtml(eventItem.title)}</span>
        </a>
        <button class="btn btn-link p-0 edit-cat-btn" data-action="open-event-edit" data-id="${eventItem.id}" title="Edit Project"><i class="bi bi-pencil"></i></button>
      </div>`;
    })
    .join("");

  dom.sidebarProjectsList.innerHTML = links || '<span class="sidebar-sub-link text-secondary d-block px-4">No projects</span>';
}

export function renderInventoryGroups() {
    if (!dom.inventoryGroups) return;

    const links = state.inventoryCategories.map(category => `
    <a href="#warehouse" class="sidebar-sub-link ${state.inventoryCategoryFilter === category.name ? 'active' : ''}" data-action="filter-inventory" data-category="${escapeHtml(category.name)}">
      <i class="bi bi-folder me-2"></i>
      <span class="text-truncate">${escapeHtml(category.name)}</span>
    </a>
  `).join('');

    const uncategorizedLink = `
    <a href="#warehouse" class="sidebar-sub-link ${state.inventoryCategoryFilter === 'Uncategorized' ? 'active' : ''}" data-action="filter-inventory" data-category="Uncategorized">
      <i class="bi bi-folder me-2"></i>
      <span class="text-truncate">Uncategorized</span>
    </a>`;

    dom.inventoryGroups.innerHTML = `
    <a href="#warehouse" class="sidebar-sub-link ${!state.inventoryCategoryFilter || state.inventoryCategoryFilter === 'ALL' ? 'active' : ''}" data-action="filter-inventory" data-category="ALL"><i class="bi bi-collection me-2"></i>All Items</a>
    ${links}
    ${uncategorizedLink}
  `;
}

export function renderInventoryCategoriesTable() {
    if (!dom.inventoryCategoriesBody) return;

    const itemCounts = state.inventory.reduce((acc, item) => {
        if (item.category) {
            acc[item.category.id] = (acc[item.category.id] || 0) + 1;
        }
        return acc;
    }, {});

    const rows = state.inventoryCategories.map(category => `
        <tr>
            <td data-label="Select" onclick="event.stopPropagation();"><input class="form-check-input inventory-category-select-cb" type="checkbox" value="${category.id}"></td>
            <td data-label="Category">${escapeHtml(category.name)}</td>
            <td data-label="Items">${itemCounts[category.id] || 0}</td>
            <td data-label="Actions">
                <button class="btn btn-sm btn-outline-light" data-action="open-inventory-category-edit" data-id="${category.id}">Edit</button>
            </td>
        </tr>
    `).join('');

    dom.inventoryCategoriesBody.innerHTML = rows || '<tr><td colspan="4" class="text-center text-secondary">No categories created yet.</td></tr>';
    updateBulkDeleteBtn("inventory-categories");
}

export function renderInventoryTable() {
  if (!dom.inventoryBody) return;

  const rows = state.inventory
    .filter((item) => {
      if (!state.inventoryCategoryFilter || state.inventoryCategoryFilter === "ALL") return true;
      const catName = item.category?.name || "Uncategorized";
      return catName === state.inventoryCategoryFilter;
    })
    .filter((item) => {
      if (!state.warehouseFilter || state.warehouseFilter === "ALL") return true;
      return String(item.warehouse?.id) === String(state.warehouseFilter);
    })
    .slice()
    .sort((a, b) => {
      const catA = a.category?.name || "";
      const catB = b.category?.name || "";
      return catA.localeCompare(catB) || a.name.localeCompare(b.name);
    })
    .map((item) => {
      return `
      <tr>
        <td data-label="Select" onclick="event.stopPropagation();"><input class="form-check-input inventory-select-cb" type="checkbox" value="${item.id}"></td>
        <td data-label="SKU"><code>${escapeHtml(item.sku)}</code></td>
        <td data-label="Name">
          <div>${escapeHtml(item.name)}</div>
          <div class="small text-secondary"><i class="bi bi-building me-1"></i>${escapeHtml(item.warehouse?.name || "No Facility")}</div>
        </td>
        <td data-label="Category">${escapeHtml(item.category?.name || "Uncategorized")}</td>
        <td data-label="Availability">${item.quantityAvailable ?? item.quantityTotal - item.quantityReserved} / ${item.quantityTotal}</td>
        <td data-label="Status">${escapeHtml(item.status)}</td>
        <td data-label="Actions">
          <button class="btn btn-sm btn-outline-light" data-action="open-inventory-edit" data-id="${item.id}">Edit</button>
        </td>
      </tr>
    `;
    })
    .join("");

  dom.inventoryBody.innerHTML = rows || '<tr><td colspan="7" class="text-center text-secondary">No inventory items found.</td></tr>';
  updateBulkDeleteBtn("inventory");
}

export function renderSidebarInventoryCategories() {
  if (!dom.sidebarInventoryList) return;

  const links = state.inventoryCategories.map(cat => `
    <div class="sidebar-sub-item d-flex align-items-center">
      <a href="#warehouse" class="sidebar-sub-link flex-grow-1 text-truncate ${state.inventoryCategoryFilter === cat.name ? 'active' : ''}" data-action="filter-inventory" data-category="${escapeHtml(cat.name)}">
        <i class="bi bi-folder2 me-2 text-secondary" style="font-size: 0.85rem;"></i>
        <span>${escapeHtml(cat.name)}</span>
      </a>
      <button class="btn btn-link p-0 edit-cat-btn" data-action="open-inventory-category-edit" data-id="${cat.id}" title="Edit Category"><i class="bi bi-pencil"></i></button>
    </div>
  `).join("");

  dom.sidebarInventoryList.innerHTML = links + `
    <div class="sidebar-sub-item d-flex align-items-center">
      <a href="#warehouse" class="sidebar-sub-link flex-grow-1 text-truncate ${state.inventoryCategoryFilter === 'Uncategorized' ? 'active' : ''}" data-action="filter-inventory" data-category="Uncategorized">
        <i class="bi bi-folder2 me-2 text-secondary" style="font-size: 0.85rem;"></i>
        <span>Uncategorized</span>
      </a>
    </div>
  `;
}

export function renderInventoryCategorySelect() {
  const categorySelect = document.getElementById("inventory-category");
  if (!categorySelect) return;

  const options = state.inventoryCategories
    .map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`)
    .join("");

  categorySelect.innerHTML = `<option value="">Select category...</option>${options}`;
}

export function renderWarehouseSelect() {
  const options = state.warehouses.map(w => `<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('');

  if (dom.warehouseSelectFilter) {
    const current = dom.warehouseSelectFilter.value;
    dom.warehouseSelectFilter.innerHTML = `<option value="ALL">All Warehouses</option>${options}`;
    dom.warehouseSelectFilter.value = current || "ALL";
  }
  if (dom.inventoryWarehouse) {
    dom.inventoryWarehouse.innerHTML = `<option value="">Select facility...</option>${options}`;
  }
}

export function updateBulkDeleteBtn(type) {
  let cbClass, btnDom, selectAllDom;

  if (type === 'projects') {
    cbClass = ".project-select-cb";
    btnDom = dom.bulkDeleteProjectsBtn;
    selectAllDom = dom.selectAllProjects;
  } else if (type === 'inventory') {
    cbClass = ".inventory-select-cb";
    btnDom = dom.bulkDeleteInventoryBtn;
    selectAllDom = dom.selectAllInventory;
  } else if (type === 'inventory-categories') {
    cbClass = ".inventory-category-select-cb";
    btnDom = dom.bulkDeleteInventoryCategoriesBtn;
    selectAllDom = dom.selectAllInventoryCategories;
  } else {
    return;
  }

  if (!btnDom) return;

  const checkedCount = document.querySelectorAll(`${cbClass}:checked`).length;
  if (checkedCount > 0) {
    btnDom.classList.remove("d-none");
    btnDom.textContent = `Delete Selected (${checkedCount})`;
  } else {
    btnDom.classList.add("d-none");
    if (selectAllDom) selectAllDom.checked = false;
  }
}
