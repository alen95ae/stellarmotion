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
    console.log('🏢 [COMPLETE OWNER] Iniciando completado de perfil owner...');
    
    const data = await request.json();
    
    // Validar que viene user_id (requerido)
    if (!data.user_id) {
      return withCors(NextResponse.json(
        { error: 'user_id es requerido. El usuario debe estar autenticado.' },
        { status: 400 }
      ));
    }

    const userId = data.user_id;
    
    // Verificar que el usuario existe en auth
    console.log('🔍 [COMPLETE OWNER] Verificando usuario en auth...');
    const { data: existingAuthUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authUserError || !existingAuthUser.user) {
      console.error('❌ [COMPLETE OWNER] Usuario no encontrado en auth:', authUserError);
      return withCors(NextResponse.json(
        { error: 'El user_id proporcionado no es válido' },
        { status: 400 }
      ));
    }

    // Mapear tipo_owner a tipo_contacto
    const tipo_contacto = data.tipo_contacto || (data.tipo_owner === 'empresa' ? 'compania' : data.tipo_owner) || 'persona';

    // Validaciones según tipo_contacto
    if (tipo_contacto === 'persona') {
      if (!data.nombre_contacto || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' },
          { status: 400 }
        ));
      }
    } else if (tipo_contacto === 'compania' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
      if (!data.empresa || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: empresa, email, telefono, pais' },
          { status: 400 }
        ));
      }
    }

    // Verificar que el email del usuario coincide
    const userEmail = existingAuthUser.user.email?.toLowerCase().trim();
    const requestEmail = data.email?.toLowerCase().trim();
    
    if (userEmail !== requestEmail) {
      console.error('❌ [COMPLETE OWNER] Email no coincide:', { userEmail, requestEmail });
      return withCors(NextResponse.json(
        { error: `El email no coincide con el usuario autenticado. Email del usuario: ${userEmail}, Email enviado: ${requestEmail}` },
        { status: 400 }
      ));
    }

    // Usar el email del usuario autenticado para asegurar consistencia
    data.email = existingAuthUser.user.email;

    // Verificar si el usuario ya tiene registro en owners
    console.log('🔍 [COMPLETE OWNER] Verificando si owner existe...');
    const { data: existingOwner, error: checkError } = await supabaseAdmin
      .from('owners')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [COMPLETE OWNER] Error verificando owner:', checkError);
      return withCors(NextResponse.json(
        { error: 'Error al verificar registro existente' },
        { status: 500 }
      ));
    }

    // Mapear tipo_contacto a tipo_owner
    const tipo_owner_map: Record<string, 'persona' | 'empresa' | 'gobierno' | 'agencia'> = {
      'persona': 'persona',
      'compania': 'empresa',
      'gobierno': 'gobierno',
      'agencia': 'agencia'
    };
    
    const tipo_owner = tipo_owner_map[tipo_contacto] || 'persona';

    if (existingOwner) {
      // Si YA EXISTE -> ACTUALIZAMOS (Upsert lógico)
      console.log('🔄 [COMPLETE OWNER: update] El owner ya existe. Actualizando datos...');
      
      // Preparar datos a actualizar
      const updateData: any = {
        nombre_contacto: data.nombre_contacto,
        email: data.email,
        telefono: data.telefono,
        pais: data.pais,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        tipo_contacto: tipo_contacto,
        empresa: data.empresa || null,
        tipo_empresa: data.tipo_empresa || null,
        representante_legal: data.representante_legal || null,
        tax_id: data.tax_id || null,
        puesto: data.puesto || null,
        tipo_tenencia: data.tipo_tenencia || null,
        sitio_web: data.sitio_web || null,
        direccion_fiscal: data.direccion_fiscal || null,
        tiene_permisos: data.tiene_permisos !== undefined ? data.tiene_permisos : false,
        permite_instalacion: data.permite_instalacion !== undefined ? data.permite_instalacion : false,
        updated_at: new Date().toISOString()
      };

      // Actualizar el registro existente
      const { data: updatedOwner, error: updateError } = await supabaseAdmin
        .from('owners')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [COMPLETE OWNER: update] Error actualizando owner:', updateError);
        return withCors(NextResponse.json(
          { error: updateError.message || 'Error al actualizar el owner' },
          { status: 500 }
        ));
      }

      // Actualizar metadata del usuario para incluir rol owner
      console.log('🔄 [UPDATED METADATA role=owner] Actualizando user_metadata...');
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingAuthUser.user.user_metadata,
          nombre_contacto: data.nombre_contacto,
          telefono: data.telefono,
          pais: data.pais,
          role: 'owner',
          tipo_owner: tipo_contacto || data.tipo_owner
        }
      });

      console.log('✅ [COMPLETE OWNER: update] Owner actualizado correctamente.');
      return withCors(NextResponse.json({
        ...updatedOwner,
        user_id: userId
      }, { status: 200 }));

    } else {
      // Si NO EXISTE -> CREAMOS EL REGISTRO
      console.log('🆕 [COMPLETE OWNER: insert] Usuario existe en Auth pero no en Owners. Creando perfil...');
      
      // Preparar datos para insert
      const insertData: any = {
        user_id: userId,
        nombre_contacto: data.nombre_contacto,
        email: data.email,
        telefono: data.telefono,
        pais: data.pais,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        tipo_contacto: tipo_contacto,
        empresa: data.empresa || null,
        tipo_empresa: data.tipo_empresa || null,
        representante_legal: data.representante_legal || null,
        tax_id: data.tax_id || null,
        puesto: data.puesto || null,
        tipo_tenencia: data.tipo_tenencia || null,
        sitio_web: data.sitio_web || null,
        direccion_fiscal: data.direccion_fiscal || null,
        tiene_permisos: data.tiene_permisos !== undefined ? data.tiene_permisos : false,
        permite_instalacion: data.permite_instalacion !== undefined ? data.permite_instalacion : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insertar el registro
      const { data: newOwner, error: insertError } = await supabaseAdmin
        .from('owners')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [COMPLETE OWNER: insert] Error insertando owner:', insertError);
        return withCors(NextResponse.json(
          { error: insertError.message || 'Error al crear el owner' },
          { status: 500 }
        ));
      }

      // Actualizar metadata del usuario para incluir rol owner
      console.log('🔄 [UPDATED METADATA role=owner] Actualizando user_metadata...');
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingAuthUser.user.user_metadata,
          nombre_contacto: data.nombre_contacto,
          telefono: data.telefono,
          pais: data.pais,
          role: 'owner',
          tipo_owner: tipo_contacto || data.tipo_owner
        }
      });

      console.log('✅ [COMPLETE OWNER: insert] Owner creado correctamente.');
      return withCors(NextResponse.json({
        ...newOwner,
        user_id: userId
      }, { status: 201 }));
    }

  } catch (error) {
    console.error('❌ [COMPLETE OWNER] Error Fatal:', error);
    return withCors(NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    ));
  }
}

