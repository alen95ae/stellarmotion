import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { verifySession } from '@/lib/auth'
import { getUserByIdSupabase } from '@/lib/supabaseUsers'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    let fallbackEmail: string | null = null;
    let fallbackName: string | null = null;
    let fallbackRole: string | null = null;

    if (session?.user) {
      const u = session.user as { id?: string; email?: string | null; name?: string | null; role?: string; sub?: string };
      userId = u.id ?? u.sub ?? null;
      fallbackEmail = u.email ?? null;
      fallbackName = u.name ?? null;
      fallbackRole = u.role ?? null;
    }

    if (!userId) {
      const cookieStore = await cookies();
      const tokenValue = cookieStore.get('st_session')?.value;
      if (!tokenValue) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const payload = await verifySession(tokenValue);
      if (!payload || !payload.sub) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }
      userId = payload.sub;
      fallbackEmail = payload.email ?? null;
      fallbackName = payload.name ?? null;
      fallbackRole = payload.role ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await getUserByIdSupabase(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const roleName = user.rol || fallbackRole || 'invitado';

    console.log('[Auth /me] userId:', userId, 'rol:', roleName, 'contacto_id:', user.contacto_id, 'contacto_roles:', user.contacto_roles);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        sub: user.id,
        email: user.email || fallbackEmail,
        name: user.nombre || fallbackName,
        nombre: user.nombre || fallbackName,
        apellidos: user.apellidos || null,
        telefono: user.telefono || null,
        pais: user.pais || null,
        ciudad: user.ciudad || null,
        rol: roleName,
        role: roleName,
        contacto_id: user.contacto_id || null,
        contacto_roles: user.contacto_roles || [],
      },
    });
  } catch (error) {
    console.error('[Auth /me] Error:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}
