import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from '../../pages/DashboardPage';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { AppLayout } from '../layout/AppLayout';
import { PublicLayout } from '../layout/PublicLayout';

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
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
