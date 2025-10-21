/**
 * Interfaz que define la estructura de los datos necesarios para el registro de un usuario.
 * Coincide con los campos esperados por el backend.
 */
export interface UserRegistrationData {
  email: string;
  password?: string; // Es opcional en el tipo para flexibilidad, pero requerida por el formulario
  first_name: string;
  last_name: string;
  cedula: string;
  celular: string;
}

// Interfaz para los tokens de autentificación que se espera del backend
export interface AuthTokens {
  access: string;
  refresh: string;
}
