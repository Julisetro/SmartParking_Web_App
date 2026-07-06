import { useState, useEffect, useCallback } from 'react';
import { getReservations } from '../api/reservationsApi';
import type { Reserva } from '../types/reservationsTypes';

/**
 * Hook personalizado para obtener y gestionar las reservas de un usuario.
 *
 * Encapsula la lógica de fetching de datos, el estado de carga, los errores
 * y proporciona una función para recargar los datos.
 *
 * @returns Un objeto con la lista de reservas, el estado de carga, un posible error
 *          y la función para recargar las reservas.
 */
export const useReservations = () => {
  // Estado para almacenar la lista de reservas.
  const [reservations, setReservations] = useState<Reserva[]>([]);
  // Estado para saber si la petición está en curso.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Estado para almacenar cualquier error que ocurra durante la petición.
  const [error, setError] = useState<string | null>(null);

  // Se envuelve la lógica de fetch en un useCallback para memoizar la función
  // y evitar que se recree en cada render, además de para poder retornarla.
  const fetchReservations = useCallback(async () => {
    try {
      // Inicia la carga.
      setIsLoading(true);
      // Llama a la función de la API para obtener las reservas.
      const data = await getReservations();
      // Actualiza el estado con las reservas obtenidas.
      setReservations(data);
      // Limpia cualquier error previo.
      setError(null);
    } catch (err) {
      // Si ocurre un error, lo captura y actualiza el estado de error.
      setError('Ocurrió un error al obtener las reservas.');
      // Imprime el error en la consola para depuración.
      console.error(err);
    } finally {
      // Se asegura de que el estado de carga se desactive, tanto si la
      // petición tuvo éxito como si falló.
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Llama a la función para la carga inicial de datos.
    fetchReservations();
  }, [fetchReservations]); // Se añade fetchReservations como dependencia del efecto.

  // Devuelve los estados y la función de recarga.
  return {
    reservations,
    isLoading,
    error,
    refetchReservations: fetchReservations,
  };
};
