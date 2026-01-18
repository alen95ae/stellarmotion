-- ============================================================================
-- EJEMPLOS DE QUERIES CRM - STELLARMOTION ERP
-- ============================================================================

-- ============================================================================
-- 1. OBTENER PIPELINE COMPLETO CON RELACIONES (Para Kanban)
-- ============================================================================
SELECT 
  o.id,
  o.nombre,
  o.importe_estimado,
  o.importe_final,
  o.moneda,
  o.probabilidad_cierre,
  o.fecha_cierre_estimada,
  o.soportes_vinculados,
  o.is_won,
  o.is_lost,
  o.created_at,
  -- Relaciones
  a.nombre as account_nombre,
  a.tipo as account_tipo,
  c.nombre as contact_nombre,
  c.email as contact_email,
  s.nombre as stage_nombre,
  s.stage_type,
  s.orden as stage_orden,
  s.color as stage_color
FROM crm_opportunities o
LEFT JOIN crm_accounts a ON o.account_id = a.id
LEFT JOIN crm_contacts c ON o.contact_id = c.id
LEFT JOIN crm_pipeline_stages s ON o.stage_id = s.id
WHERE o.owner_id = $1
  AND o.is_won = false
  AND o.is_lost = false
ORDER BY s.orden ASC, o.created_at DESC;

-- ============================================================================
-- 2. OBTENER TIMELINE DE UNA OPORTUNIDAD
-- ============================================================================
SELECT 
  t.*,
  u.nombre as created_by_name
FROM crm_timeline t
LEFT JOIN usuarios u ON t.created_by = u.id
WHERE t.owner_id = $1
  AND t.entity_type = 'opportunity'
  AND t.entity_id = $2
ORDER BY t.created_at DESC;

-- ============================================================================
-- 3. OBTENER CUENTAS CON MÉTRICAS
-- ============================================================================
SELECT 
  a.*,
  COUNT(DISTINCT o.id) as total_oportunidades,
  COUNT(DISTINCT CASE WHEN o.is_won THEN o.id END) as oportunidades_ganadas,
  COUNT(DISTINCT c.id) as total_contactos,
  COALESCE(SUM(CASE WHEN o.is_won THEN o.importe_final ELSE 0 END), 0) as valor_total_ganado
FROM crm_accounts a
LEFT JOIN crm_opportunities o ON a.id = o.account_id
LEFT JOIN crm_contacts c ON a.id = c.account_id
WHERE a.owner_id = $1
GROUP BY a.id
ORDER BY a.created_at DESC;

-- ============================================================================
-- 4. OBTENER LEADS POR SCORE (Top leads)
-- ============================================================================
SELECT *
FROM crm_leads
WHERE owner_id = $1
  AND status IN ('new', 'contacted', 'qualified')
ORDER BY score DESC, created_at DESC
LIMIT 20;

-- ============================================================================
-- 5. OBTENER ACTIVIDADES PENDIENTES
-- ============================================================================
SELECT 
  a.*,
  CASE 
    WHEN a.lead_id IS NOT NULL THEN 'lead'
    WHEN a.account_id IS NOT NULL THEN 'account'
    WHEN a.opportunity_id IS NOT NULL THEN 'opportunity'
    WHEN a.contact_id IS NOT NULL THEN 'contact'
  END as entity_type,
  CASE 
    WHEN a.lead_id IS NOT NULL THEN l.nombre
    WHEN a.account_id IS NOT NULL THEN acc.nombre
    WHEN a.opportunity_id IS NOT NULL THEN opp.nombre
    WHEN a.contact_id IS NOT NULL THEN c.nombre
  END as entity_nombre
FROM crm_activities a
LEFT JOIN crm_leads l ON a.lead_id = l.id
LEFT JOIN crm_accounts acc ON a.account_id = acc.id
LEFT JOIN crm_opportunities opp ON a.opportunity_id = opp.id
LEFT JOIN crm_contacts c ON a.contact_id = c.id
WHERE a.owner_id = $1
  AND a.completada = false
  AND (a.fecha_recordatorio IS NULL OR a.fecha_recordatorio <= NOW())
