import axios from "axios";
// import { toast } from "sonner"; 

const axiosService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // Aumenté el timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Esto es crucial para cookies
});

// // Interceptor de respuesta
// axiosService.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       if (error.response.status === 401) {
//         // Solo redirigir si no estamos ya en login
//         if (!window.location.pathname.includes('/login')) {
//           // Limpiar localStorage/sessionStorage si es necesario
//           sessionStorage.removeItem("user");
//           window.location.href = "/login";
//         }
//       }

//       if (error.response.status === 403) {
//         toast.error("No tienes permiso para acceder a este recurso");
//       }

//       if (error.response.status >= 500) {
//         console.error("Error del servidor:", error.response.data);
//         toast.error("Error del servidor. Por favor, intente más tarde");
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosService;
