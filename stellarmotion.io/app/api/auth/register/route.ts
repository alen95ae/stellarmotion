import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from '@/lib/auth/users';
import { signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

/**
 * Endpoint de registro directo en Supabase (sin ERP)
 * WEB → Supabase directo
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📡 [WEB REGISTER] Registro directo en Supabase (sin ERP)');
    
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

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
    console.log('🔍 [WEB REGISTER] Verificando si email existe...');
    const existing = await findUserByEmail(body.email);
    
    if (existing) {
      console.log('⚠️ [WEB REGISTER] Email ya existe');
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
    console.log('🔐 [WEB REGISTER] Creando usuario en Supabase...');
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
      console.log('✅ [WEB REGISTER] Usuario creado:', user.id);
    } catch (userError: any) {
      console.error('❌ [WEB REGISTER] Error creando usuario:', userError);
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
      console.log('✅ [WEB REGISTER] Sesión JWT creada');
    } catch (sessionError: any) {
      console.error('❌ [WEB REGISTER] Error creando sesión:', sessionError);
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
    console.log('✅ [WEB REGISTER] Registro completado exitosamente');
    
    return response;

  } catch (error: any) {
    console.error('🔥 [WEB REGISTER] Error fatal:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
