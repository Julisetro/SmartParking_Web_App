import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const HomePage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-brand">
      <div className="text-center">
        <img
          src={logo}
          alt="Logo de Smart Parking"
          className="mx-auto mb-6 h-40 w-40"
        />
        <h1 className="text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
          Smart Parking
        </h1>
        <h2 className="mt-4 text-2xl font-medium text-white/90 drop-shadow-md">
          ¡Bienvenido!
        </h2>
        <p className="mt-2 text-base font-normal text-white/80 drop-shadow-md">
          Gestiona tus reservas de estacionamiento de forma sencilla y rápida.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="rounded-lg bg-white px-8 py-3 text-base font-medium text-primary shadow-md transition-all duration-200
            hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-primary hover:scale-105"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="rounded-lg border-2 border-white px-8 py-3 text-base font-medium text-white-transition-all duration-200
            hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-primary hover:scale-105"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
};
