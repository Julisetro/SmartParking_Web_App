import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { UserMenu } from './UserMenu';

export const Header = () => {
  return (
    <header className="bg-primary shadow-md">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="Logo de Smart Parking" className="h-12 w-12" />
          <span className="text-2xl font-bold text-white">Smart Parking</span>
        </Link>
        <UserMenu />
      </nav>
    </header>
  );
};
