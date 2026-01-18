// ============================================================================
// CRM AUTOMATIZACIONES - Lógica de negocio
// ============================================================================

import { getAdminSupabase } from '@/lib/supabase-admin';
import type { CRMOpportunity } from '@/types/crm';

/**
 * Verificar y crear actividades automáticas si no hay seguimiento reciente
 */
export async function checkAndCreateFollowUpActivities(ownerId: string): Promise<void> {
  const supabase = getAdminSupabase();
  
  // Obtener oportunidades activas (no ganadas ni perdidas) sin actividad en los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: opportunities } = await supabase
    .from('crm_opportunities')
    .select('id, nombre, account_id, contact_id, stage_id')
    .eq('owner_id', ownerId)
    .eq('is_won', false)
    .eq('is_lost', false);
  
  if (!opportunities) return;
  
  for (const opp of opportunities) {
    // Verificar última actividad
    const { data: lastActivity } = await supabase
      .from('crm_activities')
      .select('created_at')
      .eq('owner_id', ownerId)
      .eq('opportunity_id', opp.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const needsFollowUp = !lastActivity || 
      new Date(lastActivity.created_at) < sevenDaysAgo;
    
    if (needsFollowUp) {
      // Crear actividad de seguimiento automática
      await supabase
        .from('crm_activities')
        .insert({
          owner_id: ownerId,
          opportunity_id: opp.id,
          account_id: opp.account_id,
          contact_id: opp.contact_id,
          tipo: 'task',
          titulo: `Seguimiento automático: ${opp.nombre}`,
          descripcion: 'Actividad creada automáticamente por falta de seguimiento',
          fecha_recordatorio: new Date().toISOString(),
          completada: false,
          created_by: ownerId,
          updated_by: ownerId,
        });
      
      // Registrar en timeline
      await supabase.rpc('create_timeline_entry', {
        p_owner_id: ownerId,
        p_entity_type: 'opportunity',
        p_entity_id: opp.id,
        p_evento_tipo: 'follow_up_reminder',
        p_titulo: 'Recordatorio de seguimiento',
        p_descripcion: 'Sistema detectó falta de seguimiento, actividad creada automáticamente',
        p_created_by: ownerId,
      });
    }
  }
}

/**
 * Cuando una oportunidad se marca como "Ganada", crear campaña y notificar
 */
export async function handleWonOpportunity(
  ownerId: string,
  opportunity: CRMOpportunity
): Promise<{ campaignCreated: boolean; campaignId?: string }> {
  const supabase = getAdminSupabase();
  
  // 1. Crear entrada en timeline
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'opportunity',
    p_entity_id: opportunity.id,
    p_evento_tipo: 'opportunity_won',
    p_titulo: 'Oportunidad ganada',
    p_descripcion: `Oportunidad ganada. Importe final: ${opportunity.importe_final || opportunity.importe_estimado} ${opportunity.moneda}`,
    p_metadata: {
      importe_final: opportunity.importe_final || opportunity.importe_estimado,
      moneda: opportunity.moneda,
      soportes_vinculados: opportunity.soportes_vinculados,
    },
    p_created_by: ownerId,
  });
  
  // 2. Crear actividad para crear campaña
  const { data: activity } = await supabase
    .from('crm_activities')
    .insert({
      owner_id: ownerId,
      opportunity_id: opportunity.id,
      account_id: opportunity.account_id,
      tipo: 'task',
      titulo: `Crear campaña para: ${opportunity.nombre}`,
      descripcion: `Oportunidad ganada. Crear campaña con soportes vinculados.`,
      fecha_recordatorio: new Date().toISOString(),
      completada: false,
      metadata: {
        action: 'create_campaign',
        opportunity_id: opportunity.id,
        soportes: opportunity.soportes_vinculados,
        importe: opportunity.importe_final || opportunity.importe_estimado,
      },
      created_by: ownerId,
      updated_by: ownerId,
    })
    .select()
    .single();
  
  // 3. Registrar en timeline de la cuenta
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'account',
    p_entity_id: opportunity.account_id,
    p_evento_tipo: 'opportunity_won',
    p_titulo: `Oportunidad ganada: ${opportunity.nombre}`,
    p_descripcion: `Nueva oportunidad ganada por ${opportunity.importe_final || opportunity.importe_estimado} ${opportunity.moneda}`,
    p_metadata: {
      opportunity_id: opportunity.id,
      importe: opportunity.importe_final || opportunity.importe_estimado,
    },
    p_created_by: ownerId,
  });
  
  // NOTA: La creación real de la campaña se haría en el módulo de campañas
  // Aquí solo creamos la actividad y timeline para que el usuario sepa que debe crear la campaña
  
  return {
    campaignCreated: false, // Se creará manualmente o mediante otro proceso
  };
}


