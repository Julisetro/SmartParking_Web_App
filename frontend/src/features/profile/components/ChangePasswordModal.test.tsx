// src/features/profile/components/ChangePasswordModal.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePasswordModal } from './ChangePasswordModal';

// Mockeamos el módulo de la API y la función alert
vi.mock('../api/profileApi');
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ChangePasswordModal', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar correctamente cuando está abierto', () => {
    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña Antigua')).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Confirmar Nueva Contraseña')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar Cambios' })
    ).toBeInTheDocument();
  });

  it('debería mostrar un error si las nuevas contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    const { changePassword } = await import('../api/profileApi');
    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    await user.type(screen.getByLabelText('Contraseña Antigua'), 'oldpass');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'newpass123');
    await user.type(
      screen.getByLabelText('Confirmar Nueva Contraseña'),
      'newpass456'
    );

    await user.click(
      screen.getByRole('button', { name: 'Guardar Cambios' })
    );

    // Verificamos que se muestra el error de validación y la API no es llamada
    expect(
      screen.getByText('Las nuevas contraseñas no coinciden.')
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('debería mostrar un error si la nueva contraseña es muy corta', async () => {
    const user = userEvent.setup();
    const { changePassword } = await import('../api/profileApi');
    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    await user.type(screen.getByLabelText('Contraseña Antigua'), 'oldpass');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'short');
    await user.type(screen.getByLabelText('Confirmar Nueva Contraseña'), 'short');

    await user.click(
      screen.getByRole('button', { name: 'Guardar Cambios' })
    );

    // Verificamos el error de longitud y que la API no es llamada
    expect(
      screen.getByText('La nueva contraseña debe tener al menos 8 caracteres.')
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('debería llamar a la API y cerrar el modal en un envío exitoso', async () => {
    const user = userEvent.setup();
    const { changePassword } = await import('../api/profileApi');
    vi.mocked(changePassword).mockResolvedValue(undefined);

    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    await user.type(screen.getByLabelText('Contraseña Antigua'), 'oldpass123');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'newPassword123');
    await user.type(
      screen.getByLabelText('Confirmar Nueva Contraseña'),
      'newPassword123'
    );

    await user.click(
      screen.getByRole('button', { name: 'Guardar Cambios' })
    );

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        old_password: 'oldpass123',
        new_password: 'newPassword123',
        new_password2: 'newPassword123',
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(alertMock).toHaveBeenCalledWith('¡Contraseña actualizada con éxito!');
    });
  });

  it('debería mostrar un error de API si el envío falla en el backend', async () => {
    const user = userEvent.setup();
    const errorMessage = 'La contraseña antigua no es correcta.';
    const { changePassword } = await import('../api/profileApi');
    vi.mocked(changePassword).mockRejectedValue({
      response: { data: { old_password: [errorMessage] } },
    });

    render(<ChangePasswordModal isOpen={true} onClose={handleClose} />);

    await user.type(screen.getByLabelText('Contraseña Antigua'), 'wrongoldpass');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'newPassword123');
    await user.type(
      screen.getByLabelText('Confirmar Nueva Contraseña'),
      'newPassword123'
    );

    await user.click(
      screen.getByRole('button', { name: 'Guardar Cambios' })
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(handleClose).not.toHaveBeenCalled();
    expect(alertMock).not.toHaveBeenCalled();
  });
});
