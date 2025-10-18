import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center p-3">
        <p>
          &copy; {new Date().getFullYear()} Smart Parking. Todos los derechos
          reservados.
        </p>
      </footer>
    </>
  );
};
