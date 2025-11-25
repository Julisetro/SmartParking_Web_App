import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../../../shared/api/client';
import type { User } from './AuthContext';
import type { ReactNode } from 'react';

// Mock del cliente API
vi.mock('../../../shared/api/client');

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  cedula: '123456789',
  celular: '3001234567',
};

// Componente de prueba para consumir el contexto
const TestConsumer = () => {
  const { user, accessToken, isLoading } = useAuth();
  if (isLoading) return <div>Cargando...</div>;
  return (
    <div>
      <span>User: {user ? user.first_name : 'null'}</span>
      <span>Token: {accessToken || 'null'}</span>
    </div>
  );
};

// Wrapper para renderizar el provider con el consumidor
const renderProvider = (children: ReactNode) => {
  return render(<AuthProvider>{children}</AuthProvider>);
};

describe('AuthProvider', () => {
  // Limpiar mocks y localStorage
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('debería finalizar la carga sin usuario si no hay tokens', async () => {
      renderProvider(<TestConsumer />);
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
      expect(screen.getByText('User: null')).toBeInTheDocument();
    });
    it('debería cargar el usuario si hay un token válido en localStorage', async () => {
      localStorage.setItem(
        'authTokens',
        JSON.stringify({ access: 'valid-token', refresh: 'refresh' })
      );
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser });

      renderProvider(<TestConsumer />);

      await waitFor(() => {
        expect(
          screen.getByText(`User: ${mockUser.first_name}`)
        ).toBeInTheDocument();
      });
      expect(screen.getByText('Token: valid-token')).toBeInTheDocument();
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/');
    });

    it('debería limpiar el estado si el token en localStorage es inválido', async () => {
      localStorage.setItem(
        'authTokens',
        JSON.stringify({ access: 'invalid-token', refresh: 'refresh' })
      );
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Token inválido'));

      renderProvider(<TestConsumer />);

      await waitFor(() => {
        expect(screen.getByText('User: null')).toBeInTheDocument();
      });
      expect(localStorage.getItem('authTokens')).toBeNull();
    });
  });
  // Pruebas para la función de login
  describe('Login', () => {
    it('debería realizar el login, obtener el usuario y guardarlo en el estado', async () => {
      const TestComponent = () => {
        const { login } = useAuth();
        return (
          <button onClick={() => login('test@example.com', 'password')}>
            Login
          </button>
        );
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { access: 'new-token', refresh: 'new-refresh' },
      });
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser });

      renderProvider(<TestComponent />);

      act(() => {
        fireEvent.click(screen.getByText('Login'));
      });

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/users/login/',
          expect.any(Object)
        );
        expect(apiClient.get).toHaveBeenCalledWith('/users/me/');
        expect(localStorage.getItem('authTokens')).toContain('new-token');
      });
    });
  });
  // Pruebas para la función de logout
  describe('Logout', () => {
    it('debería limpiar el estado y localStorage al hacer logout', async () => {
      localStorage.setItem(
        'authTokens',
        JSON.stringify({ access: 'valid-token', refresh: 'refresh' })
      );
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser });

      const TestComponent = () => {
        const { logout, user } = useAuth();
        return (
          <div>
            <span>User: {user ? user.first_name : 'null'}</span>
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      renderProvider(<TestComponent />);

      await waitFor(() => {
        expect(
          screen.getByText(`User: ${mockUser.first_name}`)
        ).toBeInTheDocument();
      });

      vi.mocked(apiClient.post).mockResolvedValueOnce({}); // Mock logout call

      act(() => {
        fireEvent.click(screen.getByText('Logout'));
      });

      await waitFor(() => {
        expect(screen.getByText('User: null')).toBeInTheDocument();
      });

      expect(localStorage.getItem('authTokens')).toBeNull();
      expect(apiClient.post).toHaveBeenCalledWith('/users/logout/', {
        refresh: 'refresh',
      });
    });
  });
  // Pruebas para la función de updateUser
  describe('updateUser', () => {
    it('debería actualizar los datos del usuario en el estado', async () => {
      const updatedUser = { ...mockUser, first_name: 'Jane' };

      const TestComponent = () => {
        const { user, updateUser } = useAuth();
        return (
          <div>
            <span>User: {user?.first_name}</span>
            <button onClick={() => updateUser({ first_name: 'Jane' })}>
              Update
            </button>
          </div>
        );
      };

      localStorage.setItem(
        'authTokens',
        JSON.stringify({ access: 'valid-token', refresh: 'refresh' })
      );
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUser });

      renderProvider(<TestComponent />);

      await waitFor(() => {
        expect(
          screen.getByText(`User: ${mockUser.first_name}`)
        ).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Update'));
      });

      await waitFor(() => {
        expect(
          screen.getByText(`User: ${updatedUser.first_name}`)
        ).toBeInTheDocument();
      });
    });
  });
});
