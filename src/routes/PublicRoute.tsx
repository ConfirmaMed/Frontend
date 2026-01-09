import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";

const PublicRoute = () => {
  const { checkToken } = useAuth();
  const location = useLocation();

  const hasCheckedAuth = useRef(false);
  const hasShownToast = useRef(false);

  const [authState, setAuthState] = useState({
    isAuthenticated: null as boolean | null,
    isLoading: true,
  });

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const verifyAuthentication = async () => {
      try {
        const isAuthenticated = await checkToken();

        setAuthState({
          isAuthenticated,
          isLoading: false,
        });

        if (isAuthenticated && !hasShownToast.current) {
          toast.success("Ya tienes una sesión activa");
          hasShownToast.current = true;
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    verifyAuthentication();
  }, [checkToken]);

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

  if (authState.isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/specialities";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
