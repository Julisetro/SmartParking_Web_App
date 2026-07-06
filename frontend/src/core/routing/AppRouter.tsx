import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from '../../pages/DashboardPage';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';
import ReservationsPage from '../../pages/ReservationsPage';
import { AppLayout } from '../layout/AppLayout';
import { PublicLayout } from '../layout/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Definición de las rutas de la aplicación.
 * Se utiliza createBrowserRouter para crear un enrutador.
 */
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'reservations', element: <ReservationsPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
