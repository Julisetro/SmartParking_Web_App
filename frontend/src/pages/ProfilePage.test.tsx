import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType, type User } from '../features/auth/context/AuthContext';
import { ProfilePage } from './ProfilePage';
import apiClient from '../shared/api/client';

// 1. Mock del módulo apiClient
vi.mock('../shared/api/client');

// 2. Mock de usuario y configuración inicial
const mockUser: User = {
  id: 1,
  email: 'john.doe@test.com',
  first_name: 'John',
  last_name: 'Doe',
  cedula: '123456789',
  celular: '3001234567',
};

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

describe('ProfilePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar en modo de solo lectura por defecto', () => {
    setup();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument();
  });

  it('debería cambiar a modo de edición al hacer clic en Editar', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    const firstNameInput = screen.getByLabelText(/nombre/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveValue(mockUser.first_name);
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it('debería actualizar los datos y mostrar un mensaje de éxito al guardar', async () => {
    // Arrange
    const mockUpdateUser = vi.fn();
    const newFirstName = 'Jane';
    const updatedUser = { ...mockUser, first_name: newFirstName };

    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedUser });

    setup({ updateUser: mockUpdateUser });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    const firstNameInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(firstNameInput, { target: { value: newFirstName } });

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    // Assert
    // Primero, esperamos el resultado final y más importante: el mensaje de éxito.
    // Si esto aparece, el resto del proceso asíncrono debe haber funcionado.
    expect(await screen.findByText(/¡Tu información ha sido actualizada con éxito!/i)).toBeInTheDocument();

    // Ahora, verificamos las llamadas que debieron haber ocurrido.
    expect(apiClient.patch).toHaveBeenCalledWith('/users/me/', {
      first_name: newFirstName,
      last_name: mockUser.last_name,
    });

    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);

    // Finalmente, verificamos que se regresó a modo lectura.
    expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });
});
