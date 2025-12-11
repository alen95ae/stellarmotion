import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserByIdSupabase, updateUserRoleSupabase } from '@/lib/supabaseUsers';

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
    console.log('🏢 [ERP COMPLETE OWNER] POST received');

    // Leer body con seguridad
    let data;
    try {
      data = await request.json();
    } catch (e) {
      console.error('❌ [ERP COMPLETE OWNER] Invalid JSON body');
      return withCors(NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }));
    }

    console.log('📝 [ERP COMPLETE OWNER] Payload summary:', {
      user_id: data.user_id,
      tipo: data.tipo_contacto,
      has_empresa: !!data.empresa
    });

    // Validar que viene user_id (requerido)
    if (!data.user_id) {
      console.error('❌ [ERP COMPLETE OWNER] Missing user_id');
      return withCors(NextResponse.json(
        { error: 'user_id es requerido. El usuario debe estar autenticado.' },
        { status: 400 }
      ));
    }

    const userId = data.user_id;

    // Verificar que el usuario existe en la tabla usuarios
    console.log(`🔍 [ERP COMPLETE OWNER] Verificando Usuario: ${userId}`);
    console.log(`🔍 [ERP COMPLETE OWNER] Tipo de userId: ${typeof userId}, Longitud: ${userId?.length}`);
    
    const existingUser = await getUserByIdSupabase(userId);

    if (!existingUser) {
      console.error('❌ [ERP COMPLETE OWNER] Usuario no encontrado en tabla usuarios');
      console.error('❌ [ERP COMPLETE OWNER] userId buscado:', userId);
      console.error('❌ [ERP COMPLETE OWNER] Intentando verificar si existe en Supabase...');
      
      // Intentar buscar por email como fallback para debug
      if (data.email) {
        const { data: userByEmail } = await supabaseAdmin
          .from('usuarios')
          .select('id, email')
          .eq('email', data.email)
          .maybeSingle();
        
        console.log('🔍 [ERP COMPLETE OWNER] Usuario encontrado por email:', userByEmail);
        
        if (userByEmail && userByEmail.id !== userId) {
          console.error('⚠️ [ERP COMPLETE OWNER] El userId no coincide con el encontrado por email');
          console.error('⚠️ [ERP COMPLETE OWNER] userId enviado:', userId);
          console.error('⚠️ [ERP COMPLETE OWNER] userId real:', userByEmail.id);
        }
      }
      
      return withCors(NextResponse.json(
        { 
          error: 'El user_id proporcionado no es válido o no existe en la tabla usuarios',
          details: `userId: ${userId}, email: ${data.email}`
        },
        { status: 400 }
      ));
    }

    console.log('✅ [ERP COMPLETE OWNER] Usuario encontrado:', {
      id: existingUser.id,
      email: existingUser.email,
      nombre: existingUser.nombre
    });

    // Mapear tipo_owner a tipo_contacto
    const tipo_contacto = data.tipo_contacto || (data.tipo_owner === 'empresa' ? 'empresa' : data.tipo_owner) || 'persona';

    // Validar que tipo_contacto sea un valor válido
    if (!['persona', 'empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      return withCors(NextResponse.json(
        { error: `tipo_contacto inválido: ${tipo_contacto}. Debe ser persona, empresa, agencia o gobierno.` },
        { status: 400 }
      ));
    }

    // Validaciones básicas de campos según tipo
    if (tipo_contacto === 'persona') {
      if (!data.nombre_contacto || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' },
          { status: 400 }
        ));
      }
    } else if (['empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      if (!data.empresa) {
        console.error('❌ [ERP COMPLETE OWNER] Falta campo empresa para tipo:', tipo_contacto);
        return withCors(NextResponse.json(
          { error: `El campo 'empresa' es obligatorio para ${tipo_contacto}` },
          { status: 400 }
        ));
      }
      if (!data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json(
          { error: 'Faltan campos requeridos: email, telefono, pais' },
          { status: 400 }
        ));
      }
    }

    // Verificar si el usuario ya tiene registro en owners
    console.log('🔍 [ERP COMPLETE OWNER] Consultando tabla owners...');
    const { data: existingOwner, error: checkError } = await supabaseAdmin
      .from('owners')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [ERP COMPLETE OWNER] DB Error verificando owner:', checkError);
      return withCors(NextResponse.json(
        { error: 'Error de base de datos al verificar owner' },
        { status: 500 }
      ));
    }

    // Datos comunes de Upsert
    const commonData: any = {
      nombre_contacto: data.nombre_contacto,
      email: data.email, // Preferimos el del payload si coincide, o podriamos forzar el del auth user
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

    let resultOwner;

    if (existingOwner) {
      // UPDATE
      console.log(`🔄 [ERP COMPLETE OWNER] Usuario ya es owner (ID: ${existingOwner.id}). Actualizando...`);

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('owners')
        .update(commonData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [ERP COMPLETE OWNER] Update Failed:', updateError);
        return withCors(NextResponse.json({ error: updateError.message }, { status: 500 }));
      }
      resultOwner = updated;

    } else {
      // INSERT
      console.log('🆕 [ERP COMPLETE OWNER] Creando nuevo registro owner...');

      const insertData = {
        ...commonData,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('owners')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [ERP COMPLETE OWNER] Insert Failed:', insertError);
        return withCors(NextResponse.json({ error: insertError.message }, { status: 500 }));
      }
      resultOwner = inserted;
    }

    // Actualizar rol del usuario a owner
    console.log('🔄 [ERP COMPLETE OWNER] Actualizando rol a owner...');
    try {
      await updateUserRoleSupabase(userId, 'owner');
    } catch (error) {
      console.error('Error actualizando rol a owner:', error);
      // No fallar si no se puede actualizar el rol, solo loguear
    }

    console.log('✅ [ERP COMPLETE OWNER] Proceso finalizado con éxito.');
    return withCors(NextResponse.json({
      ...resultOwner,
      user_id: userId
    }, { status: existingOwner ? 200 : 201 }));

  } catch (error: any) {
    console.error('🔥 [ERP COMPLETE OWNER] Excepción fatal:', error);
    return withCors(NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    ));
  }
}

