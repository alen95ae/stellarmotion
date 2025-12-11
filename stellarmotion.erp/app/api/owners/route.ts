import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SupabaseService } from '@/lib/supabase-service';
import { getUserByIdSupabase, updateUserRoleSupabase, userExistsById } from '@/lib/supabaseUsers';
import { findUserByEmail, createUserWithRole } from '@/lib/auth';

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
    const tipo_contacto = data.tipo_contacto || (data.tipo_owner === 'empresa' ? 'empresa' : data.tipo_owner) || 'persona';

    // Validar que tipo_contacto sea un valor válido
    if (!['persona', 'empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      return withCors(NextResponse.json(
        { error: `tipo_contacto inválido: ${tipo_contacto}. Debe ser persona, empresa, agencia o gobierno.` },
        { status: 400 }
      ));
    }

    // Verificar si viene user_id (usuario ya autenticado) o password (nuevo registro)
    const isExistingUser = !!data.user_id;
    const hasPassword = !!data.password;

    // Validaciones según tipo_contacto
    if (tipo_contacto === 'persona') {
      // Para persona: nombre_contacto, email, telefono, pais son obligatorios
      if (!data.nombre_contacto || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' },
          { status: 400 }
        ));
      }
      // Password solo es requerido si no viene user_id
      if (!isExistingUser && !hasPassword) {
        return withCors(NextResponse.json(
          { error: 'Falta campo requerido: password' },
          { status: 400 }
        ));
      }
    } else if (tipo_contacto === 'empresa' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
      // Para empresa/agencia/gobierno: empresa, nit, email, telefono, pais son obligatorios
      if (!data.empresa || !data.nit || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: empresa, nit, email, telefono, pais' },
          { status: 400 }
        ));
      }
      // Password solo es requerido si no viene user_id
      if (!isExistingUser && !hasPassword) {
        return withCors(NextResponse.json(
          { error: 'Falta campo requerido: password' },
          { status: 400 }
        ));
      }
    } else {
      return withCors(NextResponse.json(
        { error: 'tipo_contacto inválido. Debe ser: persona, empresa, agencia o gobierno' },
        { status: 400 }
      ));
    }

    let userId: string;

    if (isExistingUser) {
      // Usuario ya autenticado - usar el user_id proporcionado
      userId = data.user_id;
      console.log('🔐 [API ERP] Usando usuario existente (upsert idempotente):', userId);
      
      // Verificar que el usuario existe en la tabla usuarios
      const existingUser = await getUserByIdSupabase(userId);
      
      if (!existingUser) {
        return withCors(NextResponse.json(
          { error: 'El user_id proporcionado no es válido' },
          { status: 400 }
        ));
      }

      // Verificar que el email del usuario coincide (comparación case-insensitive)
      const userEmail = existingUser.email?.toLowerCase().trim();
      const requestEmail = data.email?.toLowerCase().trim();
      
      if (userEmail !== requestEmail) {
        console.error('❌ [API ERP] Email no coincide:', { userEmail, requestEmail });
        return withCors(NextResponse.json(
          { error: `El email no coincide con el usuario autenticado. Email del usuario: ${userEmail}, Email enviado: ${requestEmail}` },
          { status: 400 }
        ));
      }

      // Usar el email del usuario autenticado para asegurar consistencia
      data.email = existingUser.email;

      // Verificar si el usuario ya tiene registro en owners
      const { data: existingOwner, error: checkError } = await supabaseAdmin
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 es "no rows returned", cualquier otro error es real
        console.error('❌ [API ERP] Error verificando owner:', checkError);
        return withCors(NextResponse.json(
          { error: 'Error al verificar registro existente' },
          { status: 500 }
        ));
      }

      // Si YA EXISTE -> ACTUALIZAMOS (Upsert lógico, nunca 409)
      if (existingOwner) {
        console.log('🔄 [API ERP] Owner existente para user_id. Actualizando datos (upsert)...');

        // Preparar datos a actualizar (excluyendo id, created_at, user_id)
        const updateData: any = {
          nombre_contacto: data.nombre_contacto,
          email: data.email,
          telefono: data.telefono,
          pais: data.pais,
          tipo_contacto: tipo_contacto,
          updated_at: new Date().toISOString()
        };

        // Campos específicos según tipo_contacto
        if (tipo_contacto === 'persona') {
          updateData.direccion = data.direccion || null;
          updateData.ciudad = data.ciudad || null;
        } else if (tipo_contacto === 'empresa' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
          updateData.empresa = data.empresa || null;
          updateData.nit = data.nit || null;
          updateData.direccion = data.direccion || null;
          updateData.ciudad = data.ciudad || null;
          updateData.sitio_web = data.sitio_web || null;
        }

        // Nuevos campos comunes
        updateData.tipo_empresa = data.tipo_empresa || null;
        updateData.representante_legal = data.representante_legal || null;
        updateData.tax_id = data.tax_id || null;
        updateData.puesto = data.puesto || null;
        updateData.tipo_tenencia = data.tipo_tenencia || null;
        updateData.tiene_permisos = data.tiene_permisos !== undefined ? data.tiene_permisos : false;
        updateData.permite_instalacion = data.permite_instalacion !== undefined ? data.permite_instalacion : false;

        // Actualizar el registro existente
        const { data: updatedOwner, error: updateError } = await supabaseAdmin
          .from('owners')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [API ERP] Error actualizando owner:', updateError);
          return withCors(NextResponse.json(
            { error: updateError.message || 'Error al actualizar el owner' },
            { status: 500 }
          ));
        }

        // Actualizar rol del usuario a owner
        try {
          await updateUserRoleSupabase(userId, 'owner');
        } catch (error) {
          console.error('Error actualizando rol a owner:', error);
          // No fallar si no se puede actualizar el rol, solo loguear
        }

        console.log('✅ [API ERP] Owner actualizado correctamente (200 OK).');
        return withCors(NextResponse.json({
          ...updatedOwner,
          user_id: userId
        }, { status: 200 }));
      }

      // Si NO EXISTE en owners (pero sí tiene user_id) -> CREAMOS EL REGISTRO
      // Esto pasa si era un "Cliente" que nunca había sido "Owner" o es un primer registro
      console.log('🆕 [API ERP] Usuario existe pero no en Owners. Creando perfil...');

      // Actualizar rol del usuario a owner
      try {
        await updateUserRoleSupabase(userId, 'owner');
      } catch (error) {
        console.error('Error actualizando rol a owner:', error);
        // No fallar si no se puede actualizar el rol, solo loguear
      }
    } else {
      // Para nuevos usuarios, verificar si el email ya existe en owners
      const { data: existingOwner } = await supabaseAdmin
        .from('owners')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingOwner) {
        return withCors(NextResponse.json(
          { error: 'Este email ya está registrado como owner' },
          { status: 409 }
        ));
      }
      // Nuevo usuario - verificar que el email no existe
      const existingUser = await findUserByEmail(data.email);
      
      if (existingUser) {
        return withCors(NextResponse.json(
          { error: 'Este email ya está registrado. Por favor, inicia sesión para completar tu registro como owner.' },
          { status: 409 }
        ));
      }

      console.log('🔐 [API ERP] Paso 1 - Creando usuario...');
      const newUser = await createUserWithRole(
        data.email,
        data.password,
        data.nombre_contacto,
        'owner'
      );

      userId = newUser.id;
      console.log('✅ [API ERP] Usuario creado:', userId);
    }

    // 2. Crear registro en tabla owners usando SupabaseService.createOwner
    console.log('🏢 [API ERP] Paso 2 - Creando registro en tabla owners...');
    
    // Preparar datos para createOwner
    // Mapear tipo_contacto a tipo_owner para SupabaseService.createOwner
    const tipo_owner_map: Record<string, 'persona' | 'empresa' | 'gobierno' | 'agencia'> = {
      'persona': 'persona',
      'empresa': 'empresa',
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
    } else if (tipo_contacto === 'empresa' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
      ownerData.razon_social = data.empresa || null;
      ownerData.ein = data.nit || null;
      ownerData.direccion_fiscal = data.direccion || null;
      ownerData.ciudad = data.ciudad || null;
    }

    // Nuevos campos comunes
    ownerData.tipo_empresa = data.tipo_empresa || null;
    ownerData.representante_legal = data.representante_legal || null;
    ownerData.tax_id = data.tax_id || null;
    ownerData.puesto = data.puesto || null;
    ownerData.tipo_tenencia = data.tipo_tenencia || null;
    ownerData.tiene_permisos = data.tiene_permisos || false;
    ownerData.permite_instalacion = data.permite_instalacion || false;

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
      
      // Limpiar: eliminar usuario solo si fue creado en esta petición (no si ya existía)
      if (!isExistingUser) {
        await supabaseAdmin
          .from('usuarios')
          .delete()
          .eq('id', userId)
          .catch(() => {});
      }
      
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
