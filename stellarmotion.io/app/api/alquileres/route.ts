/**
 * API Route para alquileres (Dashboard)
 * GET /api/alquileres - Obtener alquileres del owner autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getRoleFromPayload } from '@/lib/auth/role';
import { getAlquileresByOwner } from '@/lib/alquileres';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:14',message:'GET /api/alquileres entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');

    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:20',message:'Cookie check',data:{hasCookie:!!st,hasValue:!!st?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }

    if (!st || !st.value) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifySession(st.value);

    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:30',message:'Payload after verifySession',data:{hasPayload:!!payload,hasSub:!!payload?.sub,rawRole:payload?.role,roleType:typeof payload?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Verificar rol del usuario (cualquier usuario autenticado puede acceder)
    // getAlquileresByOwner manejará correctamente usuarios sin soportes retornando array vacío
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:37',message:'Before role normalization',data:{rawRole:payload.role,roleType:typeof payload.role},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    }
    const normalizedRole = getRoleFromPayload(payload.role);
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:40',message:'After getRoleFromPayload',data:{normalizedRole,isUndefined:normalizedRole===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    }
    const userRole = normalizedRole || 'client';
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/35ed66c4-103a-4e9a-bb0c-ff60128329e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/alquileres/route.ts:42',message:'Final userRole check - allowing all authenticated users',data:{userRole,willCallGetAlquileres:true},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    }

    // Obtener alquileres del usuario
    const alquileres = await getAlquileresByOwner(payload.sub);

    // DEBUG: Verificar que codigo_cliente está presente antes de enviar
    if (alquileres.length > 0 && alquileres[0].soporte) {
      console.log('🧪 [API] Soporte antes de enviar:', {
        id: alquileres[0].soporte.id,
        codigo_cliente: alquileres[0].soporte.codigo_cliente,
        codigo_interno: alquileres[0].soporte.codigo_interno
      });
    }

    return NextResponse.json({
      success: true,
      alquileres,
    });
  } catch (error: any) {
    console.error('❌ Error en GET /api/alquileres:', error);
    console.error('❌ Stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

