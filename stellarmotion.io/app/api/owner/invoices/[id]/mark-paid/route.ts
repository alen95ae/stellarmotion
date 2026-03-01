import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { getContactoFromSession, hasContactoId } from '@/lib/messaging/get-contacto-from-session';

export const runtime = 'nodejs';

/**
 * PATCH /api/owner/invoices/[id]/mark-paid
 * Marca factura como pagada (modo manual). Solo si pertenece al owner.
 */
export async function PATCH(
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
    const { data: updated, error } = await supabase
      .from('invoices')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_contacto_id', session.contactoId)
      .select('id, status')
      .single();

    if (error || !updated) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
      }
      console.error('[owner/invoices] mark-paid error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar factura', details: process.env.NODE_ENV === 'development' ? error?.message : undefined },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice: { id: updated.id, estado: (updated as { status?: string }).status ?? 'pagada' } });
  } catch (e) {
    console.error('[owner/invoices] PATCH mark-paid error:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
