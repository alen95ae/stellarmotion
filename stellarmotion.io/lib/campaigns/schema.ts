import { z } from 'zod';

export const campaignObjectiveEnum = z.enum([
  'reconocimiento_marca',
  'trafico_peatonal',
  'promocion_evento',
]);

export const deliveryTypeEnum = z.enum(['estandar', 'acelerada']);

export const campaignSetupSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(120),
  objective: campaignObjectiveEnum,
  budget: z.number().min(100, 'Mínimo 100€').max(1_000_000),
  delivery_type: deliveryTypeEnum,
});

export const campaignTargetingSchema = z.object({
  tipo_soporte: z.array(z.enum(['digital', 'impreso'])).optional(),
  categorias: z.array(z.string()).optional(),
  soporte_ids: z.array(z.string()).optional(),
});

export const campaignSchedulingSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  slots: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(0).max(23),
    })
  ).optional(),
});

export const campaignCreativesSchema = z.object({
  assets: z.array(
    z.object({
      file_url: z.string(),
      format: z.string(), // '16:9' | '9:16' etc.
      status: z.enum(['pendiente', 'aprobado', 'rechazado']).optional(),
    })
  ).optional(),
});

export const campaignWizardSchema = campaignSetupSchema
  .merge(campaignTargetingSchema)
  .merge(campaignSchedulingSchema)
  .merge(campaignCreativesSchema);

export type CampaignWizardForm = z.infer<typeof campaignWizardSchema>;
