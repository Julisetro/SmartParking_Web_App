// src/features/reservations/api/reservationsApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../shared/api/client';
import {
  getReservations,
  createReservation,
  cancelReservation,
} from './reservationsApi';
import type { Reserva } from '../types/reservationsTypes';

// Mock del módulo apiClient para aislar las pruebas de la implementación real de Axios.
vi.mock('../../../shared/api/client', () => ({
  // Esto crea un mock por defecto para todo el módulo.
  // Es importante usar 'vi.fn()' para poder espiar las llamadas.
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Datos de ejemplo que se usarán en las pruebas.
const mockReservations: Reserva[] = [
    {
      id: 1,
      user: 'test@user.com',
      estado: { id: 1, nombre: 'Activa' },
      fecha: '2025-12-01',
      hora_inicio: '10:00:00',
      hora_salida: '11:00:00',
      tarifa_hora: '4000.00',
      total_pago: '4000.00',
      codigo_qr: 'qr-code-1',
      fecha_creacion: '2025-12-01T09:00:00Z',
      fecha_actualizacion: '2025-12-01T09:00:00Z',
    },
  {
    id: 2,
    user: 'test@user.com',
    estado: { id: 2, nombre: 'Completada' },
    fecha: '2025-12-02',
    hora_inicio: '14:00:00',
    hora_salida: '15:00:00',
    tarifa_hora: '4000.00',
    total_pago: '4000.00',
    codigo_qr: 'qr-code-2',
    fecha_creacion: '2025-12-02T13:00:00Z',
    fecha_actualizacion: '2025-12-02T13:00:00Z',
  },
];

// 'describe' agrupa pruebas relacionadas bajo un mismo título.
describe('API - reservationsApi', () => {
  // 'beforeEach' se ejecuta antes de cada 'it' (test).
  // Es útil para limpiar los mocks y asegurar que cada prueba sea independiente.
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia el historial de todas las funciones mockeadas.
  });

  // Grupo de pruebas para la función getReservations.
  describe('getReservations', () => {
    it('debe obtener la lista de reservas exitosamente', async () => {
      // Configuración del mock: Cuando se llame a apiClient.get, debe devolver
      // una respuesta exitosa con los datos de 'mockReservations'.
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReservations });

      // Ejecución: Llama a la función que se está probando.
      const reservations = await getReservations();

      // Afirmación: Verifica que el resultado es el esperado.
      expect(reservations).toEqual(mockReservations);
      // Verifica que el método 'get' fue llamado en el endpoint correcto.
      expect(apiClient.get).toHaveBeenCalledWith('/reservations/');
      // Verifica que se llamó solo una vez.
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores al obtener las reservas', async () => {
      // Configuración del mock: Simula un error de red.
      const mockError = new Error('Error de red');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Afirmación: Espera que la función lance una excepción.
      // 'expect(...).rejects' es la forma de probar promesas que fallan.
      await expect(getReservations()).rejects.toThrow('Error de red');
    });
  });

  // Grupo de pruebas para la función createReservation.
  describe('createReservation', () => {
    const newReservationData = { fecha: '2025-12-03', hora_inicio: '11:00:00' };
    const createdReservation: Reserva = { ...mockReservations[0], id: 3 };

    it('debe crear una reserva exitosamente', async () => {
      // Configuración del mock: apiClient.post debe devolver la reserva creada.
      vi.mocked(apiClient.post).mockResolvedValue({
        data: createdReservation,
      });

      // Ejecución: Llama a la función.
      const reservation = await createReservation(newReservationData);

      // Afirmación: Verifica el resultado y las llamadas al mock.
      expect(reservation).toEqual(createdReservation);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/reservations/',
        newReservationData
      );
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores al crear la reserva', async () => {
      // Configuración del mock: Simula un error al crear.
      const mockError = new Error('No se pudo crear la reserva');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      // Afirmación: Verifica que la promesa es rechazada con el error.
      await expect(createReservation(newReservationData)).rejects.toThrow(
        'No se pudo crear la reserva'
      );
    });
  });

  // Grupo de pruebas para la función cancelReservation.
  describe('cancelReservation', () => {
    const reservationIdToCancel = 1;
    const canceledReservation: Reserva = {
      ...mockReservations[0],
      estado: { id: 3, nombre: 'Cancelada' },
    };

    it('debe cancelar una reserva exitosamente', async () => {
      // Configuración del mock: Devuelve la reserva con el estado actualizado.
      vi.mocked(apiClient.post).mockResolvedValue({
        data: canceledReservation,
      });

      // Ejecución: Llama a la función.
      const reservation = await cancelReservation(reservationIdToCancel);

      // Afirmación: Verifica el resultado y las llamadas al mock.
      expect(reservation).toEqual(canceledReservation);
      expect(apiClient.post).toHaveBeenCalledWith(
        `/reservations/${reservationIdToCancel}/cancel/`
      );
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores al cancelar la reserva', async () => {
      // Configuración del mock: Simula un error al cancelar.
      const mockError = new Error('Error al cancelar');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      // Afirmación: Verifica que la promesa es rechazada con el error.
      await expect(cancelReservation(reservationIdToCancel)).rejects.toThrow(
        'Error al cancelar'
      );
    });
  });
});
