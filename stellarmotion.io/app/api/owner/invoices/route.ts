import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';
import type { Invoice } from '@/types/invoices';

export const runtime = 'nodejs';

function mapStatusToEstado(status: string): Invoice['estado'] {
  const m: Record<string, Invoice['estado']> = {
    pending: 'pendiente', paid: 'pagada', overdue: 'vencida', partial: 'parcial',
    sent: 'enviada', cancelled: 'cancelada',
  };
  return m[status.toLowerCase()] ?? 'pendiente';
}

/**
 * GET /api/owner/invoices
 * Lista facturas del owner autenticado (por usuarios.contacto_id = owner_contacto_id).
 * Orden: created_at desc.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getContactoFromSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (!hasContactoId(session)) {
      return NextResponse.json(
        { error: 'Tu cuenta no tiene un contacto asociado (usuarios.contacto_id)' },
        { status: 403 }
      );
    }

    const supabase = getAdminSupabase();
    const { data: rows, error } = await supabase
      .from('invoices')
      .select('id, numero, alquiler_id, owner_contacto_id, brand_contacto_id, period_start, period_end, subtotal, tax, total, status, due_date, created_at')
      .eq('owner_contacto_id', session.contactoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[owner/invoices] list error:', error);
      return NextResponse.json(
        { error: 'Error al cargar facturas', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
        { status: 500 }
      );
    }

    const raw = (rows || []) as (Record<string, unknown>)[];
    const invoices: Invoice[] = raw.map((r) => ({
      id: String(r.id),
      numero: String(r.numero ?? ''),
      alquiler_id: r.alquiler_id != null ? String(r.alquiler_id) : null,
      owner_contacto_id: String(r.owner_contacto_id ?? ''),
      brand_contacto_id: String(r.brand_contacto_id ?? ''),
      periodo_inicio: String(r.period_start ?? r.periodo_inicio ?? ''),
      periodo_fin: String(r.period_end ?? r.periodo_fin ?? ''),
      subtotal: Number(r.subtotal ?? 0),
      impuesto: Number(r.tax ?? r.impuesto ?? 0),
      total: Number(r.total ?? 0),
      estado: mapStatusToEstado(String(r.status ?? '')),
      fecha_vencimiento: String(r.due_date ?? ''),
      created_at: String(r.created_at ?? ''),
    }));
    const brandIds = [...new Set(invoices.map((i) => i.brand_contacto_id).filter(Boolean))];
    let nameByContactoId = new Map<string, string>();
    if (brandIds.length > 0) {
      const { data: contactos } = await supabase
        .from('contactos')
        .select('id, nombre, razon_social')
        .in('id', brandIds);
      for (const c of contactos || []) {
        const name = (c.razon_social || c.nombre || c.id)?.trim() || '—';
        nameByContactoId.set(c.id, name);
      }
    }

    const list = invoices.map((inv) => ({
      ...inv,
      brand_name: nameByContactoId.get(inv.brand_contacto_id) ?? '—',
    }));

    return NextResponse.json({ invoices: list });
  } catch (e) {
    console.error('[owner/invoices] GET error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
