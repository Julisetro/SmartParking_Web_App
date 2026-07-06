// src/features/reservations/components/ReservationList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationList from './ReservationList';
import { cancelReservation } from '../api/reservationsApi';
import type { Reserva } from '../types/reservationsTypes';

// Mock de los modales para aislar la prueba del componente ReservationList.
// Esto evita la necesidad de renderizar el contenido completo de los modales y nos permite
// verificar que se llaman con las props correctas.
vi.mock('./QRCodeModal', () => ({
  default: vi.fn(({ isOpen, onClose, qrCodeValue }) =>
    isOpen ? (
      <div data-testid="qrcode-modal">
        QR Modal
        <button onClick={onClose}>Close QR</button>
        <p>QR Value: {qrCodeValue}</p>
      </div>
    ) : null
  ),
}));

vi.mock('./CancelConfirmationModal', () => ({
  default: vi.fn(({ isOpen, onClose, onConfirm, isSubmitting }) =>
    isOpen ? (
      <div data-testid="cancel-confirmation-modal">
        Cancel Modal
        <button onClick={onClose}>Close Cancel</button>
        <button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
        </button>
      </div>
    ) : null
  ),
}));

// Mock de la API de cancelación para controlar su comportamiento.
vi.mock('../api/reservationsApi', () => ({
  cancelReservation: vi.fn(),
}));

