import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/auth/users';
import { signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validaciones básicas
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existing = await findUserByEmail(body.email);
    
    if (existing) {
      return NextResponse.json(
        { 
          error: 'EMAIL_EXISTS',
          message: 'Este email ya está registrado. Por favor, inicia sesión.'
        },
        { status: 409 }
      );
    }

    // Extraer nombre y apellidos
    let nombre = body.nombre?.trim() || body.nombre_contacto?.trim() || '';
    let apellidos = body.apellidos?.trim() || '';
    
    if (nombre && !apellidos && nombre.includes(' ')) {
      const parts = nombre.split(' ');
      nombre = parts[0] || '';
      apellidos = parts.slice(1).join(' ') || '';
    }

    // Crear usuario en Supabase
    let user;
    try {
      user = await createUser(
        body.email.trim(),
        body.password,
        nombre,
        body.role || 'client',
        body.telefono?.trim(),
        body.pais?.trim(),
        apellidos
      );
    } catch (userError: any) {
      return NextResponse.json(
        { 
          error: 'Error al crear usuario',
          details: userError?.message || 'Error desconocido al crear usuario'
        },
        { status: 500 }
      );
    }

    // Crear sesión JWT
    let token: string;
    try {
      token = await signSession({
        id: user.id,
        email: user.email,
        role: body.role || 'client',
        name: user.nombre || ''
      });
    } catch (sessionError: any) {
      return NextResponse.json(
        { 
          error: 'Error al crear sesión',
          details: sessionError?.message || 'Error desconocido al crear sesión'
        },
        { status: 500 }
      );
    }

    // Crear respuesta con cookie
    const response = NextResponse.json({
      ok: true,
      user_id: user.id,
      email: user.email,
      role: body.role || 'client'
    }, { status: 201 });

    setSessionCookie(response, token);
    
    return response;

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
