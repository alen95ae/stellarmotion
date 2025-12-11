import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/auth/users';
import { signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📡 [WEB REGISTER-CLIENT] Registro directo en Supabase (sin ERP)');
    
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    // Validaciones básicas
    if (!body.email || !body.password || !body.nombre_contacto || !body.telefono || !body.pais) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, password, nombre_contacto, telefono, pais' },
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
    console.log('🔍 [WEB REGISTER-CLIENT] Verificando si email existe...');
    const existing = await findUserByEmail(body.email);
    
    if (existing) {
      console.log('⚠️ [WEB REGISTER-CLIENT] Email ya existe');
      return NextResponse.json(
        { 
          error: 'EMAIL_EXISTS',
          action: 'LOGIN_TO_UPGRADE',
          message: 'Este email ya está registrado. Por favor, inicia sesión para completar tu perfil como owner.'
        },
        { status: 409 }
      );
    }

    // Extraer nombre y apellidos
    let nombre = body.nombre_contacto?.trim() || '';
    let apellidos = body.apellidos?.trim() || '';
    
    if (nombre && !apellidos && nombre.includes(' ')) {
      const parts = nombre.split(' ');
      nombre = parts[0] || '';
      apellidos = parts.slice(1).join(' ') || '';
    }

    // Crear usuario en Supabase
    console.log('🔐 [WEB REGISTER-CLIENT] Creando usuario en Supabase...');
    let user;
    try {
      user = await createUser(
        body.email.trim(),
        body.password,
        nombre,
        'client',
        body.telefono?.trim(),
        body.pais?.trim(),
        apellidos
      );
      console.log('✅ [WEB REGISTER-CLIENT] Usuario creado:', user.id);
    } catch (userError: any) {
      console.error('❌ [WEB REGISTER-CLIENT] Error creando usuario:', userError);
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
      console.log('🔐 [WEB REGISTER-CLIENT] Creando JWT con user.id:', user.id);
      
      token = await signSession({
        id: user.id,
        email: user.email,
        role: 'client',
        name: user.nombre || ''
      });
      
      console.log('✅ [WEB REGISTER-CLIENT] Sesión JWT creada con sub:', user.id);
      console.log('✅ [WEB REGISTER-CLIENT] Este ID se usará en TODAS las operaciones posteriores');
    } catch (sessionError: any) {
      console.error('❌ [WEB REGISTER-CLIENT] Error creando sesión:', sessionError);
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
      user_id: user.id,
      email: user.email,
      role: 'client'
    }, { status: 201 });

    setSessionCookie(response, token);
    
    console.log('✅ [WEB REGISTER-CLIENT] Registro completado exitosamente');
    console.log('✅ [WEB REGISTER-CLIENT] Usuario creado con ID:', user.id);
    console.log('✅ [WEB REGISTER-CLIENT] Cookie JWT establecida con este ID');
    
    return response;

  } catch (error: any) {
    console.error('🔥 [WEB REGISTER-CLIENT] Error fatal:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
