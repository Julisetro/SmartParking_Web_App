// src/features/reservations/components/CancelConfirmationModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CancelConfirmationModal from './CancelConfirmationModal';

describe('Componente - CancelConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada prueba.
  });

  it('no debe renderizarse si la prop isOpen es false', () => {
    // Renderiza el componente con isOpen={false}.
    render(
      <CancelConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );
    // Verifica que el título del modal no está en el documento.
    expect(screen.queryByText('Confirmar Cancelación')).toBeNull();
  });

  it('debe renderizarse correctamente si la prop isOpen es true', () => {
    // Renderiza el componente con isOpen={true}.
    render(
      <CancelConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );
    // Verifica que el título y el mensaje de confirmación están visibles.
    expect(screen.getByText('Confirmar Cancelación')).toBeInTheDocument();
    expect(
      screen.getByText(
        '¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.'
      )
    ).toBeInTheDocument();
    // Verifica que ambos botones están presentes.
    expect(screen.getByText('Volver')).toBeInTheDocument();
    expect(screen.getByText('Sí, Cancelar')).toBeInTheDocument();
  });

  it('debe llamar a onClose cuando se hace clic en el botón "Volver"', async () => {
    const user = userEvent.setup();
    render(
      <CancelConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const backButton = screen.getByText('Volver');
    await user.click(backButton); // Simula el clic en el botón.

    // Verifica que la función onClose fue llamada una vez.
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onClose cuando se hace clic en el fondo del modal', () => {
    render(
      <CancelConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    // Simula un clic en el fondo oscuro del modal.
    // El div principal tiene la propiedad onClick={onClose} y ocupa todo el espacio.
    fireEvent.click(screen.getByText('Confirmar Cancelación').closest('.fixed') as HTMLElement);

    // Verifica que la función onClose fue llamada una vez.
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onConfirm cuando se hace clic en el botón "Sí, Cancelar"', async () => {
    const user = userEvent.setup();
    render(
      <CancelConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={false}
      />
    );

    const confirmButton = screen.getByText('Sí, Cancelar');
    await user.click(confirmButton); // Simula el clic en el botón.

    // Verifica que la función onConfirm fue llamada una vez.
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar los botones y mostrar texto de carga cuando isSubmitting es true', () => {
    render(
      <CancelConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isSubmitting={true}
      />
    );

    const backButton = screen.getByText('Volver');
    const confirmButton = screen.getByText('Cancelando...'); // El texto cambia en estado de carga.

    // Verifica que ambos botones están deshabilitados.
    expect(backButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    // Verifica que el texto del botón de confirmación ha cambiado.
    expect(confirmButton).toBeInTheDocument();
  });
});
