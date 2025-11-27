// src/features/reservations/hooks/useReservations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReservations } from './useReservations';
import { getReservations } from '../api/reservationsApi';
import type { Reserva } from '../types/reservationsTypes';


// Mock de la API para aislar el hook de la implementación real.
vi.mock('../api/reservationsApi', () => ({
  getReservations: vi.fn(),
}));

describe('Hook - useReservations', () => {
  // Datos de ejemplo para las pruebas.
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

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada prueba.
    // Asegura que console.error no imprima durante las pruebas, pero nos permite comprobar si fue llamado.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Test 1: Estado inicial.
  it('debe devolver el estado inicial correctamente', () => {
    // Renderiza el hook.
    const { result } = renderHook(() => useReservations());

    // Verifica que el estado inicial es el esperado.
    expect(result.current.reservations).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // Test 2: Carga exitosa de datos.
  it('debe cargar las reservas exitosamente y actualizar el estado', async () => {
    // Configura el mock para que devuelva las reservas exitosamente.
    vi.mocked(getReservations).mockResolvedValue(mockReservations);

    const { result } = renderHook(() => useReservations());

    // Verifica el estado de carga inicial.
    expect(result.current.isLoading).toBe(true);

    // Espera a que el hook termine su ciclo asíncrono y actualice el estado.
    await waitFor(() => {
      // Verifica que las reservas se cargaron.
      expect(result.current.reservations).toEqual(mockReservations);
      // Verifica que isLoading se puso en false.
      expect(result.current.isLoading).toBe(false);
      // Verifica que no hay errores.
      expect(result.current.error).toBeNull();
    });
    // Asegura que la función de la API fue llamada.
    expect(getReservations).toHaveBeenCalledTimes(1);
  });

  // Test 3: Manejo de errores durante la carga de datos.
  it('debe manejar errores al cargar las reservas y actualizar el estado de error', async () => {
    // Configura el mock para que simule un error.
    const errorMessage = 'Error de la API';
    vi.mocked(getReservations).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useReservations());

    // Espera a que el hook termine su ciclo asíncrono.
    await waitFor(() => {
      // Verifica que las reservas están vacías.
      expect(result.current.reservations).toEqual([]);
      // Verifica que isLoading se puso en false.
      expect(result.current.isLoading).toBe(false);
      // Verifica que el error se capturó.
      expect(result.current.error).toBe('Ocurrió un error al obtener las reservas.');
    });
    // Asegura que la función de la API fue llamada.
    expect(getReservations).toHaveBeenCalledTimes(1);
    // Verifica que el error fue logueado en la consola.
    expect(console.error).toHaveBeenCalled();
  });

  // Test 4: La función refetchReservations recarga los datos.
  it('debe recargar las reservas cuando se llama a refetchReservations', async () => {
    // Primera configuración del mock para la carga inicial.
    vi.mocked(getReservations).mockResolvedValue(mockReservations);

    const { result } = renderHook(() => useReservations());

    await waitFor(() => {
      expect(result.current.reservations).toEqual(mockReservations);
      expect(result.current.isLoading).toBe(false);
    });

    // Nueva configuración del mock para la recarga, simulando datos diferentes.
    const updatedReservations: Reserva[] = [
      ...mockReservations,
      {
        id: 3,
        user: 'test@user.com',
        estado: { id: 1, nombre: 'Activa' },
        fecha: '2025-12-03',
        hora_inicio: '09:00:00',
        hora_salida: '10:00:00',
        tarifa_hora: '3500.00',
        total_pago: '3500.00',
        codigo_qr: 'qr-code-3',
        fecha_creacion: '2025-12-03T08:00:00Z',
        fecha_actualizacion: '2025-12-03T08:00:00Z',
      },
    ];
    vi.mocked(getReservations).mockResolvedValue(updatedReservations);

    // Llama a la función de recarga.
    act(() => {
      result.current.refetchReservations();
    });

    // Verifica el estado de carga durante la recarga.
    expect(result.current.isLoading).toBe(true);

    // Espera a que el hook recargue y actualice el estado.
    await waitFor(() => {
      expect(result.current.reservations).toEqual(updatedReservations);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    // Asegura que getReservations fue llamado dos veces (carga inicial + recarga).
    expect(getReservations).toHaveBeenCalledTimes(2);
  });

  // Test 5: refetchReservations puede recuperarse de un error.
  it('refetchReservations debe poder recuperarse de un error previo', async () => {
    // Simula un error inicial.
    vi.mocked(getReservations).mockRejectedValueOnce(new Error('Initial error'));

    const { result } = renderHook(() => useReservations());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    // Configura el mock para que la siguiente llamada sea exitosa.
    vi.mocked(getReservations).mockResolvedValue(mockReservations);

    act(() => {
      result.current.refetchReservations();
    });

    // Verifica el estado de carga durante la recarga.
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.reservations).toEqual(mockReservations);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull(); // El error debe haberse limpiado.
    });
    expect(getReservations).toHaveBeenCalledTimes(2);
  });
});
