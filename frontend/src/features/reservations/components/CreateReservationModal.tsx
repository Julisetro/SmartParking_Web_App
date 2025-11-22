// src/features/reservations/components/CreateReservationModal.tsx
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createReservation } from '../api/reservationsApi';

// Interfaz para definir las props que recibirá el componente del modal.
interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated: () => void; // Función para recargar la lista de reservas.
}

/**
 * Componente modal para la creación de una nueva reserva.
 * 
 * @param {CreateReservationModalProps} props - Propiedades para controlar el modal.
 * @returns {JSX.Element | null} El modal de creación de reserva o null si no está abierto.
 */
const CreateReservationModal = ({ isOpen, onClose, onReservationCreated }: CreateReservationModalProps): JSX.Element | null => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Si el modal no está abierto, no renderizamos nada.
  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Formateo de fecha y hora para que coincida con lo que espera el backend de Django.
      const formattedDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedTime = startDate.toTimeString().split(' ')[0]; // HH:MM:SS

      await createReservation({
        fecha: formattedDate,
        hora_inicio: formattedTime,
      });

      // Si la creación es exitosa, se recargan las reservas en la página principal y se cierra el modal.
      onReservationCreated();
      onClose();
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setSubmitError('No se pudo crear la reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estructura base del modal.
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo.
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre.
      >
        <h2 className="text-2xl font-bold text-text-main mb-6">Crear Nueva Reserva</h2>
        
        <form onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="res-date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de la Reserva
              </label>
              <DatePicker
                id="res-date"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="MMMM d, yyyy"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                minDate={new Date()}
              />
            </div>
            <div>
              <label htmlFor="res-time" className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio
              </label>
              <DatePicker
                id="res-time"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Hora"
                dateFormat="h:mm aa"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Tarifa por hora: <span className="font-semibold">$4,000 COP</span>
          </p>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!startDate || isSubmitting}
              className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationModal;
