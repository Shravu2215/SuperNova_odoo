// One shared axios instance for talking to the backend.
// Import anywhere:  import { api } from "@/lib/api";
// Then:  api.get("/auth/me")  →  calls  http://localhost:5000/api/auth/me
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach the login token to EVERY request.
// You never have to think about tokens again after login.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
