import apiClient from '../../../shared/api/client';
import type { ChangePasswordData } from '../components/types/profileTypes';
import type { User } from '../../auth/context/AuthContext';

/**
 * LLama a la API del backend para cambiar la contraseña del usuario autenticado.
 * @param data - Un objeto que contiene la contraseña antigua y las nuevas contraseñas.
 * Debe coincider con la estructura que espera el backend.
 * @returns Una promesa que resuelve con 'void' si la operacion es exitosa, o se rechaza en caso de error.
 */
export const changePassword = async (
  data: ChangePasswordData
): Promise<void> => {
  // El apiClient se encarga de enviar la petición a la URL base + la ruta especificada
  await apiClient.post('/users/change-password/', data);
};

/**
 * Llama a la API del backend para actualizsar los datos del perfil del usuario.
 * @param userData - Objeto que contiene los nuevos datos del usuario.
 * Debe ser un Partial<User> para permitir actualizar parcialmente los datos.
 * @returns Una promesa que resuelve con el objeto User actualizado si la operacion es exitosa.
 */
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  // El apiClient se encarga de enviar la petición a la URL base + la ruta especificada
  const response = await apiClient.put<User>('/users/me/', userData);
  return response.data;
};
