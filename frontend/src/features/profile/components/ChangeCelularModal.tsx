// frontend/src/features/profile/components/ChangeCelularModal.tsx

import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { changeCelular, changeCelularConfirm } from '../api/profileApi';
import type {
  ChangeCelularData,
  ChangeCelularConfirmData,
} from './types/profileTypes';

// Interfaz para manejar errores de la API, consistente con otros modales.
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

// Propiedas que el componente recibira.
// isOpen: Controla si el modal está visible.
// onClose: Función para cerrar el modal.
// onSuccess: Función para manejar la confirmación de cambio de celular.
interface ChangeCelularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeCelularModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ChangeCelularModalProps) => {
  // --- ESTADOS DEL COMPONENTE ---

  // Estado para controlar el paso actual del modal: 'request' o 'confirm'.
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  // Estados para los campos del formulario del primer paso.
  const [password, setPassword] = useState('');
  const [newCelular, setNewCelular] = useState('');
  // Estado para el campo del formulario del segundo paso.
  const [verificationCode, setVerificationCode] = useState('');

  // Estados para la UI: carga y mensajes de error.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- MANEJADORES DE EVENTOS ---

  // Se ejecuta al enviar el formulario del primer paso (solicitud).
  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data: ChangeCelularData = {
        password,
        new_celular: newCelular,
      };
      // Llama a la API para solicitar el cambio.
      await changeCelular(data);
      // Si la solicitud es exitosa, avanza al siguiente paso.
      setStep('confirm');
    } catch (err) {
      // Manejo de errores de la API.
      let message = 'Ocurrió un error al solicitar el cambio.';
      if (isApiError(err) && err.response?.data) {
        const firstError = Object.values(err.response.data).flat()[0];
        message = typeof firstError === 'string' ? firstError : message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Se ejecuta al enviar el formulario del segundo paso (confirmación).
  const handleSubmitConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data: ChangeCelularConfirmData = {
        verification_code: verificationCode,
      };
      // Llama a la API para confirmar el cambio con el código.
      await changeCelularConfirm(data);
      // Si la confirmación es exitosa, ejecuta la función onSuccess y cierra el modal.
      onSuccess();
      handleClose(); // Cierra y resetea el modal.
    } catch (err) {
      // Manejo de errores de la API.
      let message = 'Ocurrió un error al confirmar el código.';
      if (isApiError(err) && err.response?.data) {
        const firstError = Object.values(err.response.data).flat()[0];
        message = typeof firstError === 'string' ? firstError : message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetea todos los estados internos y llama a la función onClose del padre.
  const handleClose = () => {
    onClose(); // Cierra el modal.
    // Espera un poco para que la animación de cierre termine antes de resetear.
    setTimeout(() => {
      setStep('request');
      setPassword('');
      setNewCelular('');
      setVerificationCode('');
      setError(null);
      setIsLoading(false);
    }, 300); // 300ms es un tiempo de transición común.
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'request'
          ? 'Cambiar Número de Celular'
          : 'Confirmar Código de Verificación'
      }
    >
      {/* Renderizado condicional basado en el paso actual */}
      {step === 'request' ? (
        // Formulario del primer paso
        <form onSubmit={handleSubmitRequest}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-main"
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
            <div>
              <label
                htmlFor="newCelular"
                className="mb-2 block text-sm font-medium text-text-main"
              >
                Nuevo Número de Celular
              </label>
              <input
                type="tel"
                id="newCelular"
                value={newCelular}
                onChange={(e) => setNewCelular(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          {/* Botones de acción para el primer paso */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </div>
        </form>
      ) : (
        // Formulario del segundo paso
        <form onSubmit={handleSubmitConfirm}>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Introduce el código de 6 dígitos que hemos enviado (por consola) a
              tu nuevo número de celular.
            </p>
            <div>
              <label
                htmlFor="verificationCode"
                className="mb-2 block text-sm font-medium text-text-main"
              >
                Código de Verificación
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] text-text-main transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          {/* Botones de acción para el segundo paso */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Confirmando...' : 'Confirmar y Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Área común para mostrar errores */}
      {error && (
        <div className="mt-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
    </Modal>
  );
};
