import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  // Caso 1: Cargando el estado de autenticación
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Caso 2: Carga finalizada y no hay usuario autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Caso 3: Carga finalizada y hay usuario autenticado
  return <Outlet />;
};
