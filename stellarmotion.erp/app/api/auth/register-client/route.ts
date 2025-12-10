import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return withCors(NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      ));
    }

    // Verificar si el email ya existe en auth.users
    console.log('🔍 [REGISTER CLIENT] Verificando si email existe...');
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExistsInAuth = authUsers?.users?.some(user => 
      user.email?.toLowerCase() === data.email.toLowerCase()
    );
    
    if (emailExistsInAuth) {
      console.log('⚠️ [REGISTER CLIENT] Email ya existe en auth.users');
      return withCors(NextResponse.json(
        { 
          error: 'EMAIL_EXISTS',
          action: 'LOGIN_TO_UPGRADE',
          message: 'Este email ya está registrado. Por favor, inicia sesión para completar tu perfil como owner.'
        },
        { status: 409 }
      ));
    }

    // Crear usuario en Supabase Auth con role 'client'
    console.log('🔐 [REGISTER CLIENT] Creando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      email_confirm: true,
      user_metadata: {
        nombre_contacto: data.nombre_contacto.trim(),
        telefono: data.telefono.trim(),
        pais: data.pais.trim(),
        role: 'client'
      }
    });

    if (authError) {
      console.error('❌ [REGISTER CLIENT] Error creando Auth User:', authError.message);
      
      // Si el error es que el usuario ya existe, devolver el mismo formato
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return withCors(NextResponse.json(
          { 
            error: 'EMAIL_EXISTS',
            action: 'LOGIN_TO_UPGRADE',
            message: 'Este email ya está registrado. Por favor, inicia sesión para completar tu perfil como owner.'
          },
          { status: 409 }
        ));
      }
      
      return withCors(NextResponse.json(
        { error: authError.message || 'Error al crear usuario en Auth' },
        { status: 400 }
      ));
    }

    if (!authData.user) {
      return withCors(NextResponse.json(
        { error: 'No se pudo crear el usuario en Auth' },
        { status: 500 }
      ));
    }

    console.log('✅ [REGISTER CLIENT] Cliente creado exitosamente:', authData.user.id);
    
    // Retornar solo el user_id y email (nunca password)
    return withCors(NextResponse.json({
      user_id: authData.user.id,
      email: authData.user.email,
      role: 'client'
    }, { status: 201 }));

  } catch (error) {
    console.error('❌ [REGISTER CLIENT] Error Fatal:', error);
    return withCors(NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    ));
  }
}

