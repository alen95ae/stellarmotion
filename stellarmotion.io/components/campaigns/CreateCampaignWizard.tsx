'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Image, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { campaignWizardSchema, type CampaignWizardForm } from '@/lib/campaigns/schema';
import type { CampaignWizardStep } from '@/types/campaigns';

const STEPS: { id: CampaignWizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'setup', label: 'Configuración', icon: Settings },
  { id: 'targeting', label: 'Audiencia y ubicaciones', icon: MapPin },
  { id: 'scheduling', label: 'Programación', icon: Calendar },
  { id: 'creatives', label: 'Creatividades', icon: Image },
];

const STEP_ORDER: CampaignWizardStep[] = ['setup', 'targeting', 'scheduling', 'creatives'];

export interface CreateCampaignWizardProps {
  /** Ruta base del módulo (ej. /panel/owner/marketing) */
  basePath?: string;
}

const defaultValues: Partial<CampaignWizardForm> = {
  name: '',
  objective: 'reconocimiento_marca',
  budget: 5000,
  delivery_type: 'estandar',
  start_date: '',
  end_date: '',
  tipo_soporte: [],
  categorias: [],
  soporte_ids: [],
  slots: [],
  assets: [],
};

export default function CreateCampaignWizard({ basePath = '/panel/owner/marketing' }: CreateCampaignWizardProps = {}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEP_ORDER[stepIndex];

  const form = useForm<CampaignWizardForm>({
    resolver: zodResolver(campaignWizardSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const goNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const ok = await form.trigger(fieldsToValidate as (keyof CampaignWizardForm)[]);
    if (!ok) return;
    if (stepIndex < STEP_ORDER.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      // TODO: POST /api/campaigns con form.getValues()
      router.push(basePath);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return (
    <div className="space-y-8">
      <header>
        <Link
          href={basePath}
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#e94446]"
        >
          ← Volver a campañas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Crear campaña
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Completa los pasos para lanzar tu campaña OOH
        </p>
      </header>

      {/* Stepper */}
      <nav aria-label="Pasos del asistente" className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isActive = i === stepIndex;
          const isPast = i < stepIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="flex shrink-0 items-center gap-2"
            >
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors
                  ${isActive ? 'border-[#e94446] bg-[#e94446] text-white' : ''}
                  ${isPast ? 'border-[#e94446] bg-[#e94446] text-white' : ''}
                  ${!isActive && !isPast ? 'border-gray-200 dark:border-gray-700 text-gray-400' : ''}
                `}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`
                  hidden text-sm font-medium sm:inline
                  ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
              )}
            </div>
          );
        })}
      </nav>

      <Form {...form}>
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); goNext(); }}>
          {/* Paso 1: Setup */}
          {currentStep === 'setup' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración general
              </h2>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la campaña</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Lanzamiento Verano 2025"
                        className="rounded-lg max-w-md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo publicitario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg max-w-md">
                          <SelectValue placeholder="Selecciona un objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reconocimiento_marca">Reconocimiento de marca</SelectItem>
                        <SelectItem value="trafico_peatonal">Tráfico peatonal</SelectItem>
                        <SelectItem value="promocion_evento">Promoción de evento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto total (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={100}
                        className="rounded-lg max-w-[200px]"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delivery_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de entrega</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg max-w-md">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="estandar">Estándar</SelectItem>
                        <SelectItem value="acelerada">Acelerada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Paso 2: Targeting */}
          {currentStep === 'targeting' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audiencia y ubicaciones
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Filtra por tipo de soporte y selecciona ubicaciones en el mapa
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 space-y-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</p>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>Tipo: Digital / Impreso</p>
                    <p>Categoría: Centro Comercial, Calle, Transporte</p>
                    <p className="pt-2 italic">(Conectar con API de soportes)</p>
                  </div>
                </div>
                <div className="lg:col-span-2 min-h-[320px] bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Mapa de soportes disponibles
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Se mostrarán los soportes según filtros seleccionados
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Soportes seleccionados: 0 — Impacto estimado: —
                </p>
              </div>
            </div>
          )}

          {/* Paso 3: Scheduling */}
          {currentStep === 'scheduling' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Programación
              </h2>
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Fecha de fin</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dayparting (horarios por día)
                </p>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 min-h-[120px] flex items-center justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Grid L-V / S-D por franjas horarias (próxima implementación)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Creatives */}
          {currentStep === 'creatives' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Creatividades
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sube imágenes o vídeos. Formatos recomendados: 16:9, 9:16.
              </p>
              <div
                className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center min-h-[200px] flex flex-col items-center justify-center gap-2 hover:border-[#e94446]/50 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLElement).click()}
              >
                <Image className="h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Arrastra archivos aquí o haz clic para subir
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, MP4. Resolución según soporte (16:9 o 9:16)
                </p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="rounded-lg gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-[#e94446] hover:bg-[#d63a3a] gap-2"
            >
              {stepIndex === STEP_ORDER.length - 1 ? 'Crear campaña' : 'Siguiente'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function getFieldsForStep(step: CampaignWizardStep): (keyof CampaignWizardForm)[] {
  switch (step) {
    case 'setup':
      return ['name', 'objective', 'budget', 'delivery_type'];
    case 'targeting':
      return [];
    case 'scheduling':
      return ['start_date', 'end_date'];
    case 'creatives':
      return [];
    default:
      return [];
  }
}
