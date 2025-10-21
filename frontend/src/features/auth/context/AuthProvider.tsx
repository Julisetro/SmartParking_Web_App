import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType, AuthState, User } from './AuthContext';
import apiClient from '../../../shared/api/client';
import { registerUser, loginUser, logoutUser } from '../api/auth';
import type { UserRegistrationData } from '../types/authTypes';

// Define la estructura de los tokens que se guardarán en el localStorage
interface AuthTokens {
  access: string;
  refresh: string;
}

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true, // Inicia en true para reflejar la carga inicial del estado de sesión
  });
  // Se usa useEffect para manejar la carga inicial
  useEffect(() => {
    const initializeAuth = async () => {
      const tokensString = localStorage.getItem('authTokens');
      if (tokensString) {
        const tokens: AuthTokens = JSON.parse(tokensString);
        try {
          // Si hay tokens, obtenemos los datos del usuario
          const response = await apiClient.get<User>('/users/me/');
          const user = response.data;

          setAuthState({
            user,
            accessToken: tokens.access,
            refreshToken: tokens.refresh,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          // Si los tokens son inválidos, se borran del almacenamiento local
          localStorage.removeItem('authTokens');
          setAuthState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
          });
        }
      } else {
        // Si no hay tokens, se termina la carga
        setAuthState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('Llamando a login con:', { email, password });
    setAuthState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      // 1. Se piden los tokens al backend
      const tokens = await loginUser(email, password);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      // 2. Pedir los datos del usuario
      const userResponse = await apiClient.get<User>('/users/me/');
      const user = userResponse.data;
      // 3. Actualizar el estado de la aplicación
      setAuthState({
        user,
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      localStorage.removeItem('authTokens');
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
      // Se propaga el error para que pueda ser manejado por el componente login
      throw error;
    }
  };
  const register = async (userData: UserRegistrationData): Promise<void> => {
    // Se usa await para esperar a que la llamada a la API termine
    // Si la llamada falla, lanzara una excepción y se capturara en el bloque catch en RegisterPage.tsx
    await registerUser(userData);
  };
  const logout = async (): Promise<void> => {
    // Si no hay un refresh token, limpiamos el estado local
    if (!authState.refreshToken) {
      localStorage.removeItem('authTokens');
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
      return;
    }
    try {
      // 1. Informar al backend que invalide el token de refresco
      await logoutUser(authState.refreshToken);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // La sesión se cerrará aunque haya un error en el backend
    } finally {
      // 2. Limpiar los tokens del almacenamiento local
      localStorage.removeItem('authTokens');
      // 3. Actualizar el estado de la aplicación
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
    }
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
