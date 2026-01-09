import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

const PublicRoute = () => {
  const { checkToken } = useAuth();
  const location = useLocation();
  const [authState, setAuthState] = useState({
    isAuthenticated: null as boolean | null,
    isLoading: true,
  });

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples verificaciones
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    let isMounted = true;

    const verifyAuthentication = async () => {
      try {
        // Esperar un momento para que las cookies se sincronicen
        await new Promise(resolve => setTimeout(resolve, 150));

        const isAuthenticated = await checkToken();

        if (isMounted) {
          setAuthState({
            isAuthenticated,
            isLoading: false,
          });

          // Solo mostrar mensaje si está autenticado y NO estamos en una redirección desde logout
          if (isAuthenticated && !location.state?.fromLogout) {
            toast.success("Ya tienes una sesión activa");
          }
        }
      } catch (error) {
        console.error("Error en verificación pública:", error);
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    verifyAuthentication();

    return () => {
      isMounted = false;
    };
  }, [checkToken, location.state]);

  if (authState.isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex items-center flex-col">
          <Spinner className="w-28 h-28" />
          <p className="font-poppins mt-1 font-semibold">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // Si está autenticado, redirigir a la página principal
  if (authState.isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/specialities";
    console.log(`🔀 Redirigiendo usuario autenticado a: ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  // Si no está autenticado, mostrar la ruta pública
  return <Outlet />;
};

export default PublicRoute;
