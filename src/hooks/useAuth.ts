import { useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authService } from "@/services/authService";
import { handleAxiosError } from "@/utils/handleAxiosError";

interface LoginCredentials {
  userName: string;
  password: string;
}

interface AuthHook {
  checkToken: () => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  getInfoUser: () => { id: number; fullName: string } | null;
}

const useAuth = (): AuthHook => {
  const navigate = useNavigate();

  const checkToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.checkToken();
      return response ?? false;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log("🔒 Cerrando sesión...");
      await authService.logoutService();
      toast.success("Sesión cerrada exitosamente");
      sessionStorage.clear();
      localStorage.clear();
      navigate("/login", { replace: true });
      // Forzar recarga completa para limpiar todo
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Ocurrió un error al cerrar sesión");
    }
  }, [navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<any> => {
      try {
        console.log("🔐 Iniciando sesión con:", credentials.userName);
        const response = await authService.loginService(credentials);
        console.log("✅ Login exitoso:", response);

        if (response?.id) {
          sessionStorage.setItem("user", JSON.stringify(response));
        }

        // IMPORTANTE: Esperar un momento para que las cookies se establezcan
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Redirigir directamente
        navigate("/specialities", { replace: true });

        return response;
      } catch (error) {
        handleAxiosError(error, "Error al iniciar sesión");
        throw error;
      }
    },
    [navigate]
  );

  const getInfoUser = useCallback((): {
    id: number;
    fullName: string;
  } | null => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }, []);

  return {
    checkToken,
    login,
    logout,
    getInfoUser,
  };
};

export default useAuth;
