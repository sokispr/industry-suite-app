export const state = {
  view: "overview",
  events: [],
  employees: [],
  roles: [],
  roleCategories: [],
  warehouses: [],
  inventory: [],
  inventoryCategories: [],
  inventoryCategoryFilter: "ALL",
  warehouseFilter: "ALL",
  crewCategoryFilter: "ALL",
  calendar: null,
  pendingDelete: null,
  employeeDraftRoleIds: new Set()
};

export const dom = {
  // Global
  appLayout: document.querySelector(".app-layout"),
  currentViewTitle: document.getElementById("current-view-title"),
  clockLabel: document.getElementById("clock-label"),
  userRole: document.getElementById("user-role"),
  adminBadge: document.getElementById("admin-badge"),
  alert: document.getElementById("global-alert"),

  // Overview
  overviewStats: document.getElementById("overview-stats"),
  overviewProjectsBody: document.querySelector("#overview-projects-table tbody"),
  overviewWorkload: document.getElementById("overview-workload"),

  // Schedule
  calendar: document.getElementById("calendar"),
  masterCalendarFilter: document.getElementById("master-calendar-filter"),
  statusBoard: document.getElementById("status-board"),
  statusBoardFilter: document.getElementById("status-board-filter"),

  // Projects
  projectsBody: document.querySelector("#projects-table tbody"),
  projectSearch: document.getElementById("project-search"),
  sidebarProjectsList: document.getElementById("sidebar-projects-list"),
  selectAllProjects: document.getElementById("select-all-projects"),
  bulkDeleteProjectsBtn: document.getElementById("bulk-delete-projects-btn"),

  // Crew
  crewGroups: document.getElementById("crew-groups"),
  crewBody: document.querySelector("#crew-table tbody"),
  selectAllCrew: document.getElementById("select-all-crew"),
  bulkDeleteCrewBtn: document.getElementById("bulk-delete-crew-btn"),
  sidebarCrewList: document.getElementById("sidebar-crew-list"),

  // Warehouse
  inventoryGroups: document.getElementById("inventory-groups"),
  inventoryBody: document.querySelector("#inventory-table tbody"),
  selectAllInventory: document.getElementById("select-all-inventory"),
  bulkDeleteInventoryBtn: document.getElementById("bulk-delete-inventory-btn"),
  sidebarInventoryList: document.getElementById("sidebar-inventory-list"),
  warehouseSelectFilter: document.getElementById("warehouse-select-filter"),

  // Roles
  rolesBody: document.querySelector("#roles-table tbody"),
  roleModalTitle: document.getElementById("role-modal-title"),
  roleId: document.getElementById("role-id"),
  roleCode: document.getElementById("role-code"),
  roleName: document.getElementById("role-name"),
  roleCategory: document.getElementById("role-category"),
  roleColor: document.getElementById("role-color"),
  roleSystem: document.getElementById("role-system"),
  roleDeleteModal: document.getElementById("role-delete-modal"),
  selectAllRoles: document.getElementById("select-all-roles"),
  bulkDeleteRolesBtn: document.getElementById("bulk-delete-roles-btn"),

  // Role Categories
  roleCategoriesBody: document.querySelector("#role-categories-table tbody"),
  selectAllRoleCategories: document.getElementById("select-all-role-categories"),
  bulkDeleteRoleCategoriesBtn: document.getElementById("bulk-delete-role-categories-btn"),
  roleCategoryModalTitle: document.getElementById("role-category-modal-title"),
  roleCategoryId: document.getElementById("role-category-id"),
  roleCategoryName: document.getElementById("role-category-name"),
  roleCategoryDeleteBtn: document.getElementById("role-category-delete-modal"),

  // Event Editor
  eventForm: document.getElementById("event-form"),
  eventId: document.getElementById("event-id"),
  eventModalTitle: document.getElementById("event-modal-title"),
  eventTitle: document.getElementById("event-title"),
  eventEventType: document.getElementById("event-type"),
  eventStatus: document.getElementById("event-status"),
  eventStart: document.getElementById("event-start"),
  eventEnd: document.getElementById("event-end"),
  eventColor: document.getElementById("event-color"),
  eventLocation: document.getElementById("event-location"),
  eventDescription: document.getElementById("event-description"),
  assignmentList: document.getElementById("assignment-list"),
  equipmentList: document.getElementById("equipment-list"),
  eventDeleteModal: document.getElementById("event-delete-modal"),

  // Modals
  employeeModalTitle: document.getElementById("employee-modal-title"),
  employeeId: document.getElementById("employee-id"),
  employeeFirst: document.getElementById("employee-first"),
  employeeLast: document.getElementById("employee-last"),
  employeeEmail: document.getElementById("employee-email"),
  employeePhone: document.getElementById("employee-phone"),
  employeeActive: document.getElementById("employee-active"),
  employeeDeleteModal: document.getElementById("employee-delete-modal"),
  employeeRoles: document.getElementById("employee-roles"),
  employeeRolePicker: document.getElementById("employee-role-picker"),
  employeeRoleChips: document.getElementById("employee-role-chips"),

  // Inventory Item Modal
  inventoryId: document.getElementById("inventory-id"),
  inventorySku: document.getElementById("inventory-sku"),
  inventoryName: document.getElementById("inventory-name"),
  inventoryCategory: document.getElementById("inventory-category"),
  inventoryWarehouse: document.getElementById("inventory-warehouse"),
  inventoryTotal: document.getElementById("inventory-total"),
  inventoryReserved: document.getElementById("inventory-reserved"),
  inventoryStatus: document.getElementById("inventory-status"),
  inventoryDeleteModal: document.getElementById("inventory-delete-modal"),

  selectAllInventoryCategories: document.getElementById("select-all-inventory-categories"),
  bulkDeleteInventoryCategoriesBtn: document.getElementById("bulk-delete-inventory-categories-btn"),
  inventoryCategoryModalTitle: document.getElementById("inventory-category-modal-title"),
  inventoryCategoryId: document.getElementById("inventory-category-id"),
  inventoryCategoryName: document.getElementById("inventory-category-name"),
  inventoryCategoryDeleteBtn: document.getElementById("inventory-category-delete-modal"),

  confirmMessage: document.getElementById("confirm-message"),
  confirmAccept: document.getElementById("confirm-accept")
};

