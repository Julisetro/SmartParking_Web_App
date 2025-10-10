import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ProfilePage } from '../../pages/ProfilePage';

/**
 * Componente de Layout Principal (RootLayout).
 * Define la estructura visual compartida en todas las páginas.
 * El componente Outlet es un marcador de posición especial de react-router-dom
 * que se reemplaza con el contenido de la ruta hija que coincida con la URL actual.
 */
const RootLayout = () => {
  return (
    <div>
      <header>
        <nav>
          {/*
            se utiliza clases de utilidad de Tailwind CSS en lugar de estilos en línea
            - "flex": para usar un contenedor flexbox.
            - "gap-4": añade un espacio de 1rem (16px) entre los elementos.
            - "list-none": elimina los estilos predeterminados de la lista.
            - "p-4": añade un padding de 1rem (16px) alrededor del contenedor.
            */}
          <ul className="flex gap-4 list-none p-4">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Registro</Link>
            </li>
            <li>
              <Link to="/profile">Perfil</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        {/*¨El componente de la página especifica se renderiza aquí */}
        <Outlet />
      </main>
    </div>
  );
};
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
