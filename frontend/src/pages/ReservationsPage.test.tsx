import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useReservations } from '../features/reservations/hooks/useReservations';
import ReservationsPage from './ReservationsPage';
import type { Reserva } from '../features/reservations/types/reservationsTypes';

// Mock de hooks y componentes hijos
vi.mock('../features/reservations/hooks/useReservations');
vi.mock('../features/reservations/components/ReservationList', () => ({
  default: vi.fn(({ reservations }) => (
    <div data-testid="reservation-list">
      Reservations: {JSON.stringify(reservations)}
    </div>
  )),
}));
vi.mock('../features/reservations/components/CreateReservationModal', () => ({
  default: vi.fn(({ isOpen }) =>
    isOpen ? <div data-testid="create-reservation-modal">Modal Abierto</div> : null
  ),
}));

const mockUseReservations = useReservations as Mock;

describe('ReservationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar el estado de carga correctamente', () => {
    // Arrange: Configuramos el hook para que devuelva isLoading: true
    mockUseReservations.mockReturnValue({
      reservations: [],
      isLoading: true,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act: Renderizamos la página
    render(<ReservationsPage />);

    // Assert: Verificamos que se muestra el mensaje de carga
    expect(screen.getByText(/Cargando tus reservas.../i)).toBeInTheDocument();
  });

  it('debería mostrar el estado de error si falla la carga de datos', () => {
    // Arrange: Configuramos el hook para que devuelva un mensaje de error
    const errorMessage = 'Fallo en la conexión';
    mockUseReservations.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: errorMessage,
      refetchReservations: vi.fn(),
    });

    // Act
    render(<ReservationsPage />);

    // Assert: Verificamos que se muestra el mensaje de error
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(
      screen.getByText(/No se pudieron cargar tus reservas/i)
    ).toBeInTheDocument();
  });

  it('debería renderizar el contenido principal cuando los datos se cargan correctamente', () => {
    // Arrange: Configuramos el hook para que devuelva datos de reservas
    const mockReservations: Reserva[] = [
      { id: 1, fecha: '2025-12-01', hora_inicio: '10:00:00', estado: { nombre: 'Confirmada' }, user: 'test@test.com', codigo_qr: 'qr1', tarifa_hora: '4000', total_pago: '0', hora_salida: null, fecha_creacion: '', fecha_actualizacion: '' },
    ];
    mockUseReservations.mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act
    render(<ReservationsPage />);

    // Assert: Verificamos que los elementos principales están en el DOM
    expect(
      screen.getByRole('heading', { name: /Gestiona tus reservas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Crear Reserva/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Mis Reservas/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('reservation-list')).toBeInTheDocument();
  });

  it('debería pasar las reservas correctamente al componente ReservationList', () => {
    // Arrange
    const mockReservations: Reserva[] = [
      { id: 1, fecha: '2025-12-01', hora_inicio: '10:00:00', estado: { nombre: 'Confirmada' }, user: 'test@test.com', codigo_qr: 'qr1', tarifa_hora: '4000', total_pago: '0', hora_salida: null, fecha_creacion: '', fecha_actualizacion: '' },
      { id: 2, fecha: '2025-12-02', hora_inicio: '11:00:00', estado: { nombre: 'Pendiente' }, user: 'test@test.com', codigo_qr: 'qr2', tarifa_hora: '4000', total_pago: '0', hora_salida: null, fecha_creacion: '', fecha_actualizacion: '' },
    ];
    mockUseReservations.mockReturnValue({
      reservations: mockReservations,
      isLoading: false,
      error: null,
      refetchReservations: vi.fn(),
    });

    // Act
    render(<ReservationsPage />);

    // Assert: Verificamos que el mock de ReservationList contiene las reservas
    const reservationList = screen.getByTestId('reservation-list');
    expect(reservationList.textContent).toContain(JSON.stringify(mockReservations));
  });

  it('debería abrir el modal de creación de reserva al hacer clic en el botón "Crear Reserva"', () => {
    // Arrange
    mockUseReservations.mockReturnValue({
      reservations: [],
      isLoading: false,
      error: null,
      refetchReservations: vi.fn(),
    });
    render(<ReservationsPage />);

    // Assert inicial: El modal no debe estar visible al principio
    expect(screen.queryByTestId('create-reservation-modal')).not.toBeInTheDocument();

    // Act: Hacemos clic en el botón
    const createButton = screen.getByRole('button', { name: /Crear Reserva/i });
    fireEvent.click(createButton);

    // Assert final: El modal debe estar visible después del clic
    expect(screen.getByTestId('create-reservation-modal')).toBeInTheDocument();
  });
});
