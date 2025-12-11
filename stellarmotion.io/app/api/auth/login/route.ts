import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/auth/users';
import { signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { getAdminSupabase } from '@/lib/supabase/admin';

// Forzar runtime Node.js para acceso completo a process.env
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

    console.log('🔐 [WEB LOGIN] Iniciando login directo en Supabase');
    
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    // Buscar usuario por email
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log('❌ [WEB LOGIN] Usuario no encontrado:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!user.passwordhash) {
      console.error('❌ [WEB LOGIN] Usuario sin passwordhash');
      return NextResponse.json(
        { error: 'Error de configuración del usuario' },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordhash);
    
    if (!isValidPassword) {
      console.log('❌ [WEB LOGIN] Contraseña incorrecta para:', email);
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
    console.log('✅ [WEB LOGIN] Login exitoso:', user.email);
    
    return response;
  } catch (error: any) {
    console.error('🔥 [WEB LOGIN] Error fatal:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
