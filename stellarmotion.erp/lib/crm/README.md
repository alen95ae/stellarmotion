# Módulo CRM - StellarMotion ERP

## Arquitectura

### Estructura de Carpetas

```
stellarmotion.erp/
├── scripts/
│   ├── create-crm-schema.sql      # Modelo de datos completo
│   └── create-crm-rls.sql         # Políticas RLS
├── types/
│   └── crm.ts                     # Tipos TypeScript
├── lib/crm/
│   ├── leads.ts                   # Lógica de leads
│   ├── convert-lead.ts           # Conversión de leads
│   ├── opportunities.ts          # Pipeline de oportunidades
│   ├── timeline.ts                # Timeline unificada
│   └── automations.ts             # Automatizaciones
└── app/api/crm/
    ├── leads/
    │   ├── route.ts               # GET, POST /api/crm/leads
    │   ├── [id]/route.ts          # PATCH, DELETE
    │   └── [id]/convert/route.ts  # POST /api/crm/leads/[id]/convert
    ├── opportunities/
    │   ├── route.ts               # GET, POST
    │   └── [id]/stage/route.ts    # PATCH (cambiar etapa)
    ├── accounts/
    │   └── route.ts               # GET, POST
    ├── timeline/
    │   └── route.ts               # GET
    ├── pipeline/stages/
    │   └── route.ts               # GET
    └── activities/
        └── route.ts               # GET, POST
```

## Pipeline de Oportunidades

### Etapas por defecto:
1. **Lead cualificado** (10% probabilidad)
2. **Contacto establecido** (25% probabilidad)
3. **Propuesta enviada** (50% probabilidad)
4. **Negociación** (75% probabilidad)
5. **Ganada** (100% probabilidad)
6. **Perdida** (0% probabilidad)

### Cambio de etapa:
- Endpoint: `PATCH /api/crm/opportunities/[id]/stage`
- Body: `{ stage_id: string, notas?: string }`
- Automáticamente actualiza probabilidad_cierre
- Si se mueve a "won" o "lost", actualiza flags y fecha_cierre_real
- Crea entrada en timeline

## Conversión de Lead

### Endpoint: `POST /api/crm/leads/[id]/convert`

**Body:**
```typescript
{
  account_name: string;
  account_tipo: 'anunciante' | 'partner' | 'agencia' | 'gobierno';
  contact_nombre: string;
  contact_apellidos?: string;
  create_opportunity?: boolean;
  opportunity_nombre?: string;
  opportunity_importe_estimado?: number;
}
```

**Proceso:**
1. Verifica que el lead existe y pertenece al usuario
2. Verifica que no existe cuenta duplicada
3. Crea cuenta (account)
4. Crea contacto asociado
5. Opcionalmente crea oportunidad inicial
6. Actualiza lead a status='converted'
7. Registra todo en timeline

## Timeline Unificada

La timeline registra automáticamente:
- Creación de leads, cuentas, oportunidades
- Cambios de estado/etapa
- Actividades (llamadas, emails, reuniones)
- Conversión de leads
- Oportunidades ganadas/perdidas

**Obtener timeline:**
```
GET /api/crm/timeline?entity_type=opportunity&entity_id=xxx
```

## Automatizaciones

### 1. Lead Scoring
- Calculado automáticamente al crear/actualizar lead
- Factores: email (+10), teléfono (+10), empresa (+15), presupuesto >1000 (+20), soportes (+15), país/ciudad (+10), source referral/event (+10)
- Máximo: 100 puntos

### 2. Seguimiento Automático
- Función: `checkAndCreateFollowUpActivities()`
- Detecta oportunidades sin actividad en últimos 7 días
- Crea actividad de seguimiento automática
- Registra en timeline

### 3. Oportunidad Ganada
- Función: `handleWonOpportunity()`
- Cuando is_won = true:
  - Crea entrada en timeline
  - Crea actividad para crear campaña
  - Actualiza métricas de la cuenta
  - Notifica (preparado para integración con módulo de campañas)

## Queries Ejemplo

### Obtener pipeline completo con relaciones:
```typescript
const { data } = await supabase
  .from('crm_opportunities')
  .select(`
    *,
    account:crm_accounts(*),
    contact:crm_contacts(*),
    stage:crm_pipeline_stages(*)
  `)
  .eq('owner_id', userId)
  .order('created_at', { ascending: false });
```

### Obtener timeline de una oportunidad:
```typescript
const { data } = await supabase
  .from('crm_timeline')
  .select('*')
  .eq('owner_id', userId)
  .eq('entity_type', 'opportunity')
  .eq('entity_id', opportunityId)
  .order('created_at', { ascending: false });
```

### Obtener oportunidades por etapa (para Kanban):
```typescript
const { data } = await supabase
  .from('crm_opportunities')
  .select('*, stage:crm_pipeline_stages(*)')
  .eq('owner_id', userId)
  .eq('is_won', false)
  .eq('is_lost', false)
  .order('stage.orden', { ascending: true });
```

## Seguridad (RLS)

Todas las tablas tienen RLS habilitado:
- Usuarios solo pueden ver/modificar sus propios datos (owner_id = auth.uid())
- Timeline es solo lectura (se crea automáticamente)
- Separación completa por organización/usuario

## Próximos Pasos

1. Integrar con módulo de campañas (cuando oportunidad se gana)
2. Integrar con módulo de facturación (notificación de campaña creada)
3. Agregar webhooks para automatizaciones avanzadas
4. Dashboard de métricas CRM
5. Exportación de datos (CSV, PDF)


