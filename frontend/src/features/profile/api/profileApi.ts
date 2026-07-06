import apiClient from '../../../shared/api/client';
import type {
  ChangePasswordData,
  ChangeEmailData,
  ChangeCelularData,
  ChangeCelularConfirmData,
} from '../components/types/profileTypes';
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

/**
 * LLama a la API del backend para cambiar el correo del usuario autenticado.
 * @param data - Un objeto que contiene la contraseña actual y el nuevo email.
 * Debe coincider con la estructura que espera ChangeEmailData
 * @returns Una promesa que resuelve con 'void' si la operacion es exitosa
 */
export const changeEmail = async (data: ChangeEmailData): Promise<void> => {
  // Usamos el apiClient para enviar una petición POST a la URL del backend.
  // La ruta '/users/change-email/' se concatena con la URL base configurada en apiClient.
  // El objeto 'data' se envía como el cuerpo (body) de la petición en formato JSON.
  await apiClient.post('/users/change-email/', data);
};

/**
 * LLama a la API del backend para cambiar el celular del usuario autenticado.
 * @param data - Un objeto que contiene la contraseña actual y el nuevo celular.
 * Debe coincider con la estructura que espera ChangeCelularData
 * @returns Una promesa que resuelve con 'void' si la operacion es exitosa
 */
export const changeCelular = async (data: ChangeCelularData): Promise<void> => {
  // Usamos el apiClient para enviar una petición POST al endpoint correspondiente del backend
  // La ruta '/users/change-celular/' se concatena con la URL base configurada en apiClient.
  // El objeto 'data' se envía como el cuerpo (body) de la petición en formato JSON.
  await apiClient.post('/users/change-celular/', data);
};

/**
 * Envía el codigo de verificación al backend para confirmar y finalizar el cambio de numero de celular.
 * @param data - Un objeto que contiene el codigo de verificación.
 * Debe coincider con la estructura que espera ChangeCelularConfirmData
 * @returns Una promesa que resuelve con 'void' si la operacion es exitosa
 */
export const changeCelularConfirm = async (
  data: ChangeCelularConfirmData
): Promise<void> => {
  // Usamos el apiClient para enviar una petición POST al endpoint correspondiente del backend
  // La ruta '/users/confirm-celular/' se concatena con la URL base configurada en apiClient.
  // El objeto 'data' se envía como el cuerpo (body) de la petición en formato JSON.
  await apiClient.post('/users/change-celular/confirm/', data);
};
