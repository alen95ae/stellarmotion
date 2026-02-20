// ============================================================================
// CRM OPPORTUNITIES - Lógica de negocio
// ============================================================================

import { getAdminSupabase } from '@/lib/supabase-admin';
import type { CRMOpportunity, CreateOpportunityDTO, UpdateOpportunityStageDTO } from '@/types/crm';

/**
 * Crear una nueva oportunidad
 */
export async function createOpportunity(
  ownerId: string,
  data: CreateOpportunityDTO
): Promise<CRMOpportunity> {
  const supabase = getAdminSupabase();
  
  // Obtener el primer stage del pipeline (lead_qualified)
  const { data: firstStage } = await supabase
    .from('crm_pipeline_stages')
    .select('id, probabilidad_cierre')
    .eq('owner_id', ownerId)
    .order('orden', { ascending: true })
    .limit(1)
    .single();
  
  if (!firstStage) {
    throw new Error('No se encontró ninguna etapa en el pipeline');
  }
  
  const opportunityData = {
    owner_id: ownerId,
    account_id: data.account_id,
    contact_id: data.contact_id || null,
    stage_id: firstStage.id,
    nombre: data.nombre.trim(),
    descripcion: data.descripcion?.trim() || null,
    importe_estimado: data.importe_estimado,
    importe_final: null,
    moneda: data.moneda || 'EUR',
    probabilidad_cierre: firstStage.probabilidad_cierre,
    fecha_cierre_estimada: data.fecha_cierre_estimada || null,
    fecha_cierre_real: null,
    soportes_vinculados: data.soportes_vinculados || null,
    tipo_campana: data.tipo_campana || null,
    duracion_estimada_dias: data.duracion_estimada_dias || null,
    fecha_inicio_estimada: null,
    fecha_fin_estimada: null,
    is_won: false,
    is_lost: false,
    motivo_perdida: null,
    notas: data.notas?.trim() || null,
    metadata: null,
    created_by: ownerId,
    updated_by: ownerId,
  };
  
  const { data: opportunity, error } = await supabase
    .from('crm_opportunities')
    .insert([opportunityData])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error al crear oportunidad: ${error.message}`);
  }
  
  // Crear entrada en timeline
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'opportunity',
    p_entity_id: opportunity.id,
    p_evento_tipo: 'opportunity_created',
    p_titulo: 'Oportunidad creada',
    p_descripcion: `Oportunidad "${data.nombre}" creada`,
    p_metadata: {
      importe_estimado: data.importe_estimado,
      moneda: opportunityData.moneda,
    },
    p_created_by: ownerId,
  });
  
  return opportunity;
}

/**
 * Actualizar etapa de una oportunidad (drag & drop en pipeline)
 */
export async function updateOpportunityStage(
  ownerId: string,
  data: UpdateOpportunityStageDTO
): Promise<CRMOpportunity> {
  const supabase = getAdminSupabase();
  
  // Verificar que la oportunidad existe y pertenece al owner
  const { data: currentOpp } = await supabase
    .from('crm_opportunities')
    .select('*')
    .eq('id', data.opportunity_id)
    .eq('owner_id', ownerId)
    .single();
  
  if (!currentOpp) {
    throw new Error('Oportunidad no encontrada');
  }
  
  // Obtener información del nuevo stage
  const { data: newStage } = await supabase
    .from('crm_pipeline_stages')
    .select('*')
    .eq('id', data.stage_id)
    .eq('owner_id', ownerId)
    .single();
  
  if (!newStage) {
    throw new Error('Etapa no encontrada');
  }
  
  // Actualizar oportunidad
  const updateData: Record<string, unknown> = {
    stage_id: data.stage_id,
    probabilidad_cierre: newStage.probabilidad_cierre,
    updated_by: ownerId,
  };
  
  // Si se mueve a "won" o "lost", actualizar flags
  if (newStage.stage_type === 'won') {
    updateData.is_won = true;
    updateData.is_lost = false;
    updateData.fecha_cierre_real = new Date().toISOString().split('T')[0];
    // Si no hay importe_final, usar importe_estimado
    if (!currentOpp.importe_final) {
      updateData.importe_final = currentOpp.importe_estimado;
    }
  } else if (newStage.stage_type === 'lost') {
    updateData.is_won = false;
    updateData.is_lost = true;
    updateData.fecha_cierre_real = new Date().toISOString().split('T')[0];
  }
  
  const { data: opportunity, error } = await supabase
    .from('crm_opportunities')
    .update(updateData)
    .eq('id', data.opportunity_id)
    .eq('owner_id', ownerId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error al actualizar oportunidad: ${error.message}`);
  }
  
  // Crear entrada en timeline
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'opportunity',
    p_entity_id: opportunity.id,
    p_evento_tipo: 'stage_changed',
    p_titulo: `Etapa cambiada a "${newStage.nombre}"`,
    p_descripcion: data.notas || `Oportunidad movida a etapa ${newStage.nombre}`,
    p_metadata: {
      previous_stage_id: currentOpp.stage_id,
      new_stage_id: data.stage_id,
      probabilidad_cierre: newStage.probabilidad_cierre,
    },
    p_created_by: ownerId,
  });
  
  // Si se ganó, crear actividad para crear campaña
  if (newStage.stage_type === 'won') {
    await supabase.rpc('create_timeline_entry', {
      p_owner_id: ownerId,
      p_entity_type: 'opportunity',
      p_entity_id: opportunity.id,
      p_evento_tipo: 'opportunity_won',
      p_titulo: 'Oportunidad ganada',
      p_descripcion: `Oportunidad ganada con importe de ${opportunity.importe_final || opportunity.importe_estimado} ${opportunity.moneda}`,
      p_metadata: {
        importe_final: opportunity.importe_final || opportunity.importe_estimado,
        moneda: opportunity.moneda,
      },
      p_created_by: ownerId,
    });
  }
  
  return opportunity;
}

/**
 * Obtener oportunidades con relaciones
 */
export async function getOpportunities(
  ownerId: string,
  filters?: {
    account_id?: string;
    stage_id?: string;
    is_won?: boolean;
    is_lost?: boolean;
  }
): Promise<CRMOpportunity[]> {
  const supabase = getAdminSupabase();
  
  let query = supabase
    .from('crm_opportunities')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  
  if (filters?.account_id) {
    query = query.eq('account_id', filters.account_id);
  }
  
  if (filters?.stage_id) {
    query = query.eq('stage_id', filters.stage_id);
  }
  
  if (filters?.is_won !== undefined) {
    query = query.eq('is_won', filters.is_won);
  }
  
  if (filters?.is_lost !== undefined) {
    query = query.eq('is_lost', filters.is_lost);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error al obtener oportunidades: ${error.message}`);
  }
  
  return data || [];
}


