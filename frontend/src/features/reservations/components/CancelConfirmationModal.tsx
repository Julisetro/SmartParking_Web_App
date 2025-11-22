// src/features/reservations/components/CancelConfirmationModal.tsx

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

/**
 * Componente modal para confirmar la cancelación de una reserva.
 * 
 * @param {CancelConfirmationModalProps} props - Propiedades para controlar el modal.
 * @returns {JSX.Element | null} El modal de confirmación o null si no está abierto.
 */
const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, isSubmitting }: CancelConfirmationModalProps): JSX.Element | null => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text-main text-center">
          Confirmar Cancelación
        </h2>
        <p className="text-base text-gray-600 text-center">
          ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-center gap-4 w-full">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Cancelando...' : 'Sí, Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
