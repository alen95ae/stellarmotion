import { NextRequest, NextResponse } from 'next/server';
import { getUserByIdSupabase } from '@/lib/supabaseUsers';
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
    console.log('🔄 [SYNC USER] Iniciando sincronización de usuario...');
    
    const data = await request.json();
    
    const { id, email, name, role } = data;

    // Validaciones básicas
    if (!id || !email) {
      console.error('❌ [SYNC USER] Faltan campos obligatorios');
      return withCors(NextResponse.json(
        { error: 'Faltan campos obligatorios: id, email' },
        { status: 400 }
      ));
    }

    console.log('🔍 [SYNC USER] Verificando usuario:', { id, email, name, role });

    // 1. Buscar si ya existe el usuario en el ERP
    const existingUser = await getUserByIdSupabase(id);

    if (existingUser) {
      console.log('✅ [SYNC USER] Usuario ya existe en ERP:', existingUser.id);
      return withCors(NextResponse.json(
        { 
          message: 'Usuario ya existía, sincronización correcta', 
          user: {
            id: existingUser.id,
            email: existingUser.fields.Email,
            name: existingUser.fields.Nombre,
            role: existingUser.fields.Rol
          }
        },
        { status: 200 }
      ));
    }

    // 2. Obtener rol_id por defecto (client) si no se proporciona
    let rol_id: string | undefined = undefined;
    const roleName = role || 'client';
    
    try {
      console.log('🔍 [SYNC USER] Buscando rol:', roleName);
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('nombre', roleName)
        .maybeSingle();
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('❌ [SYNC USER] Error obteniendo rol:', roleError);
      }
      
      if (roleData) {
        rol_id = roleData.id;
        console.log('✅ [SYNC USER] Rol encontrado:', roleName, 'ID:', rol_id);
      } else {
        console.warn(`⚠️ [SYNC USER] Rol '${roleName}' no encontrado. Buscando rol 'client' por defecto...`);
        // Intentar con 'client' como fallback
        const { data: defaultRole } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('nombre', 'client')
          .maybeSingle();
        
        if (defaultRole) {
          rol_id = defaultRole.id;
          console.log('✅ [SYNC USER] Usando rol client por defecto, ID:', rol_id);
        }
      }
    } catch (error: any) {
      console.error('❌ [SYNC USER] Error al obtener rol:', error.message);
      // Continuar sin rol_id si hay error
    }

    // 3. Insertar usuario nuevo en el ERP
    const now = new Date().toISOString();
    const userData: any = {
      id: id, // Usar el ID proporcionado (debe ser UUID)
      email: email.trim().toLowerCase(),
      nombre: name || '',
      activo: true,
      fecha_creacion: now,
      created_at: now,
      updated_at: now
    };

    if (rol_id) {
      userData.rol_id = rol_id;
    }

    console.log('📤 [SYNC USER] Creando usuario en ERP:', { 
      id: userData.id, 
      email: userData.email, 
      nombre: userData.nombre,
      hasRolId: !!userData.rol_id 
    });

    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert([userData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ [SYNC USER] Error insertando usuario:', insertError);
      console.error('❌ [SYNC USER] Error code:', insertError.code);
      console.error('❌ [SYNC USER] Error message:', insertError.message);
      console.error('❌ [SYNC USER] Error details:', insertError.details);
      
      // Si el error es que ya existe (duplicate key), devolver éxito
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        console.log('⚠️ [SYNC USER] Usuario ya existe (duplicate key), verificando nuevamente...');
        const recheckUser = await getUserByIdSupabase(id);
        if (recheckUser) {
          return withCors(NextResponse.json(
            { 
              message: 'Usuario ya existía (duplicate key), sincronización correcta', 
              user: {
                id: recheckUser.id,
                email: recheckUser.fields.Email,
                name: recheckUser.fields.Nombre,
                role: recheckUser.fields.Rol
              }
            },
            { status: 200 }
          ));
        }
      }
      
      return withCors(NextResponse.json(
        { 
          error: 'Error al sincronizar usuario',
          details: insertError.message
        },
        { status: 500 }
      ));
    }

    console.log('✅ [SYNC USER] Usuario sincronizado correctamente:', insertedUser.id);
    return withCors(NextResponse.json(
      { 
        message: 'Usuario sincronizado correctamente', 
        user: {
          id: insertedUser.id,
          email: insertedUser.email,
          name: insertedUser.nombre,
          role: roleName
        }
      },
      { status: 201 }
    ));

  } catch (error: any) {
    console.error('🔥 [SYNC USER] Error fatal:', error);
    return withCors(NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    ));
  }
}
