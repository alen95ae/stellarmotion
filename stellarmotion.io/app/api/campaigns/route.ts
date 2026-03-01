/**
 * GET /api/campaigns - Lista campañas del brand autenticado.
 * Lee desde Supabase (tabla public.campaigns).
 * Respuesta: summary (calculado) + campaigns.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getAdminSupabase } from '@/lib/supabase/admin';
import type { CampaignsSummary, CampaignRow } from '@/types/campaigns';

export const runtime = 'nodejs';

/** Calcula el resumen a partir de las filas de campañas (tabla no tiene spent/impressions). */
function buildSummary(rows: CampaignRow[]): CampaignsSummary {
  const activas = rows.filter((c) => c.status === 'activa' || c.status === 'pausada');
  const totalBudget = activas.reduce((s, c) => s + Number(c.budget ?? 0), 0);
  const activeSpend = activas.reduce((s, c) => s + Number((c as { spent?: number }).spent ?? 0), 0);
  const impressions = rows.reduce((s, c) => s + Number(c.impressions ?? 0), 0);
  return {
    activeSpend,
    totalBudget,
    impressions,
    activeSoportes: 0,
    averageCpm: impressions > 0 && activeSpend > 0 ? (activeSpend / (impressions / 1000)) : 0,
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');
    if (!st?.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifySession(st.value);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const brandId = payload.sub;
    const supabase = getAdminSupabase();

    const { data: rows, error } = await supabase
      .from('campaigns')
      .select('id, brand_id, name, status, budget, start_date, end_date, delivery_type, objective, created_at, updated_at')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/campaigns Supabase error:', error);
      return NextResponse.json(
        { error: 'Error al cargar campañas', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
        { status: 500 }
      );
    }

    const campaigns: CampaignRow[] = (rows ?? []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      brand_id: String(r.brand_id ?? ''),
      name: String(r.name ?? ''),
      status: (r.status as CampaignRow['status']) ?? 'borrador',
      budget: Number(r.budget ?? 0),
      spent: 0,
      start_date: String(r.start_date ?? ''),
      end_date: String(r.end_date ?? ''),
      delivery_type: (r.delivery_type as string) ?? 'estandar',
      objective: (r.objective as string) ?? undefined,
      created_at: String(r.created_at ?? ''),
      impressions: 0,
    }));

    const summary = buildSummary(campaigns);

    return NextResponse.json({
      summary,
      campaigns,
    });
  } catch (e) {
    console.error('GET /api/campaigns:', e);
    return NextResponse.json(
      { error: 'Error al cargar campañas' },
      { status: 500 }
    );
  }
}
