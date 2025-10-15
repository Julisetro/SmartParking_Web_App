import { useMemo, useState } from 'react';
import { AuthContext, User } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    console.log('Intentando login con:', email, password); // Mantenemos esto para ver la llamada
    // SIMULACIÓN DE ERROR: Rechazamos la promesa para probar el 'catch' en LoginPage.
    return Promise.reject(new Error('Simulated login failure'));
  };

  const register = async (userData: any) => {
    console.log('Intentando registrar con:', userData);
    // SIMULACIÓN DE ÉXITO: Esperamos 1 segundo y luego resolvemos la promesa.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    // Lógica de logout
  };

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, accessToken, refreshToken, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};