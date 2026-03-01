import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from '@/lib/auth/session';
import { findUserByEmail } from '@/lib/auth/users';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st || !st.value) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // Obtener información actualizada del usuario desde la base de datos
    const user = await findUserByEmail(payload.email);
    
    // Obtener nombre del rol actualizado
    let roleName = payload.role || 'client';
    if (user?.rol_id) {
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

    // Nombre para mostrar: preferir campo nombre del contacto → nombre usuario → JWT
    let userName = user?.nombre || payload.name || '';
    const supabase = getAdminSupabase();
    const contactoId = (user as any)?.contacto_id;
    if (contactoId) {
      const { data: contacto } = await supabase
        .from('contactos')
        .select('nombre')
        .eq('id', contactoId)
        .maybeSingle();
      if (contacto?.nombre?.trim()) {
        userName = contacto.nombre.trim();
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        sub: payload.sub,
        email: payload.email,
        name: userName,
        nombre: userName,
        role: roleName,
        rol: roleName,
        telefono: user?.telefono ?? undefined,
        numero: user?.numero ?? undefined,
        contacto_id: contactoId ?? undefined,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
