import { Link, NavLink } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-medium transition-colors duration-300 ${
      isActive
        ? 'text-white underline underline-offset-4'
        : 'text-gray-200 hover:text-white'
    }`;

  return (
    <header className="bg-primary shadow-md">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Lado Izquierdo: Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="Logo de Smart Parking" className="h-12 w-12" />
          <span className="text-2xl font-bold text-white">Smart Parking</span>
        </Link>

        {/* Lado Derecho: Navegación y Menú de Usuario */}
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className={navLinkStyles}>
            Inicio
          </NavLink>
          <NavLink to="/reservations" className={navLinkStyles}>
            Reservas
          </NavLink>

          {/* Separador Visual */}
          <div className="h-6 w-px bg-gray-400 opacity-50"></div>

          <UserMenu />
        </div>
      </nav>
    </header>
  );
};
