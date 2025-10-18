import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 font-sans text-text-main">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center p-3">
        <p>
          &copy; {new Date().getFullYear()} Smart Parking. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
};
