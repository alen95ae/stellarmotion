-- ============================================================================
-- MÓDULO CRM - STELLARMOTION ERP
-- Pipeline completo: Lead → Cuenta + Contacto → Oportunidad → Campaña → Facturación
-- ============================================================================

-- Tipos ENUM para el CRM
CREATE TYPE crm_account_type AS ENUM ('anunciante', 'partner', 'agencia', 'gobierno');
CREATE TYPE crm_lead_source AS ENUM ('web', 'referral', 'email', 'phone', 'event', 'social', 'other');
CREATE TYPE crm_lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE crm_opportunity_stage AS ENUM ('lead_qualified', 'contact_established', 'proposal_sent', 'negotiation', 'won', 'lost');
CREATE TYPE crm_activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'campaign_created', 'stage_changed');
CREATE TYPE crm_timeline_entity_type AS ENUM ('lead', 'account', 'opportunity', 'contact');

-- ============================================================================
-- 1. CRM LEADS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Información básica
  nombre TEXT NOT NULL,
  apellidos TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  empresa TEXT,
  cargo TEXT,
  
  -- Clasificación
  source crm_lead_source DEFAULT 'web',
  status crm_lead_status DEFAULT 'new',
  score INTEGER DEFAULT 0, -- Lead scoring (0-100)
  
  -- Información OOH específica
  pais TEXT,
  ciudad TEXT,
  interes_en_soportes TEXT[], -- Array de IDs de soportes de interés
  presupuesto_estimado DECIMAL(12, 2),
  tipo_cuenta_interes crm_account_type,
  
  -- Metadata
  notas TEXT,
  metadata JSONB, -- Datos adicionales flexibles
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Índices
  CONSTRAINT crm_leads_email_owner UNIQUE (email, owner_id)
);

