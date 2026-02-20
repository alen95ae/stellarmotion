// ============================================================================
// CRM LEADS - Lógica de negocio
// ============================================================================

import { getAdminSupabase } from '@/lib/supabase-admin';
import type { CRMLead, CreateLeadDTO } from '@/types/crm';

/**
 * Crear un nuevo lead
 */
export async function createLead(ownerId: string, data: CreateLeadDTO): Promise<CRMLead> {
  const supabase = getAdminSupabase();
  
  // Calcular score inicial
  let score = 0;
  if (data.email) score += 10;
  if (data.telefono) score += 10;
  if (data.empresa) score += 15;
  if (data.presupuesto_estimado && data.presupuesto_estimado > 1000) score += 20;
  if (data.interes_en_soportes && data.interes_en_soportes.length > 0) score += 15;
  if (data.pais) score += 5;
  if (data.ciudad) score += 5;
  if (data.source === 'referral' || data.source === 'event') score += 10;
  score = Math.min(score, 100);
  
  const leadData = {
    owner_id: ownerId,
    nombre: data.nombre.trim(),
    apellidos: data.apellidos?.trim() || null,
    email: data.email.trim().toLowerCase(),
    telefono: data.telefono?.trim() || null,
    empresa: data.empresa?.trim() || null,
    cargo: data.cargo?.trim() || null,
    source: data.source || 'web',
    status: 'new' as const,
    score,
    pais: data.pais?.trim() || null,
    ciudad: data.ciudad?.trim() || null,
    interes_en_soportes: data.interes_en_soportes || null,
    presupuesto_estimado: data.presupuesto_estimado || null,
    tipo_cuenta_interes: data.tipo_cuenta_interes || null,
    notas: data.notas?.trim() || null,
    metadata: data.metadata || null,
    created_by: ownerId,
    updated_by: ownerId,
  };
  
  const { data: lead, error } = await supabase
    .from('crm_leads')
    .insert([leadData])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error al crear lead: ${error.message}`);
  }
  
  // Crear entrada en timeline
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'lead',
    p_entity_id: lead.id,
    p_evento_tipo: 'lead_created',
    p_titulo: 'Lead creado',
    p_descripcion: `Lead "${data.nombre}" creado desde ${data.source}`,
    p_created_by: ownerId,
  });
  
  return lead;
}

/**
 * Obtener leads con filtros
 */
export async function getLeads(
  ownerId: string,
  filters?: {
    status?: string;
    source?: string;
    minScore?: number;
    search?: string;
  }
): Promise<CRMLead[]> {
  const supabase = getAdminSupabase();
  
  let query = supabase
    .from('crm_leads')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.source) {
    query = query.eq('source', filters.source);
  }
  
  if (filters?.minScore) {
    query = query.gte('score', filters.minScore);
  }
  
  if (filters?.search) {
    query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error al obtener leads: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Actualizar lead
 */
export async function updateLead(
  ownerId: string,
  leadId: string,
  updates: Partial<CreateLeadDTO>
): Promise<CRMLead> {
  const supabase = getAdminSupabase();
  
  // Recalcular score si cambian campos relevantes
  const updateData: Record<string, unknown> = {
    ...updates,
    updated_by: ownerId,
  };
  
  if (updates.email || updates.telefono || updates.empresa || updates.presupuesto_estimado) {
    // Obtener lead actual para recalcular score
    const { data: currentLead } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', leadId)
      .eq('owner_id', ownerId)
      .single();
    
    if (currentLead) {
      const mergedData = { ...currentLead, ...updates };
      let score = 0;
      if (mergedData.email) score += 10;
      if (mergedData.telefono) score += 10;
      if (mergedData.empresa) score += 15;
      if (mergedData.presupuesto_estimado && mergedData.presupuesto_estimado > 1000) score += 20;
      if (mergedData.interes_en_soportes && mergedData.interes_en_soportes.length > 0) score += 15;
      if (mergedData.pais) score += 5;
      if (mergedData.ciudad) score += 5;
      if (mergedData.source === 'referral' || mergedData.source === 'event') score += 10;
      updateData.score = Math.min(score, 100);
    }
  }
  
  const { data: lead, error } = await supabase
    .from('crm_leads')
    .update(updateData)
    .eq('id', leadId)
    .eq('owner_id', ownerId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error al actualizar lead: ${error.message}`);
  }
  
  // Crear entrada en timeline si hay cambios significativos
  if (updates.status) {
    await supabase.rpc('create_timeline_entry', {
      p_owner_id: ownerId,
      p_entity_type: 'lead',
      p_entity_id: leadId,
      p_evento_tipo: 'status_changed',
      p_titulo: `Estado cambiado a ${updates.status}`,
      p_created_by: ownerId,
    });
  }
  
  return lead;
}

/**
 * Eliminar lead
 */
export async function deleteLead(ownerId: string, leadId: string): Promise<void> {
  const supabase = getAdminSupabase();
  
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', leadId)
    .eq('owner_id', ownerId);
  
  if (error) {
    throw new Error(`Error al eliminar lead: ${error.message}`);
  }
}


