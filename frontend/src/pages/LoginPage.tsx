import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('El estado de autenticación ha cambiado:', user);
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      // La redirección se manejará con el useEffect de arriba
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('El correo electrónico o la contraseña son incorrectos.');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-brand">
      <div className="w-full max-w-md rounded-lg bg-background p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-main">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block font-bold text-text-main"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block font-bold text-text-main"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};
