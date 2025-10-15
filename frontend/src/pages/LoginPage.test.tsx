import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { AuthContext } from '../features/auth/context/AuthContext';
import type { AuthContextType } from '../features/auth/context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

// Mock del contexto de autenticación
const mockLogin = vi.fn();
// Se crea un valor de contexto simulado
const mockAuthContextValue: AuthContextType = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  login: mockLogin,
  register: vi.fn(),
  logout: vi.fn(),
};

describe('LoginPage', () => {
  it('debe llmar la función login con las credenciales del usuario al enviar el formulario', async () => {
    // Arrange: Se prepara el entorno de prueba
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <LoginPage />
      </AuthContext.Provider>
    );
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });

    // Act: Se simulan las interacciones del usuario
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Assert: Se verifica que la función login fue llamada con los argumentos correctos
    expect(mockLogin).toHaveBeenCalledOnce();
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
