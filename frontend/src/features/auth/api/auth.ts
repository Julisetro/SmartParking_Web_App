import apiClient from '../../../shared/api/client';
import type { UserRegistrationData } from '../types/authTypes';

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
