import { useState } from 'react';
import ReservationList from '../features/reservations/components/ReservationList';
import { useReservations } from '../features/reservations/hooks/useReservations';
import CreateReservationModal from '../features/reservations/components/CreateReservationModal';

/**
 * Página que muestra la lista de reservas del usuario.
 *
 * Este componente actúa como un "contenedor inteligente" que utiliza el hook
 * useReservations para obtener los datos y gestionar los estados de carga y error,
 * y luego pasa los datos al componente presentacional ReservationList.
 * También gestiona la apertura y cierre del modal de creación de reservas.
 */
const ReservationsPage = () => {
  const { reservations, isLoading, error, refetchReservations } =
    useReservations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Muestra un mensaje de carga mientras se obtienen los datos.
  if (isLoading) {
    return <div className="text-center p-8">Cargando tus reservas...</div>;
  }

  // Muestra un mensaje de error si la petición falla.
  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error: {error}</p>
        <p>
          No se pudieron cargar tus reservas. Por favor, intenta de nuevo más
          tarde.
        </p>
      </div>
    );
  }

  // Renderiza la página con una sección de creación fija y la lista de reservas.
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center text-center py-12 bg-gray-50 rounded-xl mb-8">
        <h2 className="text-2xl font-medium text-text-main">
          Gestiona tus reservas en un solo lugar
        </h2>
        <p className="text-base text-gray-600 mt-4 max-w-md mx-auto">
          Crea una nueva reserva para asegurar tu puesto o revisa el estado de
          tus reservas activas.
        </p>
        <button
          className="mt-8 bg-primary text-white font-medium text-lg py-3 px-8 rounded-lg shadow-md hover:bg-primary-dark transition-transform duration-300 ease-in-out transform hover:scale-105"
          onClick={openModal}
        >
          Crear Reserva
        </button>
      </div>

      <h1 className="text-3xl font-bold text-text-main mb-6">
        Mis Reservas
      </h1>

      <ReservationList
        reservations={reservations || []}
        refetchReservations={refetchReservations}
      />

      <CreateReservationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onReservationCreated={refetchReservations}
      />
    </div>
  );
};

export default ReservationsPage;
