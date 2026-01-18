/**
 * Tipos TypeScript para el sistema de alquileres
 */

export type EstadoAlquiler = 'pendiente' | 'reservada' | 'activa' | 'completada' | 'cancelada';

export interface Alquiler {
  id: string;
  numero: string;
  soporte_id: string;
  usuario_id: string;
  fecha_inicio: string; // ISO date string
  fecha_fin: string; // ISO date string
  meses: number;
  precio_alquiler: number;
  precio_comision: number;
  precio_servicios: number | null; // Puede ser NULL, default 0
  precio_total: number;
  servicios_adicionales: Record<string, any> | any[]; // JSONB, default []
  estado: EstadoAlquiler;
  created_at: string;
}

export interface AlquilerWithRelations extends Alquiler {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    empresa?: string;
  } | null;
  soporte: {
    id: string;
    nombre: string;
    codigo_interno?: string;
    codigo_cliente?: string;
    tipo_soporte?: string;
  } | null;
}

export interface CreateAlquilerDTO {
  soporte_id: string;
  usuario_id: string;
  fecha_inicio: string; // ISO date string
  meses: number;
  servicios_adicionales: string[]; // Array de IDs de servicios
}

export interface CreateAlquilerResponse {
  success: boolean;
  numero: string;
  alquiler_id: string;
  message?: string;
}

export interface ServicioAdicional {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
}

