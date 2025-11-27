// src/features/reservations/components/CreateReservationModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateReservationModal from './CreateReservationModal';
import { createReservation } from '../api/reservationsApi';
import type { Reserva } from '../types/reservationsTypes';

// Esto le dice a TypeScript que createReservation es un mock
vi.mocked(createReservation);

// ...existing code...

// Mock de la API para aislar el componente.
vi.mock('../api/reservationsApi');

// Mock del componente DatePicker ya que su implementación interna no es relevante para esta prueba.
// Se reemplaza por un input simple para facilitar la simulación de entrada de datos.
vi.mock('react-datepicker', () => {
  return {
    // El componente DatePicker real es complejo, lo mockeamos como un input simple.
    // Esto simplifica las pruebas, ya que no necesitamos interactuar con un calendario completo.
    default: ({
      selected,
      onChange,
      id,
    }: {
      selected: Date;
      onChange: (date: Date) => void;
      id: string;
    }) => (
      <input
        type="text"
        id={id}
        value={selected.toString()}
        // Simulamos el cambio de fecha directamente.
        onChange={(e) => onChange(new Date(e.target.value))}
        data-testid={id} // Añadimos un test-id para encontrarlo fácilmente.
      />
    ),
  };
});

describe('Componente - CreateReservationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnReservationCreated = vi.fn();

  // Antes de cada prueba, limpiamos los mocks para evitar interferencias.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizarse si la prop isOpen es false', () => {
    // Renderiza el componente con isOpen={false}.
    render(
      <CreateReservationModal
        isOpen={false}
        onClose={mockOnClose}
        onReservationCreated={mockOnReservationCreated}
      />
    );
    // 'queryBy...' se usa para verificar que un elemento NO está en el DOM.
    expect(screen.queryByText('Crear Nueva Reserva')).toBeNull();
  });

  it('debe renderizarse correctamente si la prop isOpen es true', () => {
    render(
      <CreateReservationModal
        isOpen={true}
        onClose={mockOnClose}
        onReservationCreated={mockOnReservationCreated}
      />
    );
    // 'getBy...' se usa para afirmar que un elemento SÍ está en el DOM. Lanza error si no lo encuentra.
    expect(screen.getByText('Crear Nueva Reserva')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de la Reserva')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora de Inicio')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Reserva')).toBeInTheDocument();
  });

  it('debe llamar a onClose cuando se hace clic en el botón Cancelar', async () => {
    const user = userEvent.setup();
    render(
      <CreateReservationModal
        isOpen={true}
        onClose={mockOnClose}
        onReservationCreated={mockOnReservationCreated}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton); // Simula un clic de usuario real.

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe enviar el formulario exitosamente y llamar a las props correspondientes', async () => {
    const user = userEvent.setup();

    // Creamos una promesa que controlaremos manualmente.
    // Esto nos permite pausar la ejecución en el estado de "cargando".
    let resolvePromise: (value: Reserva | PromiseLike<Reserva>) => void;
    const promise = new Promise<Reserva>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(createReservation).mockReturnValue(promise);

    render(
      <CreateReservationModal
        isOpen={true}
        onClose={mockOnClose}
        onReservationCreated={mockOnReservationCreated}
      />
    );

    const testDate = new Date('2025-12-25T10:30:00');
    fireEvent.change(screen.getByTestId('res-date'), {
      target: { value: testDate.toISOString() },
    });
    fireEvent.change(screen.getByTestId('res-time'), {
      target: { value: testDate.toISOString() },
    });

    const submitButton = screen.getByText('Confirmar Reserva');
    await user.click(submitButton);

    // AHORA: La ejecución está pausada dentro de handleSubmit, esperando que 'promise' se resuelva.
    // El estado 'isSubmitting' es 'true', por lo que el texto "Creando..." es visible de forma estable.
    // No necesitamos 'findBy' porque el estado no cambiará hasta que lo permitamos.
    expect(screen.getByText('Creando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled(); // El botón también debe estar deshabilitado.

    // Ahora resolvemos la promesa para continuar la ejecución de handleSubmit.
    // Usamos 'act' para asegurar que React procese las actualizaciones de estado que siguen a la resolución.
    await act(async () => {
      resolvePromise({
        id: 1,
        user: 'test@user.com',
        estado: { id: 1, nombre: 'Confirmada' },
        fecha: '2025-12-25',
        hora_inicio: '10:30:00',
        hora_salida: null,
        tarifa_hora: '4000.00',
        total_pago: '4000.00',
        codigo_qr: 'qr-code-test',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      });
      await promise; // Esperamos a que la promesa se complete.
    });

    // Finalmente, verificamos que las acciones posteriores a la resolución se hayan ejecutado.
    await waitFor(() => {
      expect(mockOnReservationCreated).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
  it('debe mostrar un mensaje de error si el envío del formulario falla', async () => {
    const user = userEvent.setup();
    const errorMessage =
      'No se pudo crear la reserva. Por favor, inténtalo de nuevo.';
    // Mockea la API para que falle.
    vi.mocked(createReservation).mockRejectedValue(new Error('API Error'));

    render(
      <CreateReservationModal
        isOpen={true}
        onClose={mockOnClose}
        onReservationCreated={mockOnReservationCreated}
      />
    );

    const submitButton = screen.getByText('Confirmar Reserva');
    await user.click(submitButton);

    // Espera a que el mensaje de error aparezca en el DOM.
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verifica que los callbacks de éxito no fueron llamados.
    expect(mockOnReservationCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
    // Verifica que el botón vuelve a estar habilitado.
    expect(submitButton).not.toBeDisabled();
  });
});
