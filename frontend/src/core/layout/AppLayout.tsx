import { Link, Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-text-main">
      <header className="bg-primary text-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="text-2xl font-bold">
            Smart Parking
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/login"
                className="hover:text-primary-light transition-colors"
              >
                Iniciar Sesión
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-primary-light transition-colors"
              >
                Registrarse
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {/** El componente de la página especifica se renderiza aquí **/}
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>
          &copy; {new Date().getFullYear()} Smart Parking. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
};
