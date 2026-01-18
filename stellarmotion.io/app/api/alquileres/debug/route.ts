/**
 * Endpoint de debug para verificar datos de alquileres
 * GET /api/alquileres/debug - Muestra información de debug
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase-sql';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');

    if (!st || !st.value) {
      return NextResponse.json(
        { error: 'No autorizado' },
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

    const usuarioId = payload.sub;

    console.log('🔐 [GET /api/alquileres/debug] Usando supabaseAdmin (SERVICE_ROLE_KEY) - BYPASEA RLS');

    // 1. Verificar soportes del usuario
    // NOTA: Estas queries usan supabaseAdmin que IGNORA RLS automáticamente
    const { data: soportes, error: soportesError } = await supabaseAdmin
      .from('soportes')
      .select('id, nombre, usuario_id')
      .eq('usuario_id', usuarioId);
    
    // 1b. Verificar todos los soportes (para debug)
    const { data: allSoportes, error: allSoportesError } = await supabaseAdmin
      .from('soportes')
      .select('id, nombre, usuario_id')
      .limit(20);

    // 2. Verificar todos los alquileres (sin filtro)
    // NOTA: Esta query usa supabaseAdmin que IGNORA RLS automáticamente
    console.log('🔐 [GET /api/alquileres/debug] Query a tabla "alquileres" usando SERVICE_ROLE_KEY');
    const { data: allAlquileres, error: alquileresError } = await supabaseAdmin
      .from('alquileres')
      .select('*')
      .limit(10);
    
    if (alquileresError) {
      console.error('❌ [GET /api/alquileres/debug] Error accediendo a tabla alquileres:', alquileresError);
      console.error('❌ [GET /api/alquileres/debug] Error code:', alquileresError.code);
      console.error('❌ [GET /api/alquileres/debug] Error message:', alquileresError.message);
      console.error('🔐 [GET /api/alquileres/debug] Verificar que SUPABASE_SERVICE_ROLE_KEY esté configurada');
    }

    // 3. Verificar estructura de la tabla
    const { data: sampleAlquiler, error: sampleError } = await supabaseAdmin
      .from('alquileres')
      .select('*')
      .limit(1)
      .single();

    // 4. Si hay alquileres, verificar sus soportes
    let soportesDeAlquileres: any[] = [];
    if (allAlquileres && allAlquileres.length > 0) {
      const soporteIds = [...new Set(allAlquileres.map(a => a.soporte_id).filter(Boolean))];
      if (soporteIds.length > 0) {
        const { data: soportesData } = await supabaseAdmin
          .from('soportes')
          .select('id, nombre, usuario_id')
          .in('id', soporteIds);
        soportesDeAlquileres = soportesData || [];
      }
    }

    return NextResponse.json({
      debug: {
        usuario: {
          id: usuarioId,
          email: payload.email,
          role: payload.role,
        },
        soportes: {
          count: soportes?.length || 0,
          data: soportes?.slice(0, 5) || [],
          error: soportesError?.message,
        },
        allSoportes: {
          count: allSoportes?.length || 0,
          data: allSoportes?.slice(0, 10) || [],
          usuarioIdsUnicos: allSoportes ? [...new Set(allSoportes.map(s => s.usuario_id))] : [],
          error: allSoportesError?.message,
        },
        alquileres: {
          total: allAlquileres?.length || 0,
          data: allAlquileres?.slice(0, 5) || [],
          error: alquileresError?.message,
        },
        sample: {
          data: sampleAlquiler,
          error: sampleError?.message,
        },
        soportesDeAlquileres: {
          count: soportesDeAlquileres.length,
          data: soportesDeAlquileres.slice(0, 5),
        },
        analisis: {
          alquileresDelUsuario: allAlquileres?.filter(a => {
            const soporte = soportesDeAlquileres.find(s => s.id === a.soporte_id);
            return soporte?.usuario_id === usuarioId;
          }).length || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error en GET /api/alquileres/debug:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

