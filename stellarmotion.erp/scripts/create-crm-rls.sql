-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - MÓDULO CRM
-- ============================================================================

-- Habilitar RLS en todas las tablas CRM
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA CRM_LEADS
-- ============================================================================
CREATE POLICY "Users can view their own leads"
  ON crm_leads FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own leads"
  ON crm_leads FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own leads"
  ON crm_leads FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own leads"
  ON crm_leads FOR DELETE
  USING (owner_id = auth.uid()::text);

-- ============================================================================
-- POLÍTICAS PARA CRM_ACCOUNTS
-- ============================================================================
CREATE POLICY "Users can view their own accounts"
  ON crm_accounts FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own accounts"
  ON crm_accounts FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own accounts"
  ON crm_accounts FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own accounts"
  ON crm_accounts FOR DELETE
  USING (owner_id = auth.uid()::text);

-- ============================================================================
-- POLÍTICAS PARA CRM_CONTACTS
-- ============================================================================
CREATE POLICY "Users can view their own contacts"
  ON crm_contacts FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own contacts"
  ON crm_contacts FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own contacts"
  ON crm_contacts FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own contacts"
  ON crm_contacts FOR DELETE
  USING (owner_id = auth.uid()::text);

-- ============================================================================
-- POLÍTICAS PARA CRM_OPPORTUNITIES
-- ============================================================================
CREATE POLICY "Users can view their own opportunities"
  ON crm_opportunities FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own opportunities"
  ON crm_opportunities FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own opportunities"
  ON crm_opportunities FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own opportunities"
  ON crm_opportunities FOR DELETE
  USING (owner_id = auth.uid()::text);

-- ============================================================================
-- POLÍTICAS PARA CRM_ACTIVITIES
-- ============================================================================
CREATE POLICY "Users can view their own activities"
  ON crm_activities FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own activities"
  ON crm_activities FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own activities"
  ON crm_activities FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own activities"
  ON crm_activities FOR DELETE
  USING (owner_id = auth.uid()::text);

-- ============================================================================
-- POLÍTICAS PARA CRM_TIMELINE
-- ============================================================================
CREATE POLICY "Users can view their own timeline"
  ON crm_timeline FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own timeline"
  ON crm_timeline FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

-- Timeline es solo lectura para usuarios (se crea automáticamente)
CREATE POLICY "Users cannot update timeline"
  ON crm_timeline FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete timeline"
  ON crm_timeline FOR DELETE
  USING (false);

-- ============================================================================
-- POLÍTICAS PARA CRM_PIPELINE_STAGES
-- ============================================================================
CREATE POLICY "Users can view their own pipeline stages"
  ON crm_pipeline_stages FOR SELECT
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can insert their own pipeline stages"
  ON crm_pipeline_stages FOR INSERT
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can update their own pipeline stages"
  ON crm_pipeline_stages FOR UPDATE
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their own pipeline stages"
  ON crm_pipeline_stages FOR DELETE
  USING (owner_id = auth.uid()::text);


