/**
 * Lógica para la tabla solicitudes (existente).
 * Tabla real: brand_user_id, status, owner_response (sin numero).
 * Brand crea solicitud → Owner acepta/rechaza → al aceptar se crea alquiler.
 */

import { supabaseAdmin } from './supabase-sql';
import { fetchFromERP, ERP_ENDPOINTS } from './api-config';
import {
  Solicitud,
  SolicitudWithRelations,
  CreateSolicitudDTO,
  CreateSolicitudResponse,
  EstadoSolicitud,
} from '@/types/solicitudes';
import { createAlquiler } from './alquileres';

/** Mapea fila de BD (brand_user_id, status, owner_response) al tipo de app (usuario_id, estado, respuesta_owner). */
function mapRowToSolicitud(row: Record<string, unknown>): Solicitud {
  const {
    brand_user_id,
    status,
    owner_response,
    ...rest
  } = row;
  return {
    ...rest,
    usuario_id: brand_user_id as string,
    estado: (status as EstadoSolicitud) ?? 'pendiente',
    respuesta_owner: (owner_response as string | null) ?? null,
  } as Solicitud;
}

/**
 * Crear solicitud (desde ficha producto). NO crea alquiler.
 */
export async function createSolicitud(
  dto: CreateSolicitudDTO
): Promise<CreateSolicitudResponse> {
  if (!dto.soporte_id || !dto.usuario_id || !dto.fecha_inicio || dto.meses < 1) {
    throw new Error('Faltan campos requeridos');
  }

  const now = new Date().toISOString();
  const serviciosPayload = Array.isArray(dto.servicios_adicionales)
    ? dto.servicios_adicionales.reduce((acc: Record<string, unknown>, id) => {
        acc[id] = { id };
        return acc;
      }, {})
    : {};

  const insertPayload: Record<string, unknown> = {
    brand_user_id: dto.usuario_id,
    soporte_id: dto.soporte_id,
    fecha_inicio: dto.fecha_inicio,
    meses: dto.meses,
    servicios_adicionales: Object.keys(serviciosPayload).length ? serviciosPayload : [],
    status: 'pendiente',
    created_at: now,
    updated_at: now,
  };
  if (dto.fecha_fin != null) insertPayload.fecha_fin = dto.fecha_fin;
  if (dto.brand_message != null) insertPayload.brand_message = dto.brand_message;
  if (dto.precio_mes_snapshot != null) insertPayload.precio_mes_snapshot = dto.precio_mes_snapshot;
  if (dto.subtotal != null) insertPayload.subtotal = dto.subtotal;
  if (dto.comision_plataforma != null) insertPayload.comision_plataforma = dto.comision_plataforma;
  if (dto.total_estimado != null) insertPayload.total_estimado = dto.total_estimado;

  const { data: row, error } = await supabaseAdmin
    .from('solicitudes')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Error insertando solicitud:', error);
    throw error;
  }

  return {
    success: true,
    solicitud_id: row.id,
    message: 'Solicitud creada',
  };
}

/**
 * Listar solicitudes del brand (brand_user_id = userId).
 */
