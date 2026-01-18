// ============================================================================
// CONVERSIÓN DE LEAD - Lógica de negocio
// ============================================================================

import { getAdminSupabase } from '@/lib/supabase-admin';
import type { ConvertLeadDTO, CRMAccount, CRMContact, CRMOpportunity } from '@/types/crm';

/**
 * Convertir un Lead en Cuenta + Contacto + Oportunidad (opcional)
 * 
 * Esta función:
 * 1. Crea una cuenta (account)
 * 2. Crea un contacto asociado
 * 3. Opcionalmente crea una oportunidad inicial
 * 4. Actualiza el estado del lead a 'converted'
 * 5. Registra todo en la timeline
 */
export async function convertLead(
  ownerId: string,
  data: ConvertLeadDTO
): Promise<{
  account: CRMAccount;
  contact: CRMContact;
  opportunity?: CRMOpportunity;
}> {
  const supabase = getAdminSupabase();
  
  // 1. Verificar que el lead existe y pertenece al owner
  const { data: lead, error: leadError } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', data.lead_id)
    .eq('owner_id', ownerId)
    .single();
  
  if (leadError || !lead) {
    throw new Error('Lead no encontrado o no tienes permisos');
  }
  
  // 2. Verificar que no existe ya una cuenta con el mismo nombre/email
  const { data: existingAccount } = await supabase
    .from('crm_accounts')
    .select('id')
    .eq('owner_id', ownerId)
    .or(`nombre.eq.${data.account_name},email.eq.${lead.email}`)
    .maybeSingle();
  
  if (existingAccount) {
    throw new Error('Ya existe una cuenta con este nombre o email');
  }
  
  // 3. Crear cuenta
  const accountData = {
    owner_id: ownerId,
    nombre: data.account_name.trim(),
    tipo: data.account_tipo,
    email: lead.email || null,
    telefono: lead.telefono || null,
    ciudad: lead.ciudad || 'No especificada',
    pais: lead.pais || 'España',
    es_anunciante: data.account_tipo === 'anunciante',
    es_agencia: data.account_tipo === 'agencia',
    es_propietario_soportes: data.account_tipo === 'partner',
    converted_from_lead_id: lead.id,
    created_by: ownerId,
    updated_by: ownerId,
  };
  
  const { data: account, error: accountError } = await supabase
    .from('crm_accounts')
    .insert([accountData])
    .select()
    .single();
  
  if (accountError) {
    throw new Error(`Error al crear cuenta: ${accountError.message}`);
  }
  
  // 4. Crear contacto
  const contactData = {
    owner_id: ownerId,
    account_id: account.id,
    nombre: data.contact_nombre.trim(),
    apellidos: data.contact_apellidos?.trim() || null,
    email: lead.email || null,
    telefono: lead.telefono || null,
    cargo: lead.cargo || null,
    es_contacto_principal: true,
    es_decision_maker: true,
    converted_from_lead_id: lead.id,
    created_by: ownerId,
    updated_by: ownerId,
  };
  
  const { data: contact, error: contactError } = await supabase
    .from('crm_contacts')
    .insert([contactData])
    .select()
    .single();
  
  if (contactError) {
    throw new Error(`Error al crear contacto: ${contactError.message}`);
  }
  
  // 5. Crear oportunidad inicial si se solicita
  let opportunity: CRMOpportunity | undefined;
  
  if (data.create_opportunity && data.opportunity_nombre) {
    // Obtener el primer stage del pipeline
    const { data: firstStage } = await supabase
      .from('crm_pipeline_stages')
      .select('id')
      .eq('owner_id', ownerId)
      .order('orden', { ascending: true })
      .limit(1)
      .single();
    
    if (firstStage) {
      const opportunityData = {
        owner_id: ownerId,
        account_id: account.id,
        contact_id: contact.id,
        stage_id: firstStage.id,
        nombre: data.opportunity_nombre.trim(),
        importe_estimado: data.opportunity_importe_estimado || 0,
        moneda: lead.pais === 'USA' || lead.pais === 'United States' ? 'USD' : 'EUR',
        probabilidad_cierre: 10,
        converted_from_lead_id: lead.id,
        created_by: ownerId,
        updated_by: ownerId,
      };
      
      const { data: opp, error: oppError } = await supabase
        .from('crm_opportunities')
        .insert([opportunityData])
        .select()
        .single();
      
      if (oppError) {
        console.error('Error al crear oportunidad:', oppError);
        // No fallar si la oportunidad no se crea
      } else {
        opportunity = opp;
      }
    }
  }
  
  // 6. Actualizar lead a 'converted'
  await supabase
    .from('crm_leads')
    .update({
      status: 'converted',
      updated_by: ownerId,
    })
    .eq('id', lead.id)
    .eq('owner_id', ownerId);
  
  // 7. Registrar en timeline
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'lead',
    p_entity_id: lead.id,
    p_evento_tipo: 'lead_converted',
    p_titulo: 'Lead convertido',
    p_descripcion: `Lead convertido en cuenta "${account.nombre}"`,
    p_metadata: {
      account_id: account.id,
      contact_id: contact.id,
      opportunity_id: opportunity?.id,
    },
    p_created_by: ownerId,
  });
  
  // Timeline para la cuenta
  await supabase.rpc('create_timeline_entry', {
    p_owner_id: ownerId,
    p_entity_type: 'account',
    p_entity_id: account.id,
    p_evento_tipo: 'account_created',
    p_titulo: 'Cuenta creada desde lead',
    p_descripcion: `Cuenta creada desde lead "${lead.nombre}"`,
    p_metadata: { lead_id: lead.id },
    p_created_by: ownerId,
  });
  
  return {
    account,
    contact,
    opportunity,
  };
}


