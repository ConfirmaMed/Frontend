import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

const PublicRoute = () => {
  const { checkToken } = useAuth();
  const location = useLocation();
  const [authState, setAuthState] = useState({
    isAuthenticated: null as boolean | null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const verifyAuthentication = async () => {
      try {
        const isAuthenticated = await checkToken();

        if (isMounted) {
          setAuthState({
            isAuthenticated,
            isLoading: false,
          });

          if (isAuthenticated) {
            toast.success("Ya tienes una sesión activa");
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    setTimeout(() => {
      verifyAuthentication();
    }, 100);

    return () => {
      isMounted = false;
    };
  }, [checkToken, location.pathname]);

  if (authState.isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex items-center flex-col">
          <Spinner className="w-28 h-28" />
          <p className="font-poppins mt-1 font-semibold">
            Verificando permisos del usuario...
          </p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir a la página principal o a la que intentaba acceder
  if (authState.isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/specialities";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