export const ui = {
  employeeModal: null,
  roleModal: null,
  roleCategoryModal: null,
  inventoryModal: null,
  inventoryCategoryModal: null,
  masterCalendarModal: null,
  confirmModal: null
};

export const STATUS_COLORS = {
  PLANNED: "#3b82f6",
  CONFIRMED: "#f59e0b",
  IN_PROGRESS: "#22c55e",
  COMPLETED: "#6b7280",
  CANCELED: "#ef4444"
};

export const VIEW_TITLES = {
  overview: "Overview",
  "status-board": "Crew Status Board",
  projects: "Project Register",
  "project-editor": "Project Editor",
  crew: "Crew Directory",
  warehouse: "Warehouse"
};

export const ADMIN_ACTIONS = new Set([
  "open-event-create",
  "open-event-edit",
  "open-employee-create",
  "open-employee-edit",
  "open-role-create",
  "open-role-edit",
  "open-role-category-create",
  "open-role-category-edit",
  "open-inventory-create",
  "open-inventory-edit",
  "open-inventory-category-create",
  "open-inventory-category-edit",
  "bulk-delete-projects",
  "bulk-delete-crew",
  "bulk-delete-inventory",
  "bulk-delete-roles",
  "bulk-delete-role-categories",
  "bulk-delete-inventory-categories",
  "delete-event",
  "delete-event-current",
  "delete-employee",
  "delete-employee-current",
  "delete-role",
  "delete-role-current",
  "delete-role-category",
  "delete-role-category-current",
  "delete-inventory",
  "delete-inventory-current",
  "delete-inventory-category",
  "assignment-add",
  "assignment-autocrew",
  "assignment-autohours",
  "assignment-remove",
  "equipment-add",
  "equipment-suggest",
  "equipment-remove",
  "employee-role-add",
  "employee-role-remove"
]);
