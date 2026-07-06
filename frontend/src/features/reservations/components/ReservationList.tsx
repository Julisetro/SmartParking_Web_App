import { useState } from 'react';
import type { Reserva } from '../types/reservationsTypes';
import QRCodeModal from './QRCodeModal';
import CancelConfirmationModal from './CancelConfirmationModal';
import { cancelReservation } from '../api/reservationsApi';

// Se definen los Props que el componente espera recibir.
interface ReservationListProps {
  reservations: Reserva[];
  refetchReservations: () => void;
}

/**
 * Componente presentacional para renderizar una lista de reservas.
 * También gestiona la visualización de los modales de QR y cancelación.
 */
const ReservationList = ({
  reservations,
  refetchReservations,
}: ReservationListProps) => {
  const [viewingQRCode, setViewingQRCode] = useState<string | null>(null);
  const [cancellingReservationId, setCancellingReservationId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si no hay reservas, muestra un mensaje indicándolo.
  if (reservations.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-text-main opacity-75">
          No tienes reservas activas en este momento.
        </p>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    if (!cancellingReservationId) return;

    setIsSubmitting(true);
    try {
      await cancelReservation(cancellingReservationId);
      refetchReservations(); // Recarga la lista para mostrar el estado actualizado.
      setCancellingReservationId(null); // Cierra el modal.
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      // Opcional: mostrar un toast de error al usuario.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {reservations.map((reservation) => {
          const currencyFormatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          });

          let formattedDate: string;
          try {
            const date = new Date(reservation.fecha);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            const dateFormatter = new Intl.DateTimeFormat('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            });
            formattedDate = dateFormatter.format(date);
          } catch {
            formattedDate = 'Fecha inválida';
          }

          const isCancellable = reservation.estado.nombre === 'Confirmada';

          const isQrVisible =
            reservation.estado.nombre === 'Confirmada' ||
            reservation.estado.nombre === 'En proceso';

          return (
            <div
              key={reservation.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-primary">
                  {formattedDate}
                </h3>

                <span
                  className={`text-sm font-semibold text-white px-3 py-1 rounded-full ${isCancellable ? 'bg-primary' : 'bg-gray-400'}`}
                >
                  {reservation.estado.nombre}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Hora de inicio</p>

                  <p className="font-medium">
                    {reservation.hora_inicio.split(':').slice(0, 2).join(':')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tarifa por hora</p>

                  <p className="font-medium">
                    {currencyFormatter.format(
                      parseFloat(reservation.tarifa_hora)
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                {isQrVisible && (
                  <button
                    onClick={() => setViewingQRCode(reservation.codigo_qr)}
                    className="px-4 py-2 rounded-md text-white bg-text-main hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Ver QR
                  </button>
                )}

                {isCancellable && (
                  <button
                    onClick={() => setCancellingReservationId(reservation.id)}
                    className="px-4 py-2 rounded-md text-red-600 border border-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <QRCodeModal
        isOpen={viewingQRCode !== null}
        onClose={() => setViewingQRCode(null)}
        qrCodeValue={viewingQRCode || ''}
      />

      <CancelConfirmationModal
        isOpen={cancellingReservationId !== null}
        onClose={() => setCancellingReservationId(null)}
        onConfirm={handleConfirmCancel}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ReservationList;
