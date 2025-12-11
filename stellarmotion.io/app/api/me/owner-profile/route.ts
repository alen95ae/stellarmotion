import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth/session';
import { getAdminSupabase } from '@/lib/supabase/admin';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar JWT
    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    // Obtener owner desde Supabase
    const supabase = getAdminSupabase();
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('*')
      .eq('user_id', payload.sub)
      .maybeSingle();

    if (ownerError && ownerError.code !== 'PGRST116') {
      console.error('❌ [WEB OWNER-PROFILE] Error:', ownerError);
      return NextResponse.json(
        { error: 'Error al obtener perfil' },
        { status: 500 }
      );
    }

    if (!owner) {
      return NextResponse.json({
        empresa: null,
        tipo_empresa: null,
        telefono: null,
        pais: null,
        nombre_contacto: null,
      });
    }

    return NextResponse.json({
      empresa: owner.empresa || null,
      tipo_empresa: owner.tipo_empresa || null,
      telefono: owner.telefono || null,
      pais: owner.pais || null,
      nombre_contacto: owner.nombre_contacto || null,
    });
  } catch (error: any) {
    console.error('❌ [WEB OWNER-PROFILE] Error:', error);
    return NextResponse.json(
      { empresa: null, tipo_empresa: null },
      { status: 200 }
    );
  }
}

