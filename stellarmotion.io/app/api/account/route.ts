import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { updateUserProfile } from '@/lib/auth/users';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const st = cookieStore.get('st_session');
    if (!st?.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifySession(st.value);
    if (!payload?.email) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, telefono, passwordActual, passwordNueva } = body;

    const result = await updateUserProfile(
      payload.email,
      {
        nombre: typeof nombre === 'string' ? nombre : undefined,
        telefono: typeof telefono === 'string' ? telefono : undefined,
        passwordNueva: typeof passwordNueva === 'string' ? passwordNueva : undefined,
      },
      typeof passwordActual === 'string' ? passwordActual : undefined
    );

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