export async function getSolicitudesByBrand(
  usuarioId: string
): Promise<SolicitudWithRelations[]> {
  const { data: rows, error } = await supabaseAdmin
    .from('solicitudes')
    .select('*')
    .eq('brand_user_id', usuarioId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  return await enrichSolicitudes(rows.map((r) => mapRowToSolicitud(r as Record<string, unknown>)));
}

/**
 * Modo desarrollo: admin ve TODAS las solicitudes sin filtrar por brand ni owner.
 * Select completo + enrich (soportes, usuarios brand). Misma forma que el resto.
 */
export async function getAllSolicitudesForAdmin(): Promise<SolicitudWithRelations[]> {
  const { data: rows, error } = await supabaseAdmin
    .from('solicitudes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  const mapped = rows.map((r) => mapRowToSolicitud(r as Record<string, unknown>));
  return await enrichSolicitudes(mapped);
}

/**
 * Listar solicitudes cuyos soportes pertenecen al owner (soportes.usuario_id = ownerId).
 */
export async function getSolicitudesByOwner(
  ownerId: string
): Promise<SolicitudWithRelations[]> {
  const { data: soportesOwner } = await supabaseAdmin
    .from('soportes')
    .select('id')
    .eq('usuario_id', ownerId);

  const soporteIds = (soportesOwner || []).map((s: { id: string }) => s.id);
  if (soporteIds.length === 0) return [];

  const { data: rows, error } = await supabaseAdmin
    .from('solicitudes')
    .select('*')
    .in('soporte_id', soporteIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  return await enrichSolicitudes(rows.map((r) => mapRowToSolicitud(r as Record<string, unknown>)));
}

/** Normaliza código/título de soporte desde respuesta ERP (camelCase o snake_case). */
function normalizarSoporteFromERP(erp: Record<string, unknown>, id: string): { id: string; titulo: string | null; codigo_interno: string | null; codigo_cliente: string | null; tipo_soporte: string | null; usuario_id: string | null } {
  const codigo_interno =
    (erp.codigo_interno as string) ??
    (erp.codigoInterno as string) ??
    (erp.code as string) ??
    null;
  const codigo_cliente =
    (erp.codigo_cliente as string) ?? (erp.codigoCliente as string) ?? null;
  const titulo = (erp.titulo as string) ?? (erp.nombre as string) ?? (erp.title as string) ?? null;
  const tipo_soporte = (erp.tipo_soporte as string) ?? (erp.tipo as string) ?? null;
  const usuario_id = (erp.usuario_id as string) ?? (erp.usuarioId as string) ?? null;
  return {
    id,
    titulo: titulo ?? null,
    codigo_interno: codigo_interno ?? null,
    codigo_cliente: codigo_cliente ?? null,
    tipo_soporte: tipo_soporte ?? null,
    usuario_id: usuario_id ?? null,
  };
}

async function enrichSolicitudes(solicitudes: Solicitud[]): Promise<SolicitudWithRelations[]> {
  const usuarioIds = [...new Set(solicitudes.map((s) => s.usuario_id).filter(Boolean))];
  const soporteIds = [...new Set(solicitudes.map((s) => String(s.soporte_id)).filter(Boolean))];

  const [usuariosRes, soportesRes] = await Promise.all([
    supabaseAdmin.from('usuarios').select('id, nombre, email, telefono, empresa').in('id', usuarioIds),
    supabaseAdmin.from('soportes').select('id, titulo, codigo_interno, codigo_cliente, tipo_soporte, usuario_id').in('id', soporteIds),
  ]);

  const usuariosMap = new Map((usuariosRes.data || []).map((u) => [u.id, u]));
  const soportesMap = new Map<string, { id: string; titulo: string | null; codigo_interno: string | null; codigo_cliente: string | null; tipo_soporte: string | null; usuario_id: string | null }>(
    (soportesRes.data || []).map((s) => [
      String(s.id),
      {
        id: s.id,
        titulo: s.titulo ?? null,
        codigo_interno: s.codigo_interno ?? null,
        codigo_cliente: s.codigo_cliente ?? null,
        tipo_soporte: s.tipo_soporte ?? null,
        usuario_id: s.usuario_id ?? null,
      },
    ])
  );

  // Fallback ERP: para soporte_id sin datos en Supabase (o sin código), obtener desde ERP
  const idsSinCodigo = soporteIds.filter((id) => {
    const s = soportesMap.get(id);
    return !s || ((s.codigo_interno == null || s.codigo_interno === '') && (s.codigo_cliente == null || s.codigo_cliente === ''));
  });
  if (idsSinCodigo.length > 0) {
    const erpResults = await Promise.allSettled(
      idsSinCodigo.map(async (soporteId) => {
        try {
          const erpUrl = ERP_ENDPOINTS.support(soporteId);
          const data = await fetchFromERP(erpUrl);
          if (data && typeof data === 'object') {
            return { id: soporteId, data: data as Record<string, unknown> };
          }
        } catch {
          // ignorar errores por soporte; seguir con el resto
        }
        return { id: soporteId, data: null };
      })
    );
    erpResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.data) {
        const { id, data } = result.value;
        soportesMap.set(id, normalizarSoporteFromERP(data, id));
      }
    });
  }

  return solicitudes.map((s) => ({
    ...s,
    usuario: usuariosMap.get(s.usuario_id) ?? null,
    soporte: soportesMap.get(String(s.soporte_id)) ?? null,
  }));
}

