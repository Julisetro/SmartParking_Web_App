import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';

// Interfaz que describe la estructura de datos de un error de la API
interface ApiErrorData {
  [key: string]: string[];
}

// Interfaz que describe un objeto de error similar a Axios
interface ApiError {
  response?: {
    data?: ApiErrorData;
  };
}

// Type Guard: una función que comprueba si 'error' es un ApiError
const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ApiError).response?.data === 'object'
  );
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    cedula: '',
    celular: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/login', {
        state: { message: '¡Registro exitoso! Ahora puedes iniciar sesión.' },
      });
    } catch (err) {
      console.error('Error durante el registro:', err);

      let message = 'Ocurrió un error durante el registro.';

      // Usamos el type guard. Si devuelve true, TypeScript sabe que 'err' es de tipo ApiError
      if (isApiError(err) && err.response?.data) {
        const { data } = err.response;
        const firstError = Object.values(data).flat()[0];
        if (typeof firstError === 'string') {
          message = firstError;
        }
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-brand py-12">
      <div className="w-full max-w-md rounded-lg bg-background p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-main">
          Crear Cuenta
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Campos del formulario */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block font-bold text-text-main"
              >
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="mb-2 block font-bold text-text-main"
              >
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="email"
              className="mb-2 block font-bold text-text-main"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          {/* ... más campos ... */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="cedula"
                className="mb-2 block font-bold text-text-main"
              >
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                id="cedula"
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="celular"
                className="mb-2 block font-bold text-text-main"
              >
                Celular
              </label>
              <input
                type="text"
                name="celular"
                id="celular"
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="password"
              className="mb-2 block font-bold text-text-main"
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-bold text-text-main"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
