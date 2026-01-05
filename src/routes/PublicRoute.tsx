import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PublicRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Si está autenticado, redirigir a la página desde donde vino o al dashboard
  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/specialities";
    return <Navigate to={redirectTo} replace />;
  }

  // Si no está autenticado, permitir acceso a la ruta pública
  return <Outlet />;
}

export default PublicRoute
