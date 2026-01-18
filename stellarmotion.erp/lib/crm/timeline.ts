// ============================================================================
// CRM TIMELINE - Lógica de negocio
// ============================================================================

import { getAdminSupabase } from '@/lib/supabase-admin';
import type { CRMTimelineEntry, CRMTimelineEntityType } from '@/types/crm';

/**
 * Obtener timeline de una entidad
 */
export async function getTimeline(
  ownerId: string,
  entityType: CRMTimelineEntityType,
  entityId: string
): Promise<CRMTimelineEntry[]> {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from('crm_timeline')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error al obtener timeline: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Crear entrada en timeline (helper)
 */
export async function addTimelineEntry(
  ownerId: string,
  entityType: CRMTimelineEntityType,
  entityId: string,
  evento_tipo: string,
  titulo: string,
  descripcion?: string,
  metadata?: Record<string, any>,
  createdBy?: string
): Promise<string> {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_evento_tipo: evento_tipo,
    p_titulo: titulo,
    p_descripcion: descripcion || null,
    p_metadata: metadata || null,
    p_created_by: createdBy || ownerId,
  });
  
  if (error) {
    throw new Error(`Error al crear entrada en timeline: ${error.message}`);
  }
  
  return data;
}


