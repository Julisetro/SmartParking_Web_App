/**
 * Representa la estructura de un estado de reserva,
 * tal como se recibe desde la API. El serializer solo expone el nombre.
 */
export interface EstadoReserva {
  nombre: string;
}

/**
 * Representa la estructura de un objeto de reserva,
 * tal como se recibe desde la API del backend.
 */
export interface Reserva {
  id: number;
  // StringRelatedField devuelve la representación de cadena del usuario (ej: email o username).
  user: string;
  // Objeto anidado que contiene el nombre del estado.
  estado: EstadoReserva;
  // Las fechas y horas se reciben como strings en formato ISO 8601.
  fecha: string;
  hora_inicio: string;
  hora_salida: string | null;
  // Se usa string para valores monetarios para evitar errores de precisión.
  tarifa_hora: string;
  total_pago: string;
  codigo_qr: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
