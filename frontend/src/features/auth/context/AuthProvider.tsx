import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType, AuthState } from './AuthContext';

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
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
  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
