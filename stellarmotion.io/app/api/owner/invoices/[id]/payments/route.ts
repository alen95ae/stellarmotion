import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';
import type { Payment } from '@/types/invoices';

export const runtime = 'nodejs';

/**
 * GET /api/owner/invoices/[id]/payments
 * Pagos de la factura. Solo si la factura pertenece al owner (owner_contacto_id = contacto_id).
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

    const { id: invoiceId } = await params;
    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de factura requerido' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id, owner_contacto_id')
      .eq('id', invoiceId)
      .eq('owner_contacto_id', session.contactoId)
      .single();

    if (invError || !invoice) {
      if (invError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
      }
      console.error('[owner/invoices] payments ownership check:', invError);
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const { data: rows, error } = await supabase
      .from('payments')
      .select('id, invoice_id, amount, payment_method, paid_at, created_at')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[owner/invoices] payments list error:', error);
      return NextResponse.json(
        { error: 'Error al cargar pagos', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
        { status: 500 }
      );
    }

    const raw = (rows || []) as (Record<string, unknown>)[];
    const payments: Payment[] = raw.map((r) => ({
      id: String(r.id),
      invoice_id: String(r.invoice_id),
      monto: Number(r.amount ?? 0),
      fecha_pago: String(r.paid_at ?? r.fecha_pago ?? ''),
      metodo: r.payment_method != null ? String(r.payment_method) : null,
      created_at: String(r.created_at ?? ''),
    }));

    return NextResponse.json({ payments });
  } catch (e) {
    console.error('[owner/invoices] GET payments error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
