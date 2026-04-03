const BASE_URL = "http://localhost:8081/api";

async function request(endpoint, options = {}) {
  const { body, ...restOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": getUserRole(),
    ...options.headers
  };

  const config = {
    ...restOptions,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(BASE_URL + endpoint, config);

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || "Unexpected server error";
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Events
  listEvents: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());
    return request(`/events?${params.toString()}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request("/events", { method: "POST", body: data }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: "PUT", body: data }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),

  // Employees
  listEmployees: () => request("/employees"),
  createEmployee: (data) => request("/employees", { method: "POST", body: data }),
  updateEmployee: (id, data) => request(`/employees/${id}`, { method: "PUT", body: data }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),

  // Warehouses
  listWarehouses: () => request("/warehouses"),

  // Roles
  listRoles: () => request("/roles"),
  createRole: (data) => request("/roles", { method: "POST", body: data }),
  updateRole: (id, data) => request(`/roles/${id}`, { method: "PUT", body: data }),
  deleteRole: (id) => request(`/roles/${id}`, { method: "DELETE" }),

  // Role Categories
  listRoleCategories: () => request("/roles/categories"),
  createRoleCategory: (data) => request("/roles/categories", { method: "POST", body: data }),
  updateRoleCategory: (id, data) => request(`/roles/categories/${id}`, { method: "PUT", body: data }),
  deleteRoleCategory: (id) => request(`/roles/categories/${id}`, { method: "DELETE" }),

  // Inventory Items
  listInventory: () => request("/inventory"),
  createInventoryItem: (data) => request("/inventory", { method: "POST", body: data }),
  updateInventoryItem: (id, data) => request(`/inventory/${id}`, { method: "PUT", body: data }),
  deleteInventoryItem: (id) => request(`/inventory/${id}`, { method: "DELETE" }),

  // Inventory Categories
  listInventoryCategories: () => request("/inventory/categories"),
  createInventoryCategory: (data) => request("/inventory/categories", { method: "POST", body: data }),
  updateInventoryCategory: (id, data) => request(`/inventory/categories/${id}`, { method: "PUT", body: data }),
  deleteInventoryCategory: (id) => request(`/inventory/categories/${id}`, { method: "DELETE" })
};

export function getUserRole() {
  return localStorage.getItem("userRole") || "VIEWER";
}

export function setUserRole(role) {
  localStorage.setItem("userRole", role);
}