CREATE INDEX idx_crm_leads_owner ON crm_leads(owner_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_leads_score ON crm_leads(score DESC);
CREATE INDEX idx_crm_leads_created_at ON crm_leads(created_at DESC);

-- ============================================================================
-- 2. CRM ACCOUNTS (Cuentas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Información básica
  nombre TEXT NOT NULL,
  tipo crm_account_type NOT NULL,
  email TEXT,
  telefono TEXT,
  sitio_web TEXT,
  
  -- Dirección
  direccion TEXT,
  ciudad TEXT NOT NULL,
  estado_provincia TEXT,
  pais TEXT NOT NULL,
  codigo_postal TEXT,
  
  -- Información fiscal (España/USA)
  tax_id TEXT, -- CIF/NIF (España) o EIN (USA)
  razon_social TEXT,
  representante_legal TEXT,
  
  -- Información OOH específica
  soportes_asociados UUID[], -- Array de IDs de soportes que posee/administra
  es_propietario_soportes BOOLEAN DEFAULT false,
  es_anunciante BOOLEAN DEFAULT false,
  es_agencia BOOLEAN DEFAULT false,
  
  -- Métricas
  valor_total_oportunidades DECIMAL(12, 2) DEFAULT 0,
  valor_total_campanas DECIMAL(12, 2) DEFAULT 0,
  numero_campanas INTEGER DEFAULT 0,
  
  -- Metadata
  notas TEXT,
  metadata JSONB,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Relación con lead original (si fue convertido)
  converted_from_lead_id UUID REFERENCES crm_leads(id),
  
  CONSTRAINT crm_accounts_nombre_owner UNIQUE (nombre, owner_id)
);

CREATE INDEX idx_crm_accounts_owner ON crm_accounts(owner_id);
CREATE INDEX idx_crm_accounts_tipo ON crm_accounts(tipo);
CREATE INDEX idx_crm_accounts_pais ON crm_accounts(pais);
CREATE INDEX idx_crm_accounts_ciudad ON crm_accounts(ciudad);
CREATE INDEX idx_crm_accounts_converted_from ON crm_accounts(converted_from_lead_id);

-- ============================================================================
-- 3. CRM CONTACTS (Contactos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  account_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
  
  -- Información básica
  nombre TEXT NOT NULL,
  apellidos TEXT,
  email TEXT,
  telefono TEXT,
  cargo TEXT,
  departamento TEXT,
  
  -- Información adicional
  es_decision_maker BOOLEAN DEFAULT false,
  es_contacto_principal BOOLEAN DEFAULT false,
  
  -- Metadata
  notas TEXT,
  metadata JSONB,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Relación con lead original (si fue convertido)
  converted_from_lead_id UUID REFERENCES crm_leads(id)
);

CREATE INDEX idx_crm_contacts_owner ON crm_contacts(owner_id);
CREATE INDEX idx_crm_contacts_account ON crm_contacts(account_id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);

-- ============================================================================
-- 4. CRM PIPELINE STAGES (Etapas del pipeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  nombre TEXT NOT NULL,
  orden INTEGER NOT NULL,
  stage_type crm_opportunity_stage NOT NULL,
  color TEXT DEFAULT '#e94446',
  
  -- Configuración
  probabilidad_cierre INTEGER DEFAULT 0, -- 0-100
  requiere_actividad BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT crm_pipeline_stages_owner_orden UNIQUE (owner_id, orden)
);

-- Insertar etapas por defecto
INSERT INTO crm_pipeline_stages (owner_id, nombre, orden, stage_type, probabilidad_cierre, color) VALUES
  ((SELECT id FROM usuarios LIMIT 1), 'Lead cualificado', 1, 'lead_qualified', 10, '#e94446'),
  ((SELECT id FROM usuarios LIMIT 1), 'Contacto establecido', 2, 'contact_established', 25, '#f59e0b'),
  ((SELECT id FROM usuarios LIMIT 1), 'Propuesta enviada', 3, 'proposal_sent', 50, '#3b82f6'),
  ((SELECT id FROM usuarios LIMIT 1), 'Negociación', 4, 'negotiation', 75, '#8b5cf6'),
  ((SELECT id FROM usuarios LIMIT 1), 'Ganada', 5, 'won', 100, '#10b981'),
  ((SELECT id FROM usuarios LIMIT 1), 'Perdida', 6, 'lost', 0, '#ef4444')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. CRM OPPORTUNITIES (Oportunidades)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Relaciones
  account_id UUID NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  stage_id UUID NOT NULL REFERENCES crm_pipeline_stages(id),
  
  -- Información básica
  nombre TEXT NOT NULL,
  descripcion TEXT,
  
  -- Valores económicos
  importe_estimado DECIMAL(12, 2) NOT NULL DEFAULT 0,
  importe_final DECIMAL(12, 2),
  moneda TEXT DEFAULT 'EUR', -- EUR para España, USD para USA
  
  -- Pipeline
  probabilidad_cierre INTEGER DEFAULT 0, -- 0-100
  fecha_cierre_estimada DATE,
  fecha_cierre_real DATE,
  
  -- Información OOH específica
  soportes_vinculados UUID[], -- Array de IDs de soportes publicitarios
  tipo_campana TEXT, -- 'display', 'digital', 'mixta'
  duracion_estimada_dias INTEGER,
  fecha_inicio_estimada DATE,
  fecha_fin_estimada DATE,
  
  -- Estados
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  motivo_perdida TEXT,
  
  -- Metadata
  notas TEXT,
  metadata JSONB,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Relación con lead original (si fue convertido)
  converted_from_lead_id UUID REFERENCES crm_leads(id)
);

CREATE INDEX idx_crm_opportunities_owner ON crm_opportunities(owner_id);
CREATE INDEX idx_crm_opportunities_account ON crm_opportunities(account_id);
CREATE INDEX idx_crm_opportunities_stage ON crm_opportunities(stage_id);
CREATE INDEX idx_crm_opportunities_fecha_cierre ON crm_opportunities(fecha_cierre_estimada);
CREATE INDEX idx_crm_opportunities_is_won ON crm_opportunities(is_won);
CREATE INDEX idx_crm_opportunities_is_lost ON crm_opportunities(is_lost);

