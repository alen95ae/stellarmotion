import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/users';
import { getAdminSupabase } from '@/lib/supabase/admin';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

export async function GET() {
  try {
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st) {
      console.log('❌ [WEB /api/auth/me] No se encontró cookie st_session');
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar JWT
    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      console.error('❌ [WEB /api/auth/me] JWT inválido o expirado');
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // ⚠️ LOGGING: Verificar payload del JWT
    console.log('🔍 [WEB /api/auth/me] JWT Payload:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    
    // Obtener usuario de Supabase usando el ID del JWT
    console.log(`🔍 [WEB /api/auth/me] Buscando usuario con ID: ${payload.sub}`);
    const user = await getUserById(payload.sub);
    
    if (!user) {
      console.error('❌ [WEB /api/auth/me] Usuario no encontrado en Supabase');
      console.error('❌ [WEB /api/auth/me] ID buscado (payload.sub):', payload.sub);
      console.error('❌ [WEB /api/auth/me] Email del JWT:', payload.email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    console.log('✅ [WEB /api/auth/me] Usuario encontrado en BD:', {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    // Obtener nombre del rol
    let roleName = payload.role || 'client';
    if (user.rol_id) {
      const supabase = getAdminSupabase();
      const { data: roleData } = await supabase
        .from('roles')
        .select('nombre')
        .eq('id', user.rol_id)
        .maybeSingle();
      
      if (roleData?.nombre) {
        roleName = roleData.nombre;
      }
    }

    console.log('✅ [WEB /api/auth/me] Devolviendo usuario con ID:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        sub: user.id,
        email: user.email || payload.email,
        name: user.nombre || payload.name,
        nombre: user.nombre || payload.name,
        apellidos: user.apellidos || null,
        telefono: user.telefono || null,
        pais: user.pais || null,
        rol: roleName,
        role: roleName,
      }
    });
  } catch (error: any) {
    console.error('❌ [WEB /api/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
