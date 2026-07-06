// frontend/src/features/profile/components/ChangeEmailModal.tsx

import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { changeEmail } from '../api/profileApi';
import type { ChangeEmailData } from './types/profileTypes';

// Reutilizamos las interfaces de manejo de errores del ChangePasswordModal para consistencia.
interface ApiErrorData {
  [key: string]: string[];
}

interface ApiError {
  response?: {
    data?: ApiErrorData;
  };
}

const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ApiError).response?.data === 'object'
  );
};

// Define las propiedades que el componente recibirá:
// isOpen: un booleano para controlar si el modal está visible.
// onClose: una función para cerrar el modal desde el componente padre.
interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeEmailModal = ({
  isOpen,
  onClose,
}: ChangeEmailModalProps) => {
  // --- ESTADOS DEL COMPONENTE ---
  // Estados para manejar los valores de los campos del formulario.
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Estados para manejar la UI durante la llamada a la API.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- MANEJADOR DEL ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario.
    setError(null); // Limpiamos errores anteriores al iniciar un nuevo envío.
    setIsLoading(true); // Activamos el estado de carga.

    try {
      // Se crea el objeto de datos con la estructura en ChangeEmailData
      const data: ChangeEmailData = {
        password: password,
        new_email: newEmail,
      };

      // Llamamos a la función de la API.
      await changeEmail(data);
      
      // Si la llamada es exitosa, cerramos el modal.
      onClose();
      
      // Mostramos un mensaje de éxito al usuario.
      alert('¡Solicitud enviada! Revisa la consola del backend para obtener el enlace de confirmación.');
    } catch (err) {
      console.error('Error al solicitar el cambio de email:', err);
      let message = 'Ocurrió un error al solicitar el cambio de email.';

      // Usamos nuestro type guard para intentar extraer un mensaje de error más específico de la API.
      if (isApiError(err) && err.response?.data) {
        const { data } = err.response;
        // Tomamos el primer mensaje de error que venga del backend.
        const firstError = Object.values(data).flat()[0];
        if (typeof firstError === 'string') {
          message = firstError;
        }
      }
      setError(message); // Mostramos el mensaje de error en la UI.
    } finally {
      setIsLoading(false); // Se desactiva el estado de carga, tanto si hubo éxito como si hubo error.
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Correo Electrónico">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Campo Contraseña Actual */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-sans text-sm font-medium text-text-main"
            >
              Contraseña Actual
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Campo Nuevo Correo Electrónico */}
          <div>
            <label
              htmlFor="newEmail"
              className="mb-2 block font-sans text-sm font-medium text-text-main"
            >
              Nuevo Correo Electrónico
            </label>
            <input
              type="email"
              id="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
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
            {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
