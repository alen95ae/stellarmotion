// ============================================================================
// TIPOS TYPESCRIPT - MÓDULO CRM STELLARMOTION
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================
export type CRMAccountType = 'anunciante' | 'partner' | 'agencia' | 'gobierno';
export type CRMLeadSource = 'web' | 'referral' | 'email' | 'phone' | 'event' | 'social' | 'other';
export type CRMLeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type CRMOpportunityStage = 'lead_qualified' | 'contact_established' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
export type CRMActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'campaign_created' | 'stage_changed';
export type CRMTimelineEntityType = 'lead' | 'account' | 'opportunity' | 'contact';

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface CRMLead {
  id: string;
  owner_id: string;
  
  // Información básica
  nombre: string;
  apellidos?: string | null;
  email: string;
  telefono?: string | null;
  empresa?: string | null;
  cargo?: string | null;
  
  // Clasificación
  source: CRMLeadSource;
  status: CRMLeadStatus;
  score: number;
  
  // Información OOH específica
  pais?: string | null;
  ciudad?: string | null;
  interes_en_soportes?: string[] | null;
  presupuesto_estimado?: number | null;
  tipo_cuenta_interes?: CRMAccountType | null;
  
  // Metadata
  notas?: string | null;
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CRMAccount {
  id: string;
  owner_id: string;
  
  // Información básica
  nombre: string;
  tipo: CRMAccountType;
  email?: string | null;
  telefono?: string | null;
  sitio_web?: string | null;
  
  // Dirección
  direccion?: string | null;
  ciudad: string;
  estado_provincia?: string | null;
  pais: string;
  codigo_postal?: string | null;
  
  // Información fiscal
  tax_id?: string | null;
  razon_social?: string | null;
  representante_legal?: string | null;
  
  // Información OOH específica
  soportes_asociados?: string[] | null;
  es_propietario_soportes: boolean;
  es_anunciante: boolean;
  es_agencia: boolean;
  
  // Métricas
  valor_total_oportunidades: number;
  valor_total_campanas: number;
  numero_campanas: number;
  
  // Metadata
  notas?: string | null;
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  converted_from_lead_id?: string | null;
}

export interface CRMContact {
  id: string;
  owner_id: string;
  account_id?: string | null;
  
  // Información básica
  nombre: string;
  apellidos?: string | null;
  email?: string | null;
  telefono?: string | null;
  cargo?: string | null;
  departamento?: string | null;
  
  // Información adicional
  es_decision_maker: boolean;
  es_contacto_principal: boolean;
  
  // Metadata
  notas?: string | null;
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  converted_from_lead_id?: string | null;
}

export interface CRMPipelineStage {
  id: string;
  owner_id: string;
  nombre: string;
  orden: number;
  stage_type: CRMOpportunityStage;
  color: string;
  probabilidad_cierre: number;
  requiere_actividad: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMOpportunity {
  id: string;
  owner_id: string;
  
  // Relaciones
  account_id: string;
  contact_id?: string | null;
  stage_id: string;
  
  // Información básica
  nombre: string;
  descripcion?: string | null;
  
  // Valores económicos
  importe_estimado: number;
  importe_final?: number | null;
  moneda: string;
  
  // Pipeline
  probabilidad_cierre: number;
  fecha_cierre_estimada?: string | null;
  fecha_cierre_real?: string | null;
  
  // Información OOH específica
  soportes_vinculados?: string[] | null;
  tipo_campana?: string | null;
  duracion_estimada_dias?: number | null;
  fecha_inicio_estimada?: string | null;
  fecha_fin_estimada?: string | null;
  
  // Estados
  is_won: boolean;
  is_lost: boolean;
  motivo_perdida?: string | null;
  
  // Metadata
  notas?: string | null;
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  converted_from_lead_id?: string | null;
}

export interface CRMActivity {
  id: string;
  owner_id: string;
  
  // Relaciones (al menos una debe existir)
  lead_id?: string | null;
  account_id?: string | null;
  opportunity_id?: string | null;
  contact_id?: string | null;
  
  // Información de la actividad
  tipo: CRMActivityType;
  titulo: string;
  descripcion?: string | null;
  
  // Fechas
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  fecha_recordatorio?: string | null;
  
  // Estado
  completada: boolean;
  fecha_completada?: string | null;
  
  // Metadata
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CRMTimelineEntry {
  id: string;
  owner_id: string;
  
  // Entidad relacionada (polimórfica)
  entity_type: CRMTimelineEntityType;
  entity_id: string;
  
  // Información del evento
  evento_tipo: string;
  titulo: string;
  descripcion?: string | null;
  
  // Relación con actividad
  activity_id?: string | null;
  
  // Metadata
  metadata?: Record<string, any> | null;
  
  // Auditoría
  created_at: string;
  created_by?: string | null;
}

// ============================================================================
// DTOs (Data Transfer Objects) para requests/responses
// ============================================================================

export interface CreateLeadDTO {
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
  source?: CRMLeadSource;
  pais?: string;
  ciudad?: string;
  interes_en_soportes?: string[];
  presupuesto_estimado?: number;
  tipo_cuenta_interes?: CRMAccountType;
  notas?: string;
  metadata?: Record<string, any>;
}

export interface ConvertLeadDTO {
  lead_id: string;
  account_name: string;
  account_tipo: CRMAccountType;
  contact_nombre: string;
  contact_apellidos?: string;
  create_opportunity?: boolean;
  opportunity_nombre?: string;
  opportunity_importe_estimado?: number;
}

export interface CreateOpportunityDTO {
  account_id: string;
  contact_id?: string;
  nombre: string;
  descripcion?: string;
  importe_estimado: number;
  moneda?: string;
  fecha_cierre_estimada?: string;
  soportes_vinculados?: string[];
  tipo_campana?: string;
  duracion_estimada_dias?: number;
  notas?: string;
}

export interface UpdateOpportunityStageDTO {
  opportunity_id: string;
  stage_id: string;
  notas?: string;
}

export interface CreateActivityDTO {
  lead_id?: string;
  account_id?: string;
  opportunity_id?: string;
  contact_id?: string;
  tipo: CRMActivityType;
  titulo: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_recordatorio?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// RESPONSES CON RELACIONES
// ============================================================================

export interface CRMOpportunityWithRelations extends CRMOpportunity {
  account?: CRMAccount;
  contact?: CRMContact;
  stage?: CRMPipelineStage;
  timeline?: CRMTimelineEntry[];
  activities?: CRMActivity[];
}

export interface CRMAccountWithRelations extends CRMAccount {
  contacts?: CRMContact[];
  opportunities?: CRMOpportunity[];
  timeline?: CRMTimelineEntry[];
}

export interface CRMLeadWithRelations extends CRMLead {
  timeline?: CRMTimelineEntry[];
  activities?: CRMActivity[];
}


