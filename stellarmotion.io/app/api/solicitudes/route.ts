/**
 * GET /api/solicitudes - Listar solicitudes (Brand: las suyas; Owner: de sus soportes)
 * POST /api/solicitudes - Crear solicitud (desde ficha producto). NO crea alquiler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getRoleFromPayload } from '@/lib/auth/role';
import {
  createSolicitud,
  getSolicitudesByBrand,
  getSolicitudesByOwner,
  getAllSolicitudesForAdmin,
} from '@/lib/solicitudes';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
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

    const role = getRoleFromPayload(payload.role) ?? 'client';

    if (role === 'admin') {
      const solicitudes = await getAllSolicitudesForAdmin();
      return NextResponse.json({ success: true, solicitudes });
    }
    if (role === 'owner' || role === 'seller') {
      const solicitudes = await getSolicitudesByOwner(payload.sub);
      return NextResponse.json({ success: true, solicitudes });
    }
    const solicitudes = await getSolicitudesByBrand(payload.sub);
    return NextResponse.json({ success: true, solicitudes });
  } catch (error: unknown) {
    console.error('❌ GET /api/solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al listar solicitudes', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');
    if (!st?.value) {
      return NextResponse.json(
        { error: 'No autorizado. Debes estar autenticado para crear una solicitud.' },
        { status: 401 }
      );
    }

    const payload = await verifySession(st.value);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.soporte_id) {
      return NextResponse.json({ error: 'soporte_id es requerido' }, { status: 400 });
    }
    if (!body.fecha_inicio) {
      return NextResponse.json({ error: 'fecha_inicio es requerida' }, { status: 400 });
    }
    if (body.meses == null || body.meses < 1) {
      return NextResponse.json({ error: 'meses debe ser al menos 1' }, { status: 400 });
    }

    const fechaInicio = new Date(body.fecha_inicio);
    if (isNaN(fechaInicio.getTime())) {
      return NextResponse.json({ error: 'Fecha de inicio inválida' }, { status: 400 });
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaInicio < hoy) {
      return NextResponse.json(
        { error: 'La fecha de inicio no puede ser en el pasado' },
        { status: 400 }
      );
    }

    const fechaFin = body.fecha_fin
      ? new Date(body.fecha_fin).toISOString().split('T')[0]
      : undefined;

    const result = await createSolicitud({
      soporte_id: body.soporte_id,
      usuario_id: payload.sub,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin,
      meses: parseInt(String(body.meses), 10),
      servicios_adicionales: Array.isArray(body.servicios_adicionales)
        ? body.servicios_adicionales
        : undefined,
      mensaje: body.mensaje,
      brand_message: body.brand_message ?? undefined,
      precio_mes_snapshot: body.precio_mes_snapshot != null ? Number(body.precio_mes_snapshot) : undefined,
      subtotal: body.subtotal != null ? Number(body.subtotal) : undefined,
      comision_plataforma: body.comision_plataforma != null ? Number(body.comision_plataforma) : undefined,
      total_estimado: body.total_estimado != null ? Number(body.total_estimado) : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error('❌ POST /api/solicitudes:', error);
    return NextResponse.json(
      {
        error: 'Error al crear solicitud',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    );
  }
}
