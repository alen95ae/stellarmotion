/**
 * GET /api/solicitudes/[id] - Detalle de solicitud (Brand: propia; Owner: de sus soportes).
 * PATCH /api/solicitudes/[id] - Aceptar o rechazar (solo owner). Al aceptar se crea alquiler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getSolicitudById, updateSolicitudEstado, isOwnerOfSolicitudSoporte } from '@/lib/solicitudes';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }
    const solicitud = await getSolicitudById(id);
    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }
    const isBrand = solicitud.usuario_id === payload.sub;
    const isOwner = await isOwnerOfSolicitudSoporte(id, payload.sub);
    if (!isBrand && !isOwner) {
      return NextResponse.json({ error: 'No tienes permiso para ver esta solicitud' }, { status: 403 });
    }
    return NextResponse.json({ success: true, solicitud });
  } catch (error: unknown) {
    console.error('❌ GET /api/solicitudes/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitud', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const accion = body.accion === 'aceptar' ? 'aceptada' : body.accion === 'rechazar' ? 'rechazada' : null;
    if (!accion) {
      return NextResponse.json(
        { error: 'accion debe ser "aceptar" o "rechazar"' },
        { status: 400 }
      );
    }

    const result = await updateSolicitudEstado(id, payload.sub, accion);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'No se pudo actualizar la solicitud' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      estado: accion,
      alquiler_id: result.alquiler_id,
    });
  } catch (error: unknown) {
    console.error('❌ PATCH /api/solicitudes/[id]:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar solicitud',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    );
  }
}
