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
 * GET /api/owner/invoices/[id]
 * Una factura solo si owner_contacto_id = contacto_id del usuario.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID de factura requerido' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: row, error } = await supabase
      .from('invoices')
      .select('id, numero, alquiler_id, owner_contacto_id, brand_contacto_id, period_start, period_end, subtotal, tax, total, status, due_date, created_at, updated_at')
      .eq('id', id)
      .eq('owner_contacto_id', session.contactoId)
      .single();

    if (error || !row) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
      }
      console.error('[owner/invoices] get one error:', error);
      return NextResponse.json(
        { error: 'Error al cargar factura', details: process.env.NODE_ENV === 'development' ? error?.message : undefined },
        { status: 500 }
      );
    }

    const r = row as Record<string, unknown>;
    const invoice: Invoice = {
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
      updated_at: r.updated_at != null ? String(r.updated_at) : null,
    };
    const brandId = invoice.brand_contacto_id;
    if (brandId) {
      const { data: c } = await supabase
        .from('contactos')
        .select('id, nombre, razon_social')
        .eq('id', brandId)
        .single();
      (invoice as Invoice & { brand_name?: string }).brand_name = (c?.razon_social || c?.nombre || '—')?.trim() || '—';
    }

    return NextResponse.json({ invoice });
  } catch (e) {
    console.error('[owner/invoices] GET [id] error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
