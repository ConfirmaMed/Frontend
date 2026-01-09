import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = () => {
  const { checkToken } = useAuth();
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean | null;
    isLoading: boolean;
  }>({
    isAuthenticated: null,
    isLoading: true,
  });

  const hasCheckedRef = useRef(false);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Si ya verificamos para esta ruta, no hacer nada
    if (
      hasCheckedRef.current &&
      previousPathRef.current === location.pathname
    ) {
      return;
    }

    hasCheckedRef.current = true;
    previousPathRef.current = location.pathname;

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const verifyAuthentication = async () => {
      try {
        console.log(`🔐 Verificando token para: ${location.pathname}`);

        // Pequeño delay para asegurar que las cookies estén listas
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isAuthenticated = await checkToken();
        console.log(`✅ Resultado verificación: ${isAuthenticated}`);

        if (isMounted) {
          setAuthState({
            isAuthenticated,
            isLoading: false,
          });

          if (!isAuthenticated) {
            console.log(
              `🚫 No autenticado, redirigiendo desde: ${location.pathname}`
            );
            toast.error("Sesión no válida o expirada");
          }
        }
      } catch (error) {
        console.error("❌ Error en verificación:", error);

        // Reintentar una vez si falla
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`🔄 Reintento ${retryCount}/${maxRetries}`);
          setTimeout(verifyAuthentication, 300);
          return;
        }

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
  }, [checkToken, location.pathname]);

  // Mostrar spinner mientras carga
  if (authState.isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex items-center flex-col">
          <Spinner className="w-28 h-28" />
          <p className="font-poppins mt-1 font-semibold">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (authState.isAuthenticated === false) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          redirectMessage:
            "Necesitas iniciar sesión para acceder a esta página",
        }}
      />
    );
  }

  // Si está autenticado, mostrar el contenido
  return <Outlet />;
};

export default ProtectedRoute;
