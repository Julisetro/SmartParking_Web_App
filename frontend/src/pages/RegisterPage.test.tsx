import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthContext } from '../features/auth/context/AuthContext';
import type { AuthContextType } from '../features/auth/context/AuthContext';
import { RegisterPage } from './RegisterPage';

// Mock de las funciones del contexto y de la navegación.
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

// Mock del módulo 'react-router-dom' para poder interceptar y simular 'useNavigate'.
vi.mock('react-router-dom', async () => {
  // Importamos el módulo original para no perder todas sus funcionalidades.
  const originalModule = await vi.importActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// Valor simulado para el contexto de autenticación.
const mockAuthContextValue: AuthContextType = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  login: vi.fn(),
  register: mockRegister,
  logout: vi.fn(),
  updateUser: vi.fn(), // Añadir esta línea para cumplir con el tipo
};

/**
 * Función de utilidad que encapsula la renderización del componente.
 * Simplifica la configuración de cada prueba y evita la duplicación de código.
 */
const setup = () => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <RegisterPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

// Helper para rellenar el formulario con datos válidos.
const fillForm = async () => {
  await userEvent.type(screen.getByLabelText(/Nombre/i), 'John');
  await userEvent.type(screen.getByLabelText(/Apellido/i), 'Doe');
  await userEvent.type(
    screen.getByLabelText(/Correo Electrónico/i),
    'john.doe@example.com'
  );
  await userEvent.type(screen.getByLabelText('Cédula'), '123456789');
  await userEvent.type(screen.getByLabelText('Celular'), '3001234567');
  await userEvent.type(screen.getByLabelText(/^Contraseña$/i), 'password123');
  await userEvent.type(
    screen.getByLabelText(/Confirmar Contraseña/i),
    'password123'
  );
};

describe('Pruebas para RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe llamar a la función register y redirigir al login en un registro exitoso', async () => {
    // Arrange
    setup();
    await fillForm();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    // Assert
    await waitFor(() => {
      // Verifica que la función de registro fue llamada con los datos del formulario.
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        })
      );
      // Verifica que se intentó redirigir al usuario a la página de login con un mensaje de éxito.
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { message: expect.any(String) },
      });
    });
  });

  it('debe mostrar un error si las contraseñas no coinciden y no debe llamar a register', async () => {
    // Arrange
    setup();
    await fillForm();
    // Se introduce una contraseña de confirmación incorrecta.
    await userEvent.clear(screen.getByLabelText(/Confirmar Contraseña/i));
    await userEvent.type(
      screen.getByLabelText(/Confirmar Contraseña/i),
      'wrongpassword'
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    // Assert
    // Se busca el mensaje de error específico para contraseñas que no coinciden.
    const errorMessage = await screen.findByText(
      /Las contraseñas no coinciden./i
    );
    expect(errorMessage).toBeInTheDocument();
    // Se verifica que la función de registro NO fue llamada, gracias a la validación del cliente.
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('debe mostrar un mensaje de error de la API si el registro falla', async () => {
    // Arrange
    // Se simula un error de la API, como si el correo ya estuviera en uso.
    const apiError = {
      response: { data: { email: ['Este correo ya está en uso.'] } },
    };
    mockRegister.mockRejectedValue(apiError);
    setup();
    await fillForm();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    // Assert
    // Se espera a que el mensaje de error devuelto por la API se muestre en la pantalla.
    const errorMessage = await screen.findByText(
      /Este correo ya está en uso./i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it('debe mostrar el estado de carga mientras se procesa el registro', async () => {
    // Arrange
    // Se simula una petición de larga duración.
    mockRegister.mockReturnValue(new Promise(() => {}));
    setup();
    await fillForm();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    // Assert
    await waitFor(() => {
      // Se verifica que el botón muestre "Registrando..." y esté deshabilitado.
      const loadingButton = screen.getByRole('button', {
        name: /Registrando.../i,
      });
      expect(loadingButton).toBeDisabled();
    });
  });
});
