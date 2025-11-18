import type { Reserva } from '../types/reservationsTypes';

// Se definen los Props que el componente espera recibir.
interface ReservationListProps {
  reservations: Reserva[];
}

/**
 * Componente presentacional para renderizar una lista de reservas.
 *
 * Recibe una lista de reservas a través de sus props y se encarga
 * únicamente de mostrarlas, alineado con el sistema de diseño del proyecto.
 *
 * @param {ReservationListProps} props - Los props del componente, incluyendo la lista de reservas.
 */
const ReservationList = ({ reservations }: ReservationListProps) => {
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

  // Si hay reservas, las mapea y renderiza cada una en una "tarjeta".
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="bg-background p-4 rounded-lg shadow"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-text-main">
              Reserva #{reservation.id}
            </h3>
            <span className="text-sm font-medium text-white bg-primary px-2 py-1 rounded-full">
              {reservation.estado.nombre}
            </span>
          </div>
          <div className="mt-2 text-text-main">
            <p>
              <strong>Fecha:</strong>{' '}
              {new Date(reservation.fecha).toLocaleDateString()}
            </p>
            <p>
              <strong>Hora de inicio:</strong> {reservation.hora_inicio}
            </p>
            <p>
              <strong>Usuario:</strong> {reservation.user}
            </p>
            <p>
              <strong>Código QR:</strong> {reservation.codigo_qr}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationList;
