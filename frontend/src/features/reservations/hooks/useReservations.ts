import { useState, useEffect } from 'react';
import { getReservations } from '../api/reservationsApi';
import type { Reserva } from '../types/reservationsTypes';

/**
 * Hook personalizado para obtener y gestionar las reservas de un usuario.
 *
 * Encapsula la lógica de fetching de datos, el estado de carga y los errores.
 *
 * @returns Un objeto con la lista de reservas, el estado de carga y un posible error.
 */
export const useReservations = () => {
  // Estado para almacenar la lista de reservas.
  const [reservations, setReservations] = useState<Reserva[]>([]);
  // Estado para saber si la petición está en curso.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Estado para almacenar cualquier error que ocurra durante la petición.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define una función asíncrona dentro del useEffect para poder usar await.
    const fetchReservations = async () => {
      try {
        // Inicia la carga.
        setIsLoading(true);
        // Llama a la función de la API para obtener las reservas.
        const data = await getReservations();
        // Actualiza el estado con las reservas obtenidas.
        setReservations(data);
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
    };

    // Llama a la función para iniciar la obtención de datos.
    fetchReservations();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez.

  // Devuelve los estados para que puedan ser utilizados por los componentes.
  return { reservations, isLoading, error };
};