/**
 * Obtener una solicitud por ID.
 */
export async function getSolicitudById(
  id: string
): Promise<SolicitudWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('solicitudes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  const [enriched] = await enrichSolicitudes([data]);
  return enriched ?? null;
}

/**
 * Comprobar si el usuario es owner del soporte de la solicitud.
 */
export async function isOwnerOfSolicitudSoporte(
  solicitudId: string,
  userId: string
): Promise<boolean> {
  const sol = await getSolicitudById(solicitudId);
  if (!sol?.soporte_id) return false;
  const { data } = await supabaseAdmin
    .from('soportes')
    .select('usuario_id')
    .eq('id', sol.soporte_id)
    .single();
  return data?.usuario_id === userId;
}

/**
 * Aceptar o rechazar solicitud. Solo el owner del soporte.
 * Al aceptar: se crea el alquiler a partir de la solicitud.
 */
export async function updateSolicitudEstado(
  solicitudId: string,
  userId: string,
  nuevoEstado: EstadoSolicitud
): Promise<{ success: boolean; alquiler_id?: string; error?: string }> {
  const isOwner = await isOwnerOfSolicitudSoporte(solicitudId, userId);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para actuar sobre esta solicitud' };
  }

  const solicitud = await getSolicitudById(solicitudId);
  if (!solicitud) return { success: false, error: 'Solicitud no encontrada' };
  if (solicitud.estado !== 'pendiente') {
    return { success: false, error: 'La solicitud ya fue procesada' };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('solicitudes')
    .update({ status: nuevoEstado, updated_at: now })
    .eq('id', solicitudId);

  if (updateError) {
    console.error('❌ Error actualizando solicitud:', updateError);
    return { success: false, error: updateError.message };
  }

  if (nuevoEstado === 'aceptada') {
    const serviciosIds = Array.isArray(solicitud.servicios_adicionales)
      ? Object.keys(solicitud.servicios_adicionales as Record<string, unknown>)
      : [];
    try {
      const result = await createAlquiler({
        soporte_id: solicitud.soporte_id,
        usuario_id: solicitud.usuario_id,
        fecha_inicio: solicitud.fecha_inicio,
        meses: solicitud.meses,
        servicios_adicionales: serviciosIds.length ? serviciosIds : [],
      });
      return { success: true, alquiler_id: result.alquiler_id };
    } catch (err: unknown) {
      console.error('❌ Error creando alquiler desde solicitud:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al crear alquiler',
      };
    }
  }

  return { success: true };
}

/**
 * Eliminar solicitud. Puede el owner del soporte o el brand que la creó.
 */
export async function deleteSolicitud(
  solicitudId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const solicitud = await getSolicitudById(solicitudId);
  if (!solicitud) return { success: false, error: 'Solicitud no encontrada' };
  const isOwner = await isOwnerOfSolicitudSoporte(solicitudId, userId);
  const isBrand = solicitud.usuario_id === userId;
  if (!isOwner && !isBrand) {
    return { success: false, error: 'No tienes permiso para eliminar esta solicitud' };
  }
  const { error } = await supabaseAdmin
    .from('solicitudes')
    .delete()
    .eq('id', solicitudId);
  if (error) {
    console.error('❌ Error eliminando solicitud:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