describe('Componente - ReservationList', () => {
  const mockRefetchReservations = vi.fn();

  // Datos de ejemplo para las pruebas.
  const mockReservations: Reserva[] = [
    {
      id: 1,
      user: 'test@user.com',
      estado: { id: 1, nombre: 'Confirmada' },
      fecha: '2025-11-20T10:00:00Z',
      hora_inicio: '10:00:00',
      hora_salida: '11:00:00',
      tarifa_hora: '4000.00',
      total_pago: '4000.00',
      codigo_qr: 'qr-code-1',
      fecha_creacion: '2025-11-20T09:00:00Z',
      fecha_actualizacion: '2025-11-20T09:00:00Z',
    },
    {
      id: 2,
      user: 'test@user.com',
      estado: { id: 2, nombre: 'En proceso' },
      fecha: '2025-11-21T14:00:00Z',
      hora_inicio: '14:00:00',
      hora_salida: '15:00:00',
      tarifa_hora: '4000.00',
      total_pago: '4000.00',
      codigo_qr: 'qr-code-2',
      fecha_creacion: '2025-11-21T13:00:00Z',
      fecha_actualizacion: '2025-11-21T13:00:00Z',
    },
    {
      id: 3,
      user: 'test@user.com',
      estado: { id: 3, nombre: 'Completada' },
      fecha: '2025-11-22T09:00:00Z',
      hora_inicio: '09:00:00',
      hora_salida: '10:00:00',
      tarifa_hora: '4000.00',
      total_pago: '4000.00',
      codigo_qr: 'qr-code-3',
      fecha_creacion: '2025-11-22T08:00:00Z',
      fecha_actualizacion: '2025-11-22T08:00:00Z',
    },
    {
      id: 4,
      user: 'test@user.com',
      estado: { id: 4, nombre: 'Cancelada' },
      fecha: '2025-11-23T16:00:00Z',
      hora_inicio: '16:00:00',
      hora_salida: '17:00:00',
      tarifa_hora: '4000.00',
      total_pago: '0.00',
      codigo_qr: 'qr-code-4',
      fecha_creacion: '2025-11-23T15:00:00Z',
      fecha_actualizacion: '2025-11-23T15:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada prueba.
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
  });

  // Test 1: Lista vacía.
  it('debe mostrar un mensaje cuando no hay reservas', () => {
    render(
      <ReservationList reservations={[]} refetchReservations={mockRefetchReservations} />
    );
    expect(
      screen.getByText('No tienes reservas activas en este momento.')
    ).toBeInTheDocument();
  });

  // Test 2: Renderizado de reservas.
  it('debe renderizar la lista de reservas correctamente', () => {
    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // Verifica que el título de cada reserva (fecha) y su estado están presentes.
    expect(screen.getByText('20 de noviembre de 2025')).toBeInTheDocument();
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
    expect(screen.getByText('21 de noviembre de 2025')).toBeInTheDocument();
    expect(screen.getByText('En proceso')).toBeInTheDocument();
    expect(screen.getByText('22 de noviembre de 2025')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
    expect(screen.getByText('23 de noviembre de 2025')).toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();

    // Verifica el formato de la hora y la tarifa.
    expect(screen.getAllByText('10:00')[0]).toBeInTheDocument(); // Primer 10:00
    // Intl.NumberFormat para 'es-CO' puede usar un espacio no rompible. Usamos una regex.
    expect(screen.getAllByText(/\$ 4\.000/)[0]).toBeInTheDocument();
  });

  // Test 3: Botones condicionales (Ver QR y Cancelar).
  it('debe renderizar los botones "Ver QR" y "Cancelar" condicionalmente', () => {
    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // Reserva 1 (Confirmada): Ver QR y Cancelar
    const reservation1Element = screen.getByText('20 de noviembre de 2025').closest('.bg-white');
    expect(reservation1Element).toHaveTextContent('Ver QR');
    expect(reservation1Element).toHaveTextContent('Cancelar');

    // Reserva 2 (En proceso): Solo Ver QR
    const reservation2Element = screen.getByText('21 de noviembre de 2025').closest('.bg-white');
    expect(reservation2Element).toHaveTextContent('Ver QR');
    expect(reservation2Element).not.toHaveTextContent('Cancelar');

    // Reserva 3 (Completada): Ninguno
    const reservation3Element = screen.getByText('22 de noviembre de 2025').closest('.bg-white');
    expect(reservation3Element).not.toHaveTextContent('Ver QR');
    expect(reservation3Element).not.toHaveTextContent('Cancelar');

    // Reserva 4 (Cancelada): Ninguno
    const reservation4Element = screen.getByText('23 de noviembre de 2025').closest('.bg-white');
    expect(reservation4Element).not.toHaveTextContent('Ver QR');
    expect(reservation4Element).not.toHaveTextContent('Cancelar');
  });

  // Test 4: Interacción con el botón "Ver QR".
  it('debe abrir QRCodeModal al hacer clic en "Ver QR"', async () => {
    const user = userEvent.setup();
    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // Encuentra el botón "Ver QR" para la primera reserva (ID 1).
    const qrButton = screen.getAllByText('Ver QR')[0];
    await user.click(qrButton);

    // Verifica que el QRCodeModal mockeado se renderiza y recibe las props correctas.
    const qrcodeModal = screen.getByTestId('qrcode-modal');
    expect(qrcodeModal).toBeInTheDocument();
    expect(qrcodeModal).toHaveTextContent(`QR Value: ${mockReservations[0].codigo_qr}`);
  });

  // Test 5: Interacción con el botón "Cancelar" (abre modal).
  it('debe abrir CancelConfirmationModal al hacer clic en "Cancelar"', async () => {
    const user = userEvent.setup();
    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // Encuentra el botón "Cancelar" para la primera reserva (ID 1).
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    // Verifica que el CancelConfirmationModal mockeado se renderiza.
    expect(screen.getByTestId('cancel-confirmation-modal')).toBeInTheDocument();
  });

  // Test 6: Flujo de confirmación de cancelación exitosa.
  it('debe cancelar la reserva y recargar la lista al confirmar', async () => {
    const user = userEvent.setup();
    
    // Configura una promesa controlada manualmente para la API de cancelación.
    let resolveCancel: (value: Reserva | PromiseLike<Reserva>) => void;
    const cancelPromise = new Promise<Reserva>((resolve) => {
      resolveCancel = resolve;
    });
    vi.mocked(cancelReservation).mockReturnValue(cancelPromise);

    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // 1. Abre el modal de cancelación.
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    // 2. Encuentra y haz clic en el botón de confirmar en el modal mockeado.
    const confirmCancelButton = screen.getByText('Confirm Cancel');
    await user.click(confirmCancelButton);

    // 3. AHORA: la ejecución está en pausa. Verifica el estado de carga estable.
    const cancellingButton = screen.getByText('Cancelling...');
    expect(cancellingButton).toBeInTheDocument();
    expect(cancellingButton).toBeDisabled();

    // 4. Resuelve la promesa y espera a que se completen las actualizaciones.
    await act(async () => {
      resolveCancel(mockReservations[0]);
      await cancelPromise;
    });

    // 5. Verifica el estado final.
    await waitFor(() => {
      expect(cancelReservation).toHaveBeenCalledWith(mockReservations[0].id);
      expect(mockRefetchReservations).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('cancel-confirmation-modal')).toBeNull();
    });
  });

  // Test 7: Flujo de confirmación de cancelación con error.
  it('debe manejar errores al cancelar la reserva', async () => {
    const user = userEvent.setup();
    // Configura el mock para que la cancelación falle.
    vi.mocked(cancelReservation).mockRejectedValue(new Error('Cancel failed'));

    render(
      <ReservationList
        reservations={mockReservations}
        refetchReservations={mockRefetchReservations}
      />
    );

    // 1. Abre el modal de cancelación.
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    // 2. Confirma la cancelación.
    const confirmCancelButton = screen.getByText('Confirm Cancel');
    await user.click(confirmCancelButton);

    // 3. Espera a que la operación termine y el error sea logueado.
    await waitFor(() => {
      expect(cancelReservation).toHaveBeenCalledWith(mockReservations[0].id);
      // Verifica que refetchReservations NO fue llamado en caso de error.
      expect(mockRefetchReservations).not.toHaveBeenCalled();
      // Verifica que el error fue logueado en la consola.
      expect(console.error).toHaveBeenCalledWith('Error al cancelar la reserva:', expect.any(Error));
      // El componente deja el modal abierto en caso de error, así que verificamos que sigue ahí.
      expect(screen.getByTestId('cancel-confirmation-modal')).toBeInTheDocument();
    });
  });
});
