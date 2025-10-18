import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType, AuthState, User } from './AuthContext';

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: {
      id: 1,
      email: 'dev@example.com',
      first_name: 'Julián',
      last_name: 'Developer',
      cedula: '123456789',
      celular: '3001234567',
    },
    accessToken: 'fake-token-for-development',
    refreshToken: null,
    isLoading: false,
  });

  const login = async (email: string, password: string) => {
    console.log('Llamando a login con:', { email, password });
    // Lógica del API ira aquí
    setAuthState({
      user: {
        id: 1,
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User',
      },
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      isLoading: false,
    });
  };
  const register = async (userData: unknown) => {
    console.log('Llamando a register con:', userData);
    // Lógica del API ira aquí
  };
  const logout = () => {
    console.log('Llamando a logout');
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    setAuthState((prevState) => ({
      ...prevState,
      user: prevState.user ? { ...prevState.user, ...updatedUserData } : null,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
