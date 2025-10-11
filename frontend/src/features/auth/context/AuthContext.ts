import { createContext } from 'react';

// Definición de Tipos
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: unknown) => Promise<void>;
  logout: () => void;
}
// Creación y exportación del Contexto
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
