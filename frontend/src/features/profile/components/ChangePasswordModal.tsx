import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { changePassword } from '../api/profileApi';
import type { ChangePasswordData } from './types/profileTypes';

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

// Define las propiedades que este componente aceptará
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  // Estados para manejar los campos del formulario
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para manejar la UI durante la llamada a la API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validación básica inicial
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada a la API para cambiar la contraseña
      const data: ChangePasswordData = {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: confirmPassword,
      };
      await changePassword(data);
      // Si la llamada es exitosa, se cierra el modal
      onClose();
      // Mensaje de exitosa
      alert('¡Contraseña actualizada con éxito!');
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      let message = 'Ocurrió un error al cambiar la contraseña.';
      // Usamos el type guard para extraer el mensaje de error de la API
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
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Contraseña">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Campo Contraseña Antigua */}
          <div>
            <label
              htmlFor="oldPassword"
              className="mb-2 block font-sans text-sm font-medium text-text-main"
            >
              Contraseña Antigua
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Campo Nueva Contraseña */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block font-sans text-sm font-medium text-text-main"
            >
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Campo Confirmar Nueva Contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-sans text-sm font-medium text-text-main"
            >
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mt-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 font-sans text-sm font-bold text-gray-800 transition-colors hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
