import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';

export const runtime = 'nodejs';

/**
 * POST /api/brand/invoices/[id]/pay
 * Simulación de pago manual: inserta en payments, actualiza paid_amount y estado si aplica.
 * Solo si la factura pertenece al brand.
 */
export async function POST(
  request: NextRequest,
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

    let body: { amount?: number; method?: string; fecha_pago?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
    }

    const amount = typeof body.amount === 'number' ? body.amount : Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido (debe ser mayor a 0)' }, { status: 400 });
    }

    const paidAt = body.fecha_pago && /^\d{4}-\d{2}-\d{2}/.test(String(body.fecha_pago))
      ? new Date(String(body.fecha_pago).slice(0, 10)).toISOString()
      : new Date().toISOString();
    const paymentMethod = typeof body.method === 'string' ? body.method.trim().slice(0, 255) : 'manual';

    const supabase = getAdminSupabase();

    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('id, total, brand_contacto_id')
      .eq('id', invoiceId)
      .eq('brand_contacto_id', session.contactoId)
      .single();

    if (invError || !invoice) {
      if (invError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
      }
      console.error('[brand/invoices] pay ownership check:', invError);
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_method: paymentMethod,
        paid_at: paidAt,
      });

    if (insertError) {
      console.error('[brand/invoices] pay insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar pago', details: process.env.NODE_ENV === 'development' ? insertError.message : undefined },
        { status: 500 }
      );
    }

    const { data: sums } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId);

    const totalPaid = (sums || []).reduce((s, r) => s + Number((r as { amount?: number }).amount ?? 0), 0);
    const invoiceTotal = Number(invoice.total ?? 0);
    const newStatus = totalPaid >= invoiceTotal ? 'paid' : 'partial';

    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        paid_amount: totalPaid,
        updated_at: new Date().toISOString(),
        status: newStatus,
      })
      .eq('id', invoiceId)
      .eq('brand_contacto_id', session.contactoId);

    if (updateError) {
      console.error('[brand/invoices] pay update invoice error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar factura', details: process.env.NODE_ENV === 'development' ? updateError.message : undefined },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paid_amount: totalPaid,
      estado: newStatus === 'paid' ? 'pagada' : 'parcial',
    });
  } catch (e) {
    console.error('[brand/invoices] POST pay error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
