import { NextRequest, NextResponse } from 'next/server';
import { createUserWithRole, findUserByEmail, signSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/auth/cookies';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [REGISTER CLIENT] Iniciando registro de cliente...');
    
    const data = await request.json();
    
    // Validaciones básicas
    if (!data.email || !data.password || !data.nombre_contacto || !data.telefono || !data.pais) {
      return withCors(NextResponse.json(
        { error: 'Faltan campos requeridos: email, password, nombre_contacto, telefono, pais' },
        { status: 400 }
      ));
    }
    
    // Extraer nombre y apellidos de nombre_contacto si viene separado
    let nombre = data.nombre_contacto?.trim() || '';
    let apellidos = data.apellidos?.trim() || '';
    
    // Si nombre_contacto contiene espacio, separar en nombre y apellidos
    if (nombre && !apellidos && nombre.includes(' ')) {
      const parts = nombre.split(' ');
      nombre = parts[0] || '';
      apellidos = parts.slice(1).join(' ') || '';
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return withCors(NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      ));
    }

    // Verificar si el email ya existe
    console.log('🔍 [REGISTER CLIENT] Verificando si email existe...');
    const existing = await findUserByEmail(data.email);
    
    if (existing) {
      console.log('⚠️ [REGISTER CLIENT] Email ya existe');
      return withCors(NextResponse.json(
        { 
          error: 'EMAIL_EXISTS',
          action: 'LOGIN_TO_UPGRADE',
          message: 'Este email ya está registrado. Por favor, inicia sesión para completar tu perfil como owner.'
        },
        { status: 409 }
      ));
    }

    // Crear usuario con role 'client'
    console.log('🔐 [REGISTER CLIENT] Creando usuario...');
    let user;
    try {
      user = await createUserWithRole(
        data.email.trim(), 
        data.password, 
        nombre, 
        'client',
        data.telefono?.trim(),
        data.pais?.trim(),
        apellidos
      );
      console.log('✅ [REGISTER CLIENT] Usuario creado:', user.id, {
        email: data.email.trim(),
        nombre,
        apellidos: apellidos || 'no proporcionado',
        telefono: data.telefono?.trim() || 'no proporcionado',
        pais: data.pais?.trim() || 'no proporcionado'
      });
    } catch (userError: any) {
      console.error('❌ [REGISTER CLIENT] Error creando usuario:', userError);
      return withCors(NextResponse.json(
        { 
          error: 'Error al crear usuario',
          details: userError?.message || 'Error desconocido al crear usuario'
        },
        { status: 500 }
      ));
    }

    console.log('✅ [REGISTER CLIENT] Brand creado exitosamente:', user.id);
    
    // Crear sesión y cookie
    let token;
    try {
      token = await signSession({ 
        id: user.id, 
        email: user.fields.Email, 
        role: 'client', 
        name: user.fields.Nombre 
      });
      console.log('✅ [REGISTER CLIENT] Sesión creada');
    } catch (sessionError: any) {
      console.error('❌ [REGISTER CLIENT] Error creando sesión:', sessionError);
      return withCors(NextResponse.json(
        { 
          error: 'Error al crear sesión',
          details: sessionError?.message || 'Error desconocido al crear sesión'
        },
        { status: 500 }
      ));
    }
    
    const response = withCors(NextResponse.json({
      user_id: user.id,
      email: user.fields.Email,
      role: 'client'
    }, { status: 201 }));
    
    setSessionCookie(response, token);
    return response;

  } catch (error) {
    console.error('❌ [REGISTER CLIENT] Error Fatal:', error);
    console.error('❌ [REGISTER CLIENT] Stack:', error instanceof Error ? error.stack : 'No stack');
    return withCors(NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    ));
  }
}


