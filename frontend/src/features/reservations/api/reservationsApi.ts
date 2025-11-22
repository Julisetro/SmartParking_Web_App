import apiClient from '../../../shared/api/client';
import type { Reserva } from '../types/reservationsTypes';

/**
 * Interface para los datos requeridos al crear una reserva.
 * El backend espera la fecha y la hora de inicio.
 */
interface CreateReservationData {
  fecha: string;
  hora_inicio: string;
}

/**
 * Obtiene la lista de reservas del usuario autenticado desde la API.
 *
 * El backend se encarga de filtrar las reservas para que solo devuelva
 * las que pertenecen al usuario que realiza la petición.
 *
 * @returns Una promesa que se resuelve con un array de objetos de tipo Reserva.
 */
export const getReservations = async (): Promise<Reserva[]> => {
  const response = await apiClient.get<Reserva[]>('/reservations/');
  return response.data;
};

/**
 * Crea una nueva reserva enviando los datos a la API.
 *
 * @param {CreateReservationData} reservationData - Los datos para la nueva reserva.
 * @returns Una promesa que se resuelve con el objeto de la reserva creada.
 */
export const createReservation = async (
  reservationData: CreateReservationData
): Promise<Reserva> => {
  const response = await apiClient.post<Reserva>(
    '/reservations/',
    reservationData
  );
  return response.data;
};

/**
 * Envía una petición para cancelar una reserva existente.
 *
 * @param {number} reservationId - El ID de la reserva a cancelar.
 * @returns Una promesa que se resuelve con el objeto de la reserva actualizada (con estado "Cancelada").
 */
export const cancelReservation = async (
  reservationId: number
): Promise<Reserva> => {
  // Llama a la acción personalizada 'cancel' en el endpoint de la reserva específica.
  const response = await apiClient.post<Reserva>(
    `/reservations/${reservationId}/cancel/`
  );
  return response.data;
};
