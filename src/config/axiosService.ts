import axios from "axios";
import { navigate } from "@/lib/navigation";

const axiosService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ? Interceptor para para las cookies
axiosService.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosService.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        navigate("/login");
      }

      if (error.response.status === 403) {
        alert("No tienes permiso para acceder a este recuros");
      }

      if (error.response.status >= 500) {
        console.error(error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosService;
