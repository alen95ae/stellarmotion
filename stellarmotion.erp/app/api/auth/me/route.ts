import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getUserByIdSupabase } from '@/lib/supabaseUsers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('st_session')?.value
    
    if (!token) {
      console.error('❌ [ERP /api/auth/me] No se encontró token st_session');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let payload;
    try {
      payload = await verifySession(token);
      
      if (!payload || !payload.sub) {
        console.error("❌ [ERP /api/auth/me] JWT inválido:", {
          hasPayload: !!payload,
          hasSub: !!payload?.sub,
          tokenStart: token.substring(0, 15) + "...",
        });
        return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
      }
    } catch (err) {
      console.error("❌ [ERP /api/auth/me] Error verificando sesión:", err);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener información completa del usuario
    const user = await getUserByIdSupabase(payload.sub)
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Asegurar que tenemos el nombre del rol correcto
    let roleName = user.rol || payload.role || 'client'
    if (user.rol_id && !user.rol) {
      // Si tenemos rol_id pero no el nombre, obtenerlo
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('nombre')
        .eq('id', user.rol_id)
        .single()
      
      if (roleData?.nombre) {
        roleName = roleData.nombre
      }
    }

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
        ciudad: user.ciudad || null,
        tipo_owner: user.tipo_owner || null,
        nombre_empresa: user.nombre_empresa || null,
        tipo_empresa: user.tipo_empresa || null,
        rol: roleName,
        role: roleName,
      }
    })
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

