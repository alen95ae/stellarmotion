import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/auth/users';
import { signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!user.passwordhash) {
      return NextResponse.json(
        { error: 'Error de configuración del usuario' },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordhash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Obtener nombre del rol
    let roleName = 'client';
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

    // Crear sesión JWT
    const token = await signSession({
      id: user.id,
      email: user.email,
      role: roleName,
      name: user.nombre || ''
    });

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: roleName,
      }
    }, { status: 200 });

    setSessionCookie(response, token);
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
