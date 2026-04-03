# Program Index

## Purpose
This document is the operational index for the new platform version. It describes every frontend script, the main frontend functions, and every backend class/interface so maintenance can stay predictable.

## Runtime Modules
- `backend` -> Spring Boot API on `:8081` with MySQL + Flyway migrations.
- `frontend` -> Bootstrap + FullCalendar client on static hosting (for example `python3 -m http.server 5500`).

## SQL Schema Index
- `roles` -> catalog of employee roles (`code`, `display_name`, `category`, `color_hex`, `system_role`).
- `employees` -> employee master records.
- `employee_roles` -> many-to-many link between employees and roles.
- `planned_events` -> timeline events with status and time window.
- `event_assignments` -> assignments of employees to events, with optional shift hours.
- `event_equipment_registers` -> equipment reservations per event.
- `inventory_items` -> stock, reserved quantity, and availability status.

## Frontend Scripts

### `frontend/js/config.js`
- `apiHost` -> resolves host for API calls and normalizes IPv6 host case.
- `API_BASE_URL` -> API root URL used by all requests.
- `USER_ROLE_STORAGE_KEY` -> localStorage key for current UI mode.

### `frontend/js/api.js`
- `getUserRole()` -> gets current mode (`VIEWER` or `ADMIN`) from localStorage.
- `setUserRole(role)` -> persists selected mode to localStorage.
- `request(path, options)` -> shared fetch wrapper, injects `X-User-Role` header, parses API errors.
- `api` object:
  - role CRUD: `listRoles`, `createRole`, `updateRole`, `deleteRole`.
  - employee CRUD: `listEmployees`, `createEmployee`, `updateEmployee`, `deleteEmployee`.
  - event CRUD: `listEvents`, `createEvent`, `updateEvent`, `deleteEvent`.
  - inventory CRUD: `listInventory`, `createInventoryItem`, `updateInventoryItem`, `deleteInventoryItem`.

### `frontend/js/app.js`

#### State and orchestration
- `STATUS_ORDER`, `STATUS_COLORS` -> visual ordering and status color policy.
- `VIEW_TITLES` -> mapping for view header titles.
- `ADMIN_ACTIONS` -> action IDs that require ADMIN privileges.
- `state` -> in-memory store for current view, datasets, calendar instance, and pending delete callback.
- `dom` -> centralized DOM references.
- `ui` -> Bootstrap modal instances.
- `ACTION_HANDLERS` -> button automation registry (maps `data-action` values to handlers).

#### Bootstrap functions
- `init()` -> startup sequence (modals, handlers, calendar, clock, initial data load).
- `initModals()` -> creates modal objects.
- `bindEvents()` -> wires global click delegation, filters, search, and form submit handlers.
- `initClock()` -> starts digital clock refresh timer.
- `renderClock()` -> updates sidebar clock.
- `initCalendar()` -> creates FullCalendar and binds select/event click editing behavior.

#### Data refresh and view rendering
- `refreshAll()` -> parallel load for roles, employees, events, inventory.
- `renderAll()` -> full page render pipeline.
- `setView(viewName)` -> switches visible pane and active nav state.
- `handleActionClick(event)` -> centralized dispatcher for all `data-action` buttons.
- `applyRoleMode()` -> applies ADMIN/VIEWER visual mode and action lock state.
- `applyActionPermissions()` -> marks admin-only buttons as locked in viewer mode (still clickable for guidance).
- `isAdminMode()` -> returns true for `ADMIN` mode.
- `requireAdminMode(message)` -> guard helper with warning feedback.

#### Render sections
- `renderStats()` -> overview KPI cards.
- `renderOverviewTable()` -> upcoming event rows.
- `renderOverviewWorkload()` -> category workload bars from role grouping.
- `renderCalendarEvents()` -> pushes filtered events to FullCalendar.
- `renderCrewLineup()` -> active employee cards with next assignment.
- `renderStatusBoard()` -> kanban columns by status.
- `renderProjectsTable()` -> searchable event register.
- `renderCrewGroups()` -> grouped employee list by role category.
- `renderCrewTable()` -> employee ledger with role badges and actions.
- `renderInventoryGroups()` -> grouped stock summaries.
- `renderInventoryTable()` -> inventory ledger with actions.
- `renderRolesTable()` -> role matrix (admin edits).
- `renderEmployeeRoleSelect()` -> fills multiselect role options in employee modal.
- `syncEmployeeRoleSelect()` -> keeps hidden role multiselect synchronized with role chips.
- `renderEmployeeRoleChips()` -> renders assigned-role chips with remove buttons.
- `addEmployeeRoleFromPicker()` -> adds selected role from picker into draft assignment set.
- `removeEmployeeRole(roleId)` -> removes role from employee draft assignment set.

#### Event modal and assignments
- `openEventById(id)` -> fetches event from state and opens modal.
- `openEventModal(eventItem, start, end)` -> create/edit event modal lifecycle.
- `addAssignmentRow(prefill)` -> adds employee assignment row in modal.
- `collectAssignments()` -> serializes assignment rows to payload.
- `addEquipmentRow(prefill)` -> adds equipment register row in modal.
- `collectEquipmentRegisters()` -> serializes equipment rows to payload.
- `saveEvent(submitEvent)` -> create/update event via API.

