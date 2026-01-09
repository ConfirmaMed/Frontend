import { useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authService } from "@/services/authService";
import { handleAxiosError } from "@/utils/handleAxiosError";

interface LoginCredentials {
  userName: string;
  password: string;
}

let authCache: boolean | null = null;

interface AuthHook {
  checkToken: () => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  getInfoUser: () => { id: number; fullName: string } | null;
}

const useAuth = (): AuthHook => {
  const navigate = useNavigate();

  const checkToken = useCallback(async (): Promise<boolean> => {
    // 🔒 Si ya se verificó, no volver a pegarle al backend
    if (authCache !== null) {
      return authCache;
    }

    try {
      const response = await authService.checkToken();
      authCache = response ?? false;
      return authCache;
    } catch (error) {
      console.error("Error verifying token:", error);
      authCache = false;
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logoutService();
      toast.success("Sesión cerrada exitosamente");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Ocurrió un error al cerrar sesión");
      throw error;
    }
  }, [navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<any> => {
      try {
        const response = await authService.loginService(credentials);
        sessionStorage.setItem("user", JSON.stringify(response));
        return response;
      } catch (error) {
        handleAxiosError(error, "Error al iniciar sesión");
      }
    },
    []
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
