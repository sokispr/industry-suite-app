const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

// Αντικατέστησε το παρακάτω URL με αυτό που θα σου δώσει το Render για το backend (π.χ. https://my-backend.onrender.com/api)
export const API_BASE_URL = isLocal
  ? "http://localhost:8081/api"
  : "https://your-render-backend-url.onrender.com/api";

export const USER_ROLE_STORAGE_KEY = "industry-app-user-role";
