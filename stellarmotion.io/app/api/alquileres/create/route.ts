/**
 * API Route para crear alquileres (Público)
 * POST /api/alquileres/create - Crear nuevo alquiler desde brand (público)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { createAlquiler } from '@/lib/alquileres';
import { CreateAlquilerDTO } from '@/types/alquileres';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');

    if (!st || !st.value) {
      return NextResponse.json(
        { error: 'No autorizado. Debes estar autenticado para crear un alquiler.' },
        { status: 401 }
      );
    }

    const payload = await verifySession(st.value);

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // El usuario autenticado es la única fuente de verdad
    const usuarioId = payload.sub;

    const body = await request.json();

    // Validaciones básicas
    if (!body.soporte_id) {
      return NextResponse.json(
        { error: 'soporte_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.fecha_inicio) {
      return NextResponse.json(
        { error: 'fecha_inicio es requerida' },
        { status: 400 }
      );
    }

    if (!body.meses || body.meses < 1) {
      return NextResponse.json(
        { error: 'meses debe ser al menos 1' },
        { status: 400 }
      );
    }

    // Validar fecha
    const fechaInicio = new Date(body.fecha_inicio);
    if (isNaN(fechaInicio.getTime())) {
      return NextResponse.json(
        { error: 'Fecha de inicio inválida' },
        { status: 400 }
      );
    }

    // Validar que la fecha no sea en el pasado
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaInicio < hoy) {
      return NextResponse.json(
        { error: 'La fecha de inicio no puede ser en el pasado' },
        { status: 400 }
      );
    }

    // Preparar datos (usuario_id viene del JWT, no del body)
    const alquilerData: CreateAlquilerDTO = {
      soporte_id: body.soporte_id,
      usuario_id: usuarioId,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      meses: parseInt(body.meses, 10),
      servicios_adicionales: Array.isArray(body.servicios_adicionales)
        ? body.servicios_adicionales
        : [],
    };

    // Crear alquiler
    const result = await createAlquiler(alquilerData);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error en POST /api/alquileres/create:', error);
    return NextResponse.json(
      {
        error: 'Error al crear alquiler',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