-- ============================================================================
-- 6. CRM ACTIVITIES (Actividades)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Relaciones (puede asociarse a lead, account, opportunity, contact)
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  account_id UUID REFERENCES crm_accounts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES crm_opportunities(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  
  -- Información de la actividad
  tipo crm_activity_type NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Fechas
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  fecha_recordatorio TIMESTAMPTZ,
  
  -- Estado
  completada BOOLEAN DEFAULT false,
  fecha_completada TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB, -- Para emails: {subject, to, from, body}, para calls: {duration, notes}
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Validación: al menos una relación debe existir
  CONSTRAINT crm_activities_has_relation CHECK (
    lead_id IS NOT NULL OR 
    account_id IS NOT NULL OR 
    opportunity_id IS NOT NULL OR 
    contact_id IS NOT NULL
  )
);

CREATE INDEX idx_crm_activities_owner ON crm_activities(owner_id);
CREATE INDEX idx_crm_activities_lead ON crm_activities(lead_id);
CREATE INDEX idx_crm_activities_account ON crm_activities(account_id);
CREATE INDEX idx_crm_activities_opportunity ON crm_activities(opportunity_id);
CREATE INDEX idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX idx_crm_activities_tipo ON crm_activities(tipo);
CREATE INDEX idx_crm_activities_completada ON crm_activities(completada);
CREATE INDEX idx_crm_activities_fecha_recordatorio ON crm_activities(fecha_recordatorio) WHERE fecha_recordatorio IS NOT NULL;

