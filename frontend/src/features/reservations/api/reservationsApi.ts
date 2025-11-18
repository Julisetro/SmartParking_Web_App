import apiClient from '../../../shared/api/client';
import type { Reserva } from '../types/reservationsTypes';

/**
 * Obtiene la lista de reservas del usuario autenticado desde la API.
 *
 * El backend se encarga de filtrar las reservas para que solo devuelva
 * las que pertenecen al usuario que realiza la petición.
 *
 * @returns Una promesa que se resuelve con un array de objetos de tipo Reserva.
 */
export const getReservations = async (): Promise<Reserva[]> => {
  const response = await apiClient.get<Reserva[]>('/api/reservations/');
  return response.data;
};
