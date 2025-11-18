import ReservationList from "../features/reservations/components/ReservationList";
import { useReservations } from "../features/reservations/hooks/useReservations";

/**
 * Página que muestra la lista de reservas del usuario.
 * 
 * Este componente actúa como un "contenedor inteligente" que utiliza el hook
 * useReservations para obtener los datos y gestionar los estados de carga y error,
 * y luego pasa los datos al componente presentacional ReservationList.
 */
const ReservationsPage = () => {
  const { reservations, isLoading, error } = useReservations();

  // Muestra un mensaje de carga mientras se obtienen los datos.
  if (isLoading) {
    return <div className="text-center p-8">Cargando tus reservas...</div>;
  }

  // Muestra un mensaje de error si la petición falla.
  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error: {error}</p>
        <p>No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  // Renderiza la página con la lista de reservas.
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-text-main mb-6">Mis Reservas</h1>
      <ReservationList reservations={reservations} />
    </div>
  );
};

export default ReservationsPage;
