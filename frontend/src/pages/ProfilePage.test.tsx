import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  AuthContext,
  type AuthContextType,
  type User,
} from '../features/auth/context/AuthContext';
import { ProfilePage } from './ProfilePage';
import apiClient from '../shared/api/client';

// Mock del módulo apiClient para simular llamadas a la API.
vi.mock('../shared/api/client');

// Mock de datos de usuario para proporcionar un contexto consistente.
const mockUser: User = {
  id: 1,
  email: 'john.doe@test.com',
  first_name: 'John',
  last_name: 'Doe',
  cedula: '123456789',
  celular: '3001234567',
};

/**
 * Función de utilidad para renderizar el componente ProfilePage con un contexto de autenticación personalizable.
 * @param {Partial<AuthContextType>} contextValue - Valores para sobreescribir el contexto por defecto.
 * @returns El resultado del renderizado de @testing-library/react.
 */
const setup = (contextValue: Partial<AuthContextType> = {}) => {
  const defaultContextValue: AuthContextType = {
    user: mockUser,
    accessToken: 'fake-token',
    refreshToken: 'fake-token',
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    ...contextValue,
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={defaultContextValue}>
        <ProfilePage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

// Suite de pruebas para el componente ProfilePage.
describe('ProfilePage', () => {
  // Limpia todos los mocks después de cada prueba para asegurar el aislamiento.
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Prueba que la página se renderiza en modo de solo lectura por defecto.
  it('debería renderizar en modo de solo lectura por defecto', () => {
    setup();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /guardar cambios/i })
    ).not.toBeInTheDocument();
  });

  // Prueba que la página cambia a modo de edición al hacer clic en 'Editar'.
  it('debería cambiar a modo de edición al hacer clic en Editar', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    const firstNameInput = screen.getByLabelText(/nombre/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveValue(mockUser.first_name);
    expect(
      screen.getByRole('button', { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });

  // Prueba la actualización exitosa de los datos del usuario.
  it('debería actualizar los datos y mostrar un mensaje de éxito al guardar', async () => {
    const mockUpdateUser = vi.fn();
    const newFirstName = 'Jane';
    const updatedUser = { ...mockUser, first_name: newFirstName };

    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedUser });

    setup({ updateUser: mockUpdateUser });

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: newFirstName },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Espera a que el mensaje de éxito sea visible.
    expect(
      await screen.findByText(/¡Tu información ha sido actualizada con éxito!/i)
    ).toBeInTheDocument();

    // Verifica que la API y el contexto fueron llamados correctamente.
    expect(apiClient.put).toHaveBeenCalledWith('/users/me/', {
      first_name: newFirstName,
      last_name: mockUser.last_name,
    });
    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);

    // Verifica que la página vuelve al modo de solo lectura.
    expect(
      screen.queryByRole('button', { name: /guardar cambios/i })
    ).not.toBeInTheDocument();
  });

  // Prueba el manejo de errores si la actualización del perfil falla.
  it('debería mostrar un mensaje de error si la actualización falla', async () => {
    vi.mocked(apiClient.put).mockRejectedValueOnce(
      new Error('Error de red')
    );
    setup();

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Jane' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Espera a que el mensaje de error sea visible.
    expect(
      await screen.findByText(/Ocurrió un error al actualizar tu información./i)
    ).toBeInTheDocument();

    // Verifica que el modo de edición sigue activo.
    expect(
      screen.getByRole('button', { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });

  // Prueba que se muestra el estado de carga mientras se guarda.
  it('debería mostrar un estado de carga mientras se guardan los cambios', async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockUser });
    setup();

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Verifica que el botón está deshabilitado y muestra 'Guardando...'.
    const saveButton = screen.getByRole('button', {
      name: /guardando.../i,
    });
    expect(saveButton).toBeDisabled();

    // Espera a que la operación termine para evitar advertencias de estado.
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /guardando.../i })
      ).not.toBeInTheDocument();
    });
  });

  // Prueba la funcionalidad de cancelación del modo de edición.
  it('debería cancelar el modo de edición y revertir los cambios no guardados', () => {
    setup();

    // Entra en modo edición y cambia un valor.
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    const firstNameInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(firstNameInput).toHaveValue('Jane');

    // Hace clic en 'Cancelar'.
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    // Verifica que ya no está en modo edición y el valor original se muestra de nuevo.
    expect(
      screen.queryByRole('button', { name: /guardar cambios/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument(); // El valor original.
  });

  // Prueba la visualización del estado de carga del perfil.
  it('debería mostrar "Cargando perfil..." si el usuario no está disponible', () => {
    setup({ user: null });
    expect(screen.getByText(/cargando perfil.../i)).toBeInTheDocument();
  });

  // Prueba que los modales de seguridad se abren correctamente.
  describe('Modales de Seguridad', () => {
    // Prueba para el modal de cambio de contraseña.
    it('debería abrir el modal de cambio de contraseña', async () => {
      setup();
      const updateButton = screen.getAllByRole('button', {
        name: /actualizar/i,
      })[0];
      fireEvent.click(updateButton);

      // Busca el título del modal para confirmar que se abrió.
      expect(
        await screen.findByRole('heading', { name: /Cambiar Contraseña/i })
      ).toBeInTheDocument();
    });

    // Prueba para el modal de cambio de email.
    it('debería abrir el modal de cambio de email', async () => {
      setup();
      const updateButton = screen.getAllByRole('button', {
        name: /actualizar/i,
      })[1];
      fireEvent.click(updateButton);

      // Busca el título del modal para confirmar que se abrió.
      expect(
        await screen.findByRole('heading', {
          name: /Cambiar Correo Electrónico/i,
        })
      ).toBeInTheDocument();
    });

    // Prueba para el modal de cambio de celular.
    it('debería abrir el modal de cambio de celular', async () => {
      setup();
      const updateButton = screen.getAllByRole('button', {
        name: /actualizar/i,
      })[2];
      fireEvent.click(updateButton);

      // Busca el título del modal para confirmar que se abrió.
      expect(
        await screen.findByRole('heading', {
          name: /Cambiar Número de Celular/i,
        })
      ).toBeInTheDocument();
    });
  });
});
