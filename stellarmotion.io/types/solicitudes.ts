/**
 * Tipos para solicitudes (tabla solicitudes existente).
 * El alquiler solo se crea cuando el owner acepta.
 */

export type EstadoSolicitud = 'pendiente' | 'vista' | 'aceptada' | 'rechazada';

export interface Solicitud {
  id: string;
  numero?: string | null;
  soporte_id: string;
  usuario_id: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  meses: number;
  servicios_adicionales?: Record<string, unknown> | unknown[] | null;
  estado: EstadoSolicitud;
  mensaje?: string | null;
  brand_message?: string | null;
  respuesta_owner?: string | null;
  precio_mes_snapshot?: number | null;
  subtotal?: number | null;
  comision_plataforma?: number | null;
  total_estimado?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SolicitudWithRelations extends Solicitud {
  usuario?: {
    id: string;
    nombre: string | null;
    email: string;
    telefono?: string | null;
    empresa?: string | null;
  } | null;
  soporte?: {
    id: string;
    titulo?: string | null;
    codigo_interno?: string | null;
    codigo_cliente?: string | null;
    tipo_soporte?: string | null;
    usuario_id?: string | null;
  } | null;
}

export interface CreateSolicitudDTO {
  soporte_id: string;
  usuario_id: string;
  fecha_inicio: string;
  fecha_fin?: string;
  meses: number;
  servicios_adicionales?: string[];
  mensaje?: string;
  brand_message?: string;
  precio_mes_snapshot?: number;
  subtotal?: number;
  comision_plataforma?: number;
  total_estimado?: number;
}

export interface CreateSolicitudResponse {
  success: boolean;
  numero?: string;
  solicitud_id: string;
  message?: string;
}
