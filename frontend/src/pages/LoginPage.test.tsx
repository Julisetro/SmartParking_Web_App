import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { AuthContext } from '../features/auth/context/AuthContext';
import type { AuthContextType } from '../features/auth/context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

//Mock de las funciones del contexto de autenticación
const mockLogin = vi.fn();
// Se crea un valor de contexto simulado para el AuthContext
const mockAuthContextValue: AuthContextType = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  login: mockLogin,
  register: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

/**
 * Función de utilidad (helper) que encapsula la renderisación del componente
 * Se envuelve LoginPage con MemoryRouter y AuthContext.Provider para simplificar
 * la configuración del entorno de prueba y evitar duplicación de código
 */

const setup = () => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Pruebas en LoginPage', () => {
  // El hook beforeEach se ejecuta antes de cada prueba ('it') dentro de este describe
  // Restaura el estado de los mocks para garantizar el aislamiento de las Pruebas
  beforeEach(() => {
    // Resetea el historial de llamadas y los resultados simulados de todas las funciones mock.
    vi.resetAllMocks();
  });

  it('debe llmar la función login con las credenciales del usuario al enviar el formulario', async () => {
    // Arrange: Se prepara el entorno de prueba
    setup();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });

    // Act: Se simulan las interacciones del usuario
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Assert: Se verifica que la función login fue llamada con los argumentos correctos
    // waitFor espera que las aserciones dentro del callback se cumplan, reintentando si fallan
    // hasta que se agote el tiempo de espera.
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledOnce();
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  // Prueba para el estado de carga
  it('debe mostrar el estado de carga en el botón mientras se procesa el login', async () => {
    // Arrange: Se simula una promesa que nunca se resuelve para mantener el estado de carga
    const loadingContextValue: AuthContextType = {
      ...mockAuthContextValue,
      isLoading: true,
    };
    // Act: Renderizamos el componente con el contexto de carga
    render(
      <MemoryRouter>
        <AuthContext.Provider value={loadingContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    // Assert: Verificamos que el botón esté en su estado de carga
    const loadingButton = screen.getByRole('button', {
      name: /Ingresando.../i,
    });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });

  // Prueba para el estado de error.
  it('debe mostrar un mensaje de error si las credenciales son incorrectas', async () => {
    // Arrange: Se simula un fallo en la autenticación
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'));
    setup();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });

    // Act: Se simulan las interacciones del usuario
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Assert: Se espera que se muestre un mensaje de error.
    const errorMessage = await screen.findByText(
      /El correo electrónico o la contraseña son incorrectos./i
    );
    // Se verifica que se muestre el mensaje de error
    expect(errorMessage).toBeInTheDocument();
    // Se verifica que el botón vuelva a ser habilitado
    expect(submitButton).not.toBeDisabled();
  });
});