ORDER BY a.fecha_recordatorio ASC NULLS LAST, a.created_at DESC;

-- ============================================================================
-- 6. OBTENER OPORTUNIDADES POR ETAPA (Para estadísticas)
-- ============================================================================
SELECT 
  s.nombre as stage_nombre,
  s.stage_type,
  s.orden,
  COUNT(o.id) as total_oportunidades,
  COALESCE(SUM(o.importe_estimado), 0) as valor_total_estimado,
  COALESCE(SUM(CASE WHEN o.is_won THEN o.importe_final ELSE 0 END), 0) as valor_total_ganado
FROM crm_pipeline_stages s
LEFT JOIN crm_opportunities o ON s.id = o.stage_id AND o.owner_id = $1 AND o.is_lost = false
WHERE s.owner_id = $1
GROUP BY s.id, s.nombre, s.stage_type, s.orden
ORDER BY s.orden ASC;

-- ============================================================================
-- 7. BUSCAR LEADS/CUENTAS POR TEXTO
-- ============================================================================
-- Leads
SELECT * FROM crm_leads
WHERE owner_id = $1
  AND (
    nombre ILIKE '%' || $2 || '%'
    OR email ILIKE '%' || $2 || '%'
    OR empresa ILIKE '%' || $2 || '%'
  )
ORDER BY score DESC;

-- Cuentas
SELECT * FROM crm_accounts
WHERE owner_id = $1
  AND (
    nombre ILIKE '%' || $2 || '%'
    OR email ILIKE '%' || $2 || '%'
  )
ORDER BY created_at DESC;

-- ============================================================================
-- 8. OBTENER OPORTUNIDADES CON SOPORTES VINCULADOS
-- ============================================================================
SELECT 
  o.*,
  s.nombre as soporte_nombre,
  s.ubicacion as soporte_ubicacion,
  s.precio as soporte_precio
FROM crm_opportunities o
CROSS JOIN LATERAL unnest(COALESCE(o.soportes_vinculados, ARRAY[]::UUID[])) AS soporte_id
LEFT JOIN soportes s ON soporte_id = s.id
WHERE o.owner_id = $1
  AND o.id = $2;

-- ============================================================================
-- 9. OBTENER TIMELINE UNIFICADA DE UNA CUENTA (con todas sus relaciones)
-- ============================================================================
(
  SELECT 
    'account' as entity_type,
    a.id as entity_id,
    t.*
  FROM crm_timeline t
  JOIN crm_accounts a ON t.entity_id = a.id
  WHERE t.owner_id = $1 AND a.id = $2
)
UNION ALL
(
  SELECT 
    'opportunity' as entity_type,
    o.id as entity_id,
    t.*
  FROM crm_timeline t
  JOIN crm_opportunities o ON t.entity_id = o.id
  WHERE t.owner_id = $1 AND o.account_id = $2
)
UNION ALL
(
  SELECT 
    'contact' as entity_type,
    c.id as entity_id,
    t.*
  FROM crm_timeline t
  JOIN crm_contacts c ON t.entity_id = c.id
  WHERE t.owner_id = $1 AND c.account_id = $2
)
ORDER BY created_at DESC;

-- ============================================================================
-- 10. ACTUALIZAR ETAPA DE OPORTUNIDAD (con trigger automático)
-- ============================================================================
UPDATE crm_opportunities
SET 
  stage_id = $3,
  probabilidad_cierre = (SELECT probabilidad_cierre FROM crm_pipeline_stages WHERE id = $3),
  updated_by = $1,
  updated_at = NOW()
WHERE id = $2
  AND owner_id = $1
RETURNING *;

-- El trigger automáticamente:
-- 1. Actualiza métricas de la cuenta
-- 2. Si stage_type = 'won', establece is_won = true y fecha_cierre_real
-- 3. Si stage_type = 'lost', establece is_lost = true y fecha_cierre_real


