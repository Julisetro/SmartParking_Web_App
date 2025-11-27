// src/features/profile/components/ChangeEmailModal.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeEmailModal } from './ChangeEmailModal';

// Mockeamos el módulo de la API para controlar las llamadas a changeEmail
vi.mock('../api/profileApi');

describe('ChangeEmailModal', () => {
  const handleClose = vi.fn();
  // Mockeamos la función global `alert` para espiarla y evitar pop-ups durante las pruebas
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    // Limpiamos todos los mocks antes de cada prueba para asegurar el aislamiento
    vi.clearAllMocks();
  });

  it('debería renderizar correctamente cuando está abierto', () => {
    render(<ChangeEmailModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Cambiar Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña Actual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nuevo Correo Electrónico')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar Solicitud' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('debería llamar a onClose al hacer clic en Cancelar', async () => {
    const user = userEvent.setup();
    render(<ChangeEmailModal isOpen={true} onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debería llamar a la API, cerrar el modal y mostrar una alerta en un envío exitoso', async () => {
    const user = userEvent.setup();
    // Configuramos el mock de la API para que la llamada sea exitosa
    const { changeEmail } = await import('../api/profileApi');
    vi.mocked(changeEmail).mockResolvedValue(undefined);

    render(<ChangeEmailModal isOpen={true} onClose={handleClose} />);

    // Simulamos que el usuario rellena el formulario
    await user.type(screen.getByLabelText('Contraseña Actual'), 'password123');
    await user.type(
      screen.getByLabelText('Nuevo Correo Electrónico'),
      'nuevo@email.com'
    );

    // Simulamos el clic en el botón de envío
    const submitButton = screen.getByRole('button', { name: 'Enviar Solicitud' });
    await user.click(submitButton);

    // Esperamos a que se resuelvan las acciones asíncronas y verificamos los resultados
    await waitFor(() => {
      // La API debió ser llamada con los datos correctos
      expect(changeEmail).toHaveBeenCalledWith({
        password: 'password123',
        new_email: 'nuevo@email.com',
      });
      // El modal se debe cerrar
      expect(handleClose).toHaveBeenCalledTimes(1);
      // Se debe mostrar la alerta de éxito
      expect(alertMock).toHaveBeenCalledWith(
        '¡Solicitud enviada! Revisa la consola del backend para obtener el enlace de confirmación.'
      );
    });
  });

  it('debería mostrar un mensaje de error si la API falla', async () => {
    const user = userEvent.setup();
    const errorMessage = 'El correo electrónico ya está en uso.';
    // Configuramos el mock de la API para que devuelva un error
    const { changeEmail } = await import('../api/profileApi');
    vi.mocked(changeEmail).mockRejectedValue({
      response: { data: { new_email: [errorMessage] } },
    });

    render(<ChangeEmailModal isOpen={true} onClose={handleClose} />);

    // Simulamos la entrada de datos y el envío
    await user.type(screen.getByLabelText('Contraseña Actual'), 'password123');
    await user.type(
      screen.getByLabelText('Nuevo Correo Electrónico'),
      'existente@email.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar Solicitud' }));

    // Verificamos que el mensaje de error de la API se muestre en pantalla
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Nos aseguramos de que el modal no se cierre y la alerta no se muestre
    expect(handleClose).not.toHaveBeenCalled();
    expect(alertMock).not.toHaveBeenCalled();
  });
});
