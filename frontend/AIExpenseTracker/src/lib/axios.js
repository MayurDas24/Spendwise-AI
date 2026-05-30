//src/lib/axios.js
import axios from "axios";

// ======================================
// BASE API URL
// ======================================
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ======================================
// CREATE AXIOS INSTANCE
// ======================================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ======================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================
// RESPONSE INTERCEPTOR
// Handle unauthorized users
// ======================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;