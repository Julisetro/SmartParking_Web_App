import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../features/auth/context/AuthContext';
import type { User } from '../features/auth/context/AuthContext';
import type { AuthContextType } from '../features/auth/context/AuthContext';
import { DashboardPage } from './DashboardPage';
import * as useReservationsHook from '../features/reservations/hooks/useReservations';
import type { Reserva } from '../features/reservations/types/reservationsTypes';

// Mock del hook useReservations
vi.mock('../features/reservations/hooks/useReservations', () => ({
  useReservations: vi.fn(() => ({
    reservations: [],
    isLoading: false,
    error: null,
    refetchReservations: vi.fn(),
  })),
}));

// 1. Definimos un usuario simulado (mock) que imita la estructura de datos real.
const mockUser: User = {
  id: 1,
  email: 'john.doe@test.com',
  first_name: 'John',
  last_name: 'Doe',
  cedula: '123456789',
  celular: '3001234567',
};

const mockAuthContextValue: AuthContextType = {
  user: mockUser,
  accessToken: 'false-token',
  refreshToken: 'false-token',
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateUser: vi.fn(),
  isLoading: false,
};

// 2. Creamos una función de configuración (setup) para evitar repetir código.
// Esta función renderiza el DashboardPage con un contexto de autenticación simulado.
const setup = () => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <DashboardPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el mensaje de bienvenida con el nombre del usuario', () => {
    // Act: Renderizamos el componente con la configuración preparada.
    setup();

    // Assert: Verificamos que el mensaje de bienvenida se muestre correctamente.
    const welcomeMessage = screen.getByText(/Bienvenido de vuelta, John/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('debería renderizar las tarjetas de información principales', () => {
    // Act: Renderizamos el componente.
    setup();

    // Assert: Verificamos que los títulos de las tarjetas principales del dashboard estén presentes.
    const reservaCard = screen.getByRole('heading', {
      name: /Tu Próxima Reserva/i,
    });
    const horarioCard = screen.getByRole('heading', {
      name: /Horario de Funcionamiento/i,
    });
    const noticiasCard = screen.getByRole('heading', {
      name: /Noticias y Anuncios/i,
    });

    expect(reservaCard).toBeInTheDocument();
    expect(horarioCard).toBeInTheDocument();
    expect(noticiasCard).toBeInTheDocument();
  });

  it('no debería renderizar nada si el usuario no está presente en el contexto', () => {
    // Arrange: Simulamos un estado donde no hay usuario.
    const noUserContext: AuthContextType = {
      ...mockAuthContextValue,
      user: null,
    };

    // Act: Renderizamos el componente.
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={noUserContext}>
          <DashboardPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Assert: El componente no debería renderizar su contenido principal.
    expect(container).toBeEmptyDOMElement();
  });
});

describe('NextReservationContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga', () => {
    // Arrange: Mockeamos el hook para que devuelva isLoading: true
    vi.spyOn(useReservationsHook, 'useReservations').mockReturnValue({
      reservations: [],
      isLoading: true,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act
    setup();

    // Assert
    expect(
      screen.getByText(/Cargando tu próxima reserva.../i)
    ).toBeInTheDocument();
  });

  it('debe mostrar el estado de error', () => {
    // Arrange: Mockeamos el hook para que devuelva un error
    vi.spyOn(useReservationsHook, 'useReservations').mockReturnValue({
      reservations: [],
      isLoading: false,
      error: 'Fallo en la carga',
      refetchReservations: vi.fn(),
    });

    // Act
    setup();

    // Assert
    expect(
      screen.getByText(/No se pudo cargar la información de la reserva./i)
    ).toBeInTheDocument();
  });

  it('debe mostrar la próxima reserva cuando hay varias', () => {
    // Arrange
    const mockReservations: Reserva[] = [
      {
        id: 1,
        fecha: '2025-12-02',
        hora_inicio: '10:00:00',
        estado: { id: 1, nombre: 'Confirmada' },
        user: 'john.doe@test.com',
        codigo_qr: 'qr1',
        tarifa_hora: '4000.00',
        total_pago: '0.00',
        hora_salida: null,
        fecha_creacion: '',
        fecha_actualizacion: '',
      },
      {
        id: 2,
        fecha: '2025-12-01', // Esta es la próxima
        hora_inicio: '09:00:00',
        estado: { id: 1, nombre: 'Confirmada' },
        user: 'john.doe@test.com',
        codigo_qr: 'qr2',
        tarifa_hora: '4000.00',
        total_pago: '0.00',
        hora_salida: null,
        fecha_creacion: '',
        fecha_actualizacion: '',
      },
      {
        id: 3,
        fecha: '2025-11-30',
        hora_inicio: '08:00:00',
        estado: { id: 2, nombre: 'Finalizada' }, // Esta no cuenta
        user: 'john.doe@test.com',
        codigo_qr: 'qr3',
        tarifa_hora: '4000.00',
        total_pago: '8000.00',
        hora_salida: '2025-11-30T10:00:00Z',
        fecha_creacion: '',
        fecha_actualizacion: '',
      },
    ];

    vi.spyOn(useReservationsHook, 'useReservations').mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act
    setup();

    // Assert
    expect(screen.getByText(/1 de diciembre de 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Ver todas mis reservas/i })
    ).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay reservas próximas', () => {
    // Arrange
    const mockReservations: Reserva[] = [
      {
        id: 3,
        fecha: '2025-11-30',
        hora_inicio: '08:00:00',
        estado: { id: 2, nombre: 'Finalizada' }, // No hay activas
        user: 'john.doe@test.com',
        codigo_qr: 'qr3',
        tarifa_hora: '4000.00',
        total_pago: '8000.00',
        hora_salida: '2025-11-30T10:00:00Z',
        fecha_creacion: '',
        fecha_actualizacion: '',
      },
    ];
    vi.spyOn(useReservationsHook, 'useReservations').mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act
    setup();

    // Assert
    expect(
      screen.getByText(/Actualmente no tienes ninguna reserva programada/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Crear Reserva/i })
    ).toBeInTheDocument();
  });
});
