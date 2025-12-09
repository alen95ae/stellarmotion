import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseService } from '@/lib/supabase-service';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Buscar owner por email en tabla owners usando supabaseAdmin
      const { data, error } = await supabaseAdmin
        .from('owners')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching owner:', error);
        return withCors(NextResponse.json(
          { error: 'Error al buscar owner' },
          { status: 500 }
        ));
      }

      return withCors(NextResponse.json(data ? [data] : []));
    }

    // Si no hay email, devolver error (no listamos todos los owners por seguridad)
    return withCors(NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    ));
  } catch (error) {
    console.error('Error fetching owners:', error);
    return withCors(NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    ));
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // LOG TEMPORAL: Verificar que estamos usando service role
    console.log("📥 Body recibido en ERP:", JSON.stringify(data, null, 2));
    console.log("🔐 Usando service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
    // Mapear tipo_owner a tipo_contacto (si viene tipo_owner, convertir a tipo_contacto)
    const tipo_contacto = data.tipo_contacto || (data.tipo_owner === 'empresa' ? 'compania' : data.tipo_owner) || 'persona';

    // Validaciones según tipo_contacto
    if (tipo_contacto === 'persona') {
      // Para persona: nombre_contacto, email, telefono, pais son obligatorios
      if (!data.nombre_contacto || !data.email || !data.telefono || !data.pais || !data.password) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais, password' },
          { status: 400 }
        ));
      }
    } else if (tipo_contacto === 'compania' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
      // Para compania/agencia/gobierno: empresa, nit, email, telefono, pais son obligatorios
      if (!data.empresa || !data.nit || !data.email || !data.telefono || !data.pais || !data.password) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: empresa, nit, email, telefono, pais, password' },
          { status: 400 }
        ));
      }
    } else {
      return withCors(NextResponse.json(
        { error: 'tipo_contacto inválido. Debe ser: persona, compania, agencia o gobierno' },
        { status: 400 }
      ));
    }

    // Verificar si el email ya existe en owners o en auth.users
    const { data: existingOwner } = await supabaseAdmin
      .from('owners')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    if (existingOwner) {
      return withCors(NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      ));
    }

    // Verificar también en auth.users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExistsInAuth = authUsers?.users?.some(user => user.email === data.email);
    
    if (emailExistsInAuth) {
      return withCors(NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      ));
    }

    // 1. Crear usuario en Supabase Auth usando supabaseAdmin
    console.log('🔐 [API ERP] Paso 1 - Creando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        nombre_contacto: data.nombre_contacto,
        telefono: data.telefono,
        pais: data.pais,
        rol: 'owner',
        tipo_owner: data.tipo_contacto || data.tipo_owner
      }
    });

    if (authError) {
      console.error('❌ [API ERP] Error creando Auth User:', authError.message);
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

    const userId = authData.user.id;
    console.log('✅ [API ERP] Auth User creado:', userId);

    // 2. Crear registro en tabla owners usando SupabaseService.createOwner
    console.log('🏢 [API ERP] Paso 2 - Creando registro en tabla owners...');
    
    // Preparar datos para createOwner
    // Mapear tipo_contacto a tipo_owner para SupabaseService.createOwner
    const tipo_owner_map: Record<string, 'persona' | 'empresa' | 'gobierno' | 'agencia'> = {
      'persona': 'persona',
      'compania': 'empresa',
      'gobierno': 'gobierno',
      'agencia': 'agencia'
    };
    
    const ownerData: any = {
      user_id: userId,
      nombre_contacto: data.nombre_contacto,
      email: data.email,
      telefono: data.telefono,
      pais: data.pais,
      tipo_owner: tipo_owner_map[tipo_contacto] || 'persona',
      sitio_web: data.sitio_web || null
    };

    // Campos específicos según tipo_contacto
    if (tipo_contacto === 'persona') {
      ownerData.direccion = data.direccion || null;
      ownerData.ciudad = data.ciudad || null;
    } else if (tipo_contacto === 'compania' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
      ownerData.razon_social = data.empresa || null;
      ownerData.ein = data.nit || null;
      ownerData.direccion_fiscal = data.direccion || null;
      ownerData.ciudad = data.ciudad || null;
    }

    try {
      // Usar SupabaseService.createOwner que usa supabaseAdmin internamente
      const newOwner = await SupabaseService.createOwner(ownerData);
      
      console.log('✅ [API ERP] Owner creado exitosamente');
      return withCors(NextResponse.json({
        ...newOwner,
        user_id: userId
      }, { status: 201 }));
    } catch (ownerError: any) {
      console.error('🔥 [API ERP] Error Fatal en createOwner:', ownerError);
      
      // Limpiar: eliminar usuario de Auth si falla la creación del owner
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      
      return withCors(NextResponse.json(
        { 
          error: ownerError.message || 'Error al crear el owner',
          details: ownerError
        },
        { status: 500 }
      ));
    }

  } catch (error) {
    console.error('❌ ERP: Error creating owner:', error);
    return withCors(NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    ));
  }
}
