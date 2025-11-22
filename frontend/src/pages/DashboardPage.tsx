import { useAuth } from '../features/auth/hooks/useAuth';
import { useReservations } from '../features/reservations/hooks/useReservations';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

// Componente reutilizable para las tarjetas del dashboard
const DashboardCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg">
    <h3 className="text-xl font-bold text-text-main mb-4">{title}</h3>
    <div className="text-text-secondary">{children}</div>
  </div>
);

// Subcomponente para renderizar el contenido de la tarjeta "Próxima Reserva"
const NextReservationContent = () => {
  const { reservations, isLoading, error } = useReservations();

  const nextReservation = useMemo(() => {
    if (!reservations) return null;

    const upcomingReservations = reservations
      .filter(
        (r) =>
          r.estado.nombre === 'Confirmada' || r.estado.nombre === 'En proceso'
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora_inicio}`);
        const dateB = new Date(`${b.fecha}T${b.hora_inicio}`);
        return dateA.getTime() - dateB.getTime();
      });

    return upcomingReservations[0] || null;
  }, [reservations]);

  if (isLoading) {
    return <p>Cargando tu próxima reserva...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        No se pudo cargar la información de la reserva.
      </p>
    );
  }

  if (nextReservation) {
    const date = new Date(nextReservation.fecha);

    return (
      <div className="space-y-2">
        <p>
          <strong>Fecha:</strong>{' '}
          {isNaN(date.getTime())
            ? 'Fecha inválida'
            : date.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
        </p>
        <p>
          <strong>Hora:</strong>{' '}
          {nextReservation.hora_inicio.split(':').slice(0, 2).join(':')}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <span className="font-semibold text-primary">
            {nextReservation.estado.nombre}
          </span>
        </p>
        <Link to="/reservations" className="inline-block pt-2">
          <button className="mt-4 rounded-md bg-primary px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-primary-dark">
            Ver todas mis reservas
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <p>
        Actualmente no tienes ninguna reserva programada. ¡Dirígete a la sección
        de reservas para planificar tu próxima visita!
      </p>
      <Link to="/reservations">
        <button className="mt-4 rounded-md bg-primary px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-primary-dark">
          Crear Reserva
        </button>
      </Link>
    </>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-main">
          Bienvenido de vuelta, {user?.first_name || 'Usuario'}
        </h1>
        <p className="mt-1 text-lg text-text-secondary">
          Aquí tienes un resumen de tu actividad y las últimas noticias.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard title="Tu Próxima Reserva">
            <NextReservationContent />
          </DashboardCard>
        </div>

        <DashboardCard title="Horario de Funcionamiento">
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Lunes a Viernes</span>
              <span className="font-semibold">6:00 AM - 10:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sábados</span>
              <span className="font-semibold">8:00 AM - 8:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Domingos y Festivos</span>
              <span className="font-semibold text-red-600">Cerrado</span>
            </li>
          </ul>
        </DashboardCard>

        <div className="lg:col-span-3">
          <DashboardCard title="Noticias y Anuncios">
            <p>
              ¡Hemos lanzado nuestra nueva aplicación web! Ahora puedes
              gestionar tus reservas de estacionamiento de forma más fácil y
              rápida. Explora las nuevas funcionalidades y déjanos tus
              comentarios.
            </p>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
