import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { RootLayout } from '../layout/RootLayout';

/**
 * Definición de las rutas de la aplicación.
 * Se utiliza createBrowserRouter para crear un enrutador.
 */
const router = createBrowserRouter([
  {
    // Ruta raíz que utiliza el RootLayout como su elemento principal.
    path: '/',
    element: <RootLayout />,
    // Definición de las rutas hijas que se renderizan dentro del Outlet del RootLayout
    children: [
      {
        // La ruta index (/) que muestra la HomePage
        index: true,
        element: <HomePage />,
      },
      {
        // Ruta para la página de login
        path: '/login',
        element: <LoginPage />,
      },
      {
        // Ruta para la página de registro
        path: '/register',
        element: <RegisterPage />,
      },
      {
        // Ruta para la página de perfil
        path: '/profile',
        element: <ProfilePage />,
      },
    ],
  },
]);
/**
 * Componente principal de enrutamiento de la aplicación.
 * Proporciona el enrutador a la aplicación mediante el componente RouterProvider.
 */
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
