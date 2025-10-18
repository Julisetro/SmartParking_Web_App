import { useAuth } from '../features/auth/hooks/useAuth';

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

export const DashboardPage = () => {
  const { user } = useAuth();

  // Cláusula de guardia para evitar renderizar el componente si no hay un usuario autenticado.
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

      {/* Grid principal para las tarjetas de información */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta de Reserva Actual */}
        <div className="lg:col-span-2">
          <DashboardCard title="Tu Próxima Reserva">
            <p>
              Actualmente no tienes ninguna reserva programada. ¡Dirígete a la
              sección de reservas para planificar tu próxima visita!
            </p>
            <button className="mt-4 rounded-md bg-primary px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-primary-dark">
              Crear Reserva
            </button>
          </DashboardCard>
        </div>

        {/* Tarjeta de Horarios */}
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

        {/* Tarjeta de Notificaciones */}
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
