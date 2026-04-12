import axios from "axios";
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  //   baseURL: "https://belidjo-production.up.railway.app",
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
