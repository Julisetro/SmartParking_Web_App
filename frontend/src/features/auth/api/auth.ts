import apiClient from '../../../shared/api/client';
import type { UserRegistrationData, AuthTokens } from '../types/authTypes';

/**
 * Llama a la API del backend para registrar un nuevo usuario
 *
 * @param userData - Objeto que contiene los datos de registro del usuario
 * Coincide con la estructura que espera UserRegistrationData
 * @returns Una promesa que resuelve con la respuesta de la API
 */

export const registerUser = (userData: UserRegistrationData) => {
  // El apiClient se encarga de enviar la petición a la URL base + la ruta especificada
  return apiClient.post('/users/register/', userData);
};

/**
 * Llama a la API del backend para iniciar sesión con las credenciales del usuarios
 *
 * @param email - Correo electrónico del usuario
 * @param password - Contraseña del usuario
 * @returns Una promesa que resuelve con un objeto que contiene los toekens de autenticación
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  // El apiClient se encarga de enviar la petición a la URL base + la ruta especificada
  const response = await apiClient.post<AuthTokens>('/users/login/', {
    email,
    password,
  });
  return response.data;
};

/**Llama a la API del backend para invalidar el token de refresco y cerrar la sesión del usuario autenticado
 * @param refreshToken - Token de refresco del usuario
 * @returns Una promesa que resuelve con 'void' si la operacion es exitosa, o se rechaza en caso de error.
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  await apiClient.post('/users/logout/', { refresh: refreshToken });
};
