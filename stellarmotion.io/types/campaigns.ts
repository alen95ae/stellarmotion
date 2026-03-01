/**
 * Tipos para el módulo Ads Manager (Campañas OOH/DOOH).
 * Alineados con el modelo esperado en Supabase.
 */

/** Estados de una campaña */
export type CampaignStatus = 'activa' | 'pausada' | 'borrador' | 'finalizada';

/** Tipo de entrega del presupuesto */
export type DeliveryType = 'estandar' | 'acelerada';

/** Objetivo publicitario */
export type CampaignObjective =
  | 'reconocimiento_marca'
  | 'trafico_peatonal'
  | 'promocion_evento';

/** Tabla principal: campaigns (alineada con Supabase) */
export interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  status: CampaignStatus;
  /** Presupuesto total en € */
  budget: number;
  start_date: string;
  end_date: string;
  delivery_type?: string;
  objective?: string;
  created_at: string;
  updated_at?: string | null;
  /** Presupuesto consumido (opcional, denormalizado) */
  spent?: number;
}

/** Relación campaña – soportes (pantallas/vallas) */
export interface CampaignSoporte {
  campaign_id: string;
  soporte_id: string;
}

/** Creatividad (asset) de una campaña */
export interface CampaignCreative {
  id: string;
  campaign_id: string;
  file_url: string;
  /** Formato: 16:9, 9:16, etc. */
  format: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  created_at?: string | null;
}

/** Resumen mensual para KPIs del dashboard */
export interface CampaignsSummary {
  /** Gasto total activo (campañas activas + pausadas en periodo) */
  activeSpend: number;
  /** Presupuesto total de campañas en curso */
  totalBudget: number;
  /** Impresiones generadas (estimadas) */
  impressions: number;
  /** Número de soportes con anuncios activos */
  activeSoportes: number;
  /** CPM promedio € */
  averageCpm: number;
}

/** Campaña con datos derivados para la tabla (impresiones, progreso) */
export interface CampaignRow extends Campaign {
  /** Impresiones estimadas (para mostrar en tabla) */
  impressions?: number;
}

/** Filtro de estado para la lista */
export type CampaignStatusFilter = 'todas' | CampaignStatus;

/** Dayparting: rango de horas por día de la semana */
export interface ScheduleSlot {
  dayOfWeek: number; // 0 = domingo, 1 = lunes, ...
  startHour: number; // 0-23
  endHour: number;   // 0-23
}

/** Paso del wizard */
export type CampaignWizardStep = 'setup' | 'targeting' | 'scheduling' | 'creatives';
