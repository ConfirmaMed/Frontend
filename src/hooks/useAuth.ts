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
      console.log("🔍 checkToken llamado");
      const response = await authService.checkToken();
      console.log("✅ Respuesta de checkToken:", response);
      return response ?? false;
    } catch (error: any) {
      console.error("❌ Error en checkToken:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log("🚪 Ejecutando logout...");

      // 1. Primero, limpiar el frontend
      sessionStorage.clear();
      localStorage.clear();

      // 2. Luego notificar al backend
      await authService.logoutService();

      // 3. Mostrar mensaje
      toast.success("Sesión cerrada exitosamente");

      // 4. Redirigir con estado para evitar mensaje de "sesión activa"
      navigate("/login", {
        replace: true,
        state: { fromLogout: true },
      });

      // 5. Forzar recarga para limpiar completamente el estado
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error en logout:", error);
      // Aún así, limpiar el frontend
      sessionStorage.clear();
      localStorage.clear();
      navigate("/login", {
        replace: true,
        state: { fromLogout: true },
      });
    }
  }, [navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<any> => {
      try {
        console.log("🔐 Ejecutando login...");

        // Limpiar cualquier estado previo
        sessionStorage.clear();

        // Hacer login
        const response = await authService.loginService(credentials);
        console.log("✅ Login exitoso, respuesta:", response);

        // Guardar datos de usuario si vienen en la respuesta
        if (response) {
          sessionStorage.setItem("user", JSON.stringify(response));
        }

        // **IMPORTANTE**: Esperar a que las cookies se establezcan
        console.log("⏳ Esperando establecimiento de cookies...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Verificar que el token sea válido inmediatamente
        const isValid = await checkToken();
        console.log(
          `🔍 Verificación post-login: ${isValid ? "ÉXITO" : "FALLO"}`
        );

        if (isValid) {
          // Redirigir directamente sin pasar por verificación
          console.log("➡️ Redirigiendo a /specialities");
          navigate("/specialities", { replace: true });

          // Forzar un pequeño refresh para asegurar que todo se sincronice
          setTimeout(() => {
            window.location.href = "/specialities";
          }, 50);
        } else {
          throw new Error("La autenticación no se estableció correctamente");
        }

        return response;
      } catch (error) {
        console.error("❌ Error en login:", error);
        handleAxiosError(error, "Error al iniciar sesión");
        throw error;
      }
    },
    [navigate, checkToken]
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