#### Employee modal
- `openEmployeeById(id)` -> opens selected employee.
- `openEmployeeModal(employee)` -> create/edit employee modal lifecycle.
- `saveEmployee(submitEvent)` -> create/update employee via API.

#### Role modal
- `openRoleById(id)` -> opens selected role.
- `openRoleModal(role)` -> create/edit role modal lifecycle.
- `saveRole(submitEvent)` -> create/update role via API.

#### Inventory modal
- `openInventoryById(id)` -> opens selected inventory item.
- `openInventoryModal(item)` -> create/edit inventory modal lifecycle.
- `saveInventoryItem(submitEvent)` -> create/update inventory item via API.

#### Delete flow
- `promptDeleteEvent(id)` -> stages event delete and opens confirm modal.
- `promptDeleteEmployee(id)` -> stages employee delete and opens confirm modal.
- `promptDeleteRole(id)` -> stages role delete and opens confirm modal.
- `promptDeleteInventoryItem(id)` -> stages inventory delete and opens confirm modal.
- `openConfirm(message)` -> shows centralized confirm modal.
- `executePendingDelete()` -> executes staged delete callback.

#### Partial refresh helpers
- `refreshEventsOnly()` -> refreshes event-dependent widgets.
- `refreshEmployeesAndEvents()` -> refreshes employee + event dependent widgets.
- `refreshRolesAndEmployees()` -> refreshes role-linked widgets.
- `refreshInventoryOnly()` -> refreshes inventory widgets.

#### Utility helpers
- `getEmployeeCategoryCounts()` -> aggregate counts for workload visual.
- `groupEmployeesByCategory()` -> grouped structure for crew panels.
- `showAlert(message, variant)` -> transient alert rendering.
- `formatDateTime(value)` -> UI datetime formatter.
- `toInputDateTime(value)` -> converts API DateTime to `datetime-local` input value.
- `toApiDateTime(value)` -> normalizes form datetime for API payload.
- `withAlpha(hexColor, alpha)` -> converts HEX colors to RGBA for calendar overlays.
- `escapeHtml(value)` -> output sanitization helper.

## Backend Class/Interface Index

### Entry and configuration
- `IndustryPlannerApplication` -> Spring Boot entrypoint.
- `WebConfig` -> CORS policy for `/api/**` routes.

### Common error layer
- `ApiError` (record) -> API error payload model.
- `GlobalExceptionHandler` -> centralized mapping for validation, status, and unexpected exceptions.

### Role domain
- `Role` -> JPA entity for role catalog.
- `RoleCategory` (enum) -> role category taxonomy.
- `RoleRepository` -> role data access.
- `RoleService` -> role business logic and validation.
- `RoleController` -> REST endpoints for role CRUD (ADMIN writes).
- `RoleCreateRequest` (record) -> create/update payload validation.
- `RoleResponse` (record) -> API role response model.

### Employee domain
- `Employee` -> JPA entity for personnel.
- `EmployeeRepository` -> employee data access.
- `EmployeeService` -> employee validation, role mapping, CRUD workflow.
- `EmployeeController` -> REST endpoints for employee CRUD (ADMIN writes).
- `EmployeeUpsertRequest` (record) -> create/update payload validation.
- `EmployeeResponse` (record) -> API employee response model.

### Event domain
- `PlannedEvent` -> JPA entity for timeline events.
- `EventAssignment` -> JPA entity linking events to employees with duty role.
- `EventEquipmentRegister` -> JPA entity for equipment lines reserved in an event.
- `EventStatus` (enum) -> lifecycle statuses and default colors.
- `PlannedEventRepository` -> event data access.
- `EventService` -> event validation, assignment mapping, CRUD workflow.
- `EventController` -> REST endpoints for event CRUD (ADMIN writes).
- `EventUpsertRequest` (record) -> create/update event payload.
- `EventAssignmentRequest` (record) -> assignment line payload.
- `EventEquipmentRegisterRequest` (record) -> equipment line payload.
- `EventResponse` (record) -> event API model.
- `EventAssignmentResponse` (record) -> assignment API model.
- `EventEquipmentRegisterResponse` (record) -> equipment API model.

### Inventory domain
- `InventoryItem` -> JPA entity for stock items.
- `InventoryStatus` (enum) -> inventory lifecycle states.
- `InventoryRepository` -> inventory data access.
- `InventoryService` -> inventory validation and CRUD workflow.
- `InventoryController` -> REST endpoints for inventory CRUD (ADMIN writes).
- `InventoryUpsertRequest` (record) -> create/update payload validation.
- `InventoryResponse` (record) -> inventory API response model.

## Migrations
- `V1__init_schema.sql` -> base schema creation.
- `V2__seed_data.sql` -> starter demo records.
- `V3__delete_cascade_improvements.sql` -> cascade delete updates for role/employee references.
- `V4__event_equipment_and_assignment_hours.sql` -> assignment hour columns and event equipment register table.

## UI Operation Notes
- All write actions are admin-guarded at both frontend and backend layers.
- Viewer mode remains fully navigable/read-only.
- Delete operations go through one centralized confirm modal and execute through `state.pendingDelete`.
- Timeline editing uses FullCalendar click/select and the event modal assignment grid.