-- ============================================================================
-- 7. CRM TIMELINE (Timeline unificada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Entidad relacionada (polimórfica)
  entity_type crm_timeline_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Información del evento
  evento_tipo TEXT NOT NULL, -- 'stage_changed', 'email_sent', 'call_made', 'note_added', 'campaign_created', etc.
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Relación con actividad (si aplica)
  activity_id UUID REFERENCES crm_activities(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB, -- Datos específicos del evento
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  
  -- Índice compuesto para búsquedas eficientes
  CONSTRAINT crm_timeline_entity_check CHECK (
    (entity_type = 'lead' AND entity_id IN (SELECT id FROM crm_leads WHERE owner_id = crm_timeline.owner_id)) OR
    (entity_type = 'account' AND entity_id IN (SELECT id FROM crm_accounts WHERE owner_id = crm_timeline.owner_id)) OR
    (entity_type = 'opportunity' AND entity_id IN (SELECT id FROM crm_opportunities WHERE owner_id = crm_timeline.owner_id)) OR
    (entity_type = 'contact' AND entity_id IN (SELECT id FROM crm_contacts WHERE owner_id = crm_timeline.owner_id))
  )
);

CREATE INDEX idx_crm_timeline_owner ON crm_timeline(owner_id);
CREATE INDEX idx_crm_timeline_entity ON crm_timeline(entity_type, entity_id);
CREATE INDEX idx_crm_timeline_created_at ON crm_timeline(created_at DESC);
CREATE INDEX idx_crm_timeline_activity ON crm_timeline(activity_id);

-- ============================================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_accounts_updated_at BEFORE UPDATE ON crm_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_opportunities_updated_at BEFORE UPDATE ON crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_pipeline_stages_updated_at BEFORE UPDATE ON crm_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. FUNCIONES DE AUTOMATIZACIÓN
-- ============================================================================

-- Función para calcular lead score automáticamente
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_record crm_leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Email válido: +10
  IF lead_record.email IS NOT NULL AND lead_record.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    score := score + 10;
  END IF;
  
  -- Teléfono: +10
  IF lead_record.telefono IS NOT NULL AND length(lead_record.telefono) > 5 THEN
    score := score + 10;
  END IF;
  
  -- Empresa: +15
  IF lead_record.empresa IS NOT NULL AND length(lead_record.empresa) > 2 THEN
    score := score + 15;
  END IF;
  
  -- Presupuesto estimado: +20 si > 1000
  IF lead_record.presupuesto_estimado IS NOT NULL AND lead_record.presupuesto_estimado > 1000 THEN
    score := score + 20;
  END IF;
  
  -- Interés en soportes: +15 si tiene soportes
  IF lead_record.interes_en_soportes IS NOT NULL AND array_length(lead_record.interes_en_soportes, 1) > 0 THEN
    score := score + 15;
  END IF;
  
  -- País/ciudad: +10
  IF lead_record.pais IS NOT NULL THEN
    score := score + 5;
  END IF;
  IF lead_record.ciudad IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  -- Source: referral o event tienen más valor
  IF lead_record.source IN ('referral', 'event') THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(score, 100); -- Máximo 100
END;
$$ LANGUAGE plpgsql;

-- Función para crear timeline entry automáticamente
CREATE OR REPLACE FUNCTION create_timeline_entry(
  p_owner_id UUID,
  p_entity_type crm_timeline_entity_type,
  p_entity_id UUID,
  p_evento_tipo TEXT,
  p_titulo TEXT,
  p_descripcion TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_timeline_id UUID;
BEGIN
  INSERT INTO crm_timeline (
    owner_id,
    entity_type,
    entity_id,
    evento_tipo,
    titulo,
    descripcion,
    metadata,
    created_by
  ) VALUES (
    p_owner_id,
    p_entity_type,
    p_entity_id,
    p_evento_tipo,
    p_titulo,
    p_descripcion,
    p_metadata,
    p_created_by
  ) RETURNING id INTO v_timeline_id;
  
  RETURN v_timeline_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar métricas de cuenta cuando cambia una oportunidad
CREATE OR REPLACE FUNCTION update_account_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.is_won != NEW.is_won OR OLD.importe_final != NEW.importe_final) THEN
    -- Recalcular métricas de la cuenta
    UPDATE crm_accounts
    SET 
      valor_total_oportunidades = (
        SELECT COALESCE(SUM(importe_estimado), 0)
        FROM crm_opportunities
        WHERE account_id = NEW.account_id AND owner_id = NEW.owner_id
      ),
      valor_total_campanas = (
        SELECT COALESCE(SUM(importe_final), 0)
        FROM crm_opportunities
        WHERE account_id = NEW.account_id 
          AND owner_id = NEW.owner_id 
          AND is_won = true
      ),
      numero_campanas = (
        SELECT COUNT(*)
        FROM crm_opportunities
        WHERE account_id = NEW.account_id 
          AND owner_id = NEW.owner_id 
          AND is_won = true
      ),
      updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_metrics
  AFTER UPDATE ON crm_opportunities
  FOR EACH ROW
  WHEN (OLD.is_won IS DISTINCT FROM NEW.is_won OR OLD.importe_final IS DISTINCT FROM NEW.importe_final)
  EXECUTE FUNCTION update_account_metrics();

-- ============================================================================
-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================
COMMENT ON TABLE crm_leads IS 'Leads potenciales que aún no son cuentas';
COMMENT ON TABLE crm_accounts IS 'Cuentas (anunciantes, partners, agencias)';
COMMENT ON TABLE crm_contacts IS 'Contactos asociados a cuentas';
COMMENT ON TABLE crm_opportunities IS 'Oportunidades de negocio en el pipeline';
COMMENT ON TABLE crm_pipeline_stages IS 'Etapas configurables del pipeline de ventas';
COMMENT ON TABLE crm_activities IS 'Actividades (llamadas, emails, reuniones, notas)';
COMMENT ON TABLE crm_timeline IS 'Timeline unificada de eventos para leads, cuentas, oportunidades y contactos';

COMMENT ON COLUMN crm_leads.score IS 'Lead scoring automático (0-100)';
COMMENT ON COLUMN crm_accounts.soportes_asociados IS 'Array de IDs de soportes que posee o administra esta cuenta';
COMMENT ON COLUMN crm_opportunities.soportes_vinculados IS 'Array de IDs de soportes publicitarios vinculados a esta oportunidad';
COMMENT ON COLUMN crm_opportunities.moneda IS 'EUR para España, USD para USA';


