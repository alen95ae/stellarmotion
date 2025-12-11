import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📡 [WEB OWNERS/COMPLETE] Iniciando creación de owner directamente en Supabase...");

    // Leer variables de entorno con múltiples nombres posibles (compatibilidad)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    // Validación estricta con logging detallado
    console.log('🔍 [WEB OWNERS/COMPLETE] Verificando variables de entorno...');
    console.log('🔍 [WEB OWNERS/COMPLETE] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('🔍 [WEB OWNERS/COMPLETE] SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('🔍 [WEB OWNERS/COMPLETE] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada (longitud: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : '❌ No configurada');
    console.log('🔍 [WEB OWNERS/COMPLETE] NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada');

    if (!supabaseUrl) {
      console.error('❌ [WEB OWNERS/COMPLETE] SUPABASE_URL no encontrada en variables de entorno');
      console.error('❌ [WEB OWNERS/COMPLETE] Variables disponibles:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ') || 'Ninguna');
      return NextResponse.json(
        { 
          error: 'Configuración de Supabase incompleta: falta SUPABASE_URL',
          details: 'Busca NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL en las variables de entorno'
        },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      console.error('❌ [WEB OWNERS/COMPLETE] SUPABASE_SERVICE_ROLE_KEY no encontrada en variables de entorno');
      console.error('❌ [WEB OWNERS/COMPLETE] Variables disponibles:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ') || 'Ninguna');
      return NextResponse.json(
        { 
          error: 'Configuración de Supabase incompleta: falta SUPABASE_SERVICE_ROLE_KEY',
          details: 'La SERVICE_ROLE_KEY es requerida para operaciones administrativas. NO debe tener prefijo NEXT_PUBLIC_'
        },
        { status: 500 }
      );
    }

    // Validar que la SERVICE_ROLE_KEY no sea la anon key por error
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey && serviceRoleKey === anonKey) {
      console.error('❌ [WEB OWNERS/COMPLETE] CRÍTICO: SERVICE_ROLE_KEY es igual a ANON_KEY');
      return NextResponse.json(
        { 
          error: 'Configuración de seguridad inválida: SERVICE_ROLE_KEY no puede ser igual a ANON_KEY'
        },
        { status: 500 }
      );
    }

    console.log('✅ [WEB OWNERS/COMPLETE] Variables de entorno validadas correctamente');
    console.log('✅ [WEB OWNERS/COMPLETE] URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('✅ [WEB OWNERS/COMPLETE] Service Key preview:', serviceRoleKey.substring(0, 20) + '...' + serviceRoleKey.substring(serviceRoleKey.length - 10));

    // Crear cliente admin local para evitar fallas por import si faltan envs
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        db: { schema: 'public' },
      }
    );

    console.log('✅ [WEB OWNERS/COMPLETE] Cliente Supabase Admin creado correctamente');

    // Validar que viene user_id (requerido)
    if (!body.user_id) {
      console.error('❌ [WEB OWNERS/COMPLETE] Missing user_id');
      return NextResponse.json(
        { error: 'user_id es requerido. El usuario debe estar autenticado.' },
        { status: 400 }
      );
    }

    const userId = body.user_id;

    // Verificar que el usuario existe en la tabla usuarios de Supabase
    console.log(`🔍 [WEB OWNERS/COMPLETE] Verificando usuario en Supabase: ${userId}`);
    
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre')
      .eq('id', userId)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ [WEB OWNERS/COMPLETE] Error verificando usuario:', userError);
      return NextResponse.json(
        { error: 'Error al verificar usuario en Supabase' },
        { status: 500 }
      );
    }

    if (!existingUser) {
      console.error('❌ [WEB OWNERS/COMPLETE] Usuario no encontrado en tabla usuarios');
      console.error('❌ [WEB OWNERS/COMPLETE] userId buscado:', userId);
      
      // Intentar buscar por email como fallback para debug
      if (body.email) {
        const { data: userByEmail } = await supabaseAdmin
          .from('usuarios')
          .select('id, email')
          .eq('email', body.email)
          .maybeSingle();
        
        console.log('🔍 [WEB OWNERS/COMPLETE] Usuario encontrado por email:', userByEmail);
        
        if (userByEmail && userByEmail.id !== userId) {
          console.error('⚠️ [WEB OWNERS/COMPLETE] El userId no coincide con el encontrado por email');
          console.error('⚠️ [WEB OWNERS/COMPLETE] userId enviado:', userId);
          console.error('⚠️ [WEB OWNERS/COMPLETE] userId real:', userByEmail.id);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'El user_id proporcionado no es válido o no existe en la tabla usuarios de Supabase',
          details: `userId: ${userId}, email: ${body.email}`
        },
        { status: 400 }
      );
    }

    console.log('✅ [WEB OWNERS/COMPLETE] Usuario encontrado en Supabase:', {
      id: existingUser.id,
      email: existingUser.email,
      nombre: existingUser.nombre
    });

    // Mapear tipo_owner a tipo_contacto
    const tipo_contacto = body.tipo_contacto || (body.tipo_owner === 'empresa' ? 'empresa' : body.tipo_owner) || 'persona';

    // Validar que tipo_contacto sea un valor válido
    if (!['persona', 'empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      return NextResponse.json(
        { error: `tipo_contacto inválido: ${tipo_contacto}. Debe ser persona, empresa, agencia o gobierno.` },
        { status: 400 }
      );
    }

    // Validaciones básicas de campos según tipo
    if (tipo_contacto === 'persona') {
      if (!body.nombre_contacto || !body.email || !body.telefono || !body.pais) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' },
          { status: 400 }
        );
      }
    } else if (['empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      if (!body.empresa) {
        console.error('❌ [WEB OWNERS/COMPLETE] Falta campo empresa para tipo:', tipo_contacto);
        return NextResponse.json(
          { error: `El campo 'empresa' es obligatorio para ${tipo_contacto}` },
          { status: 400 }
        );
      }
      if (!body.email || !body.telefono || !body.pais) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: email, telefono, pais' },
          { status: 400 }
        );
      }
    }

    // Verificar si el usuario ya tiene registro en owners
    console.log('🔍 [WEB OWNERS/COMPLETE] Consultando tabla owners en Supabase...');
    const { data: existingOwner, error: checkError } = await supabaseAdmin
      .from('owners')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [WEB OWNERS/COMPLETE] Error verificando owner:', checkError);
      return NextResponse.json(
        { error: 'Error de base de datos al verificar owner' },
        { status: 500 }
      );
    }

    // Datos comunes para insert/update
    const commonData: any = {
      nombre_contacto: body.nombre_contacto,
      email: body.email,
      telefono: body.telefono,
      pais: body.pais,
      direccion: body.direccion || null,
      ciudad: body.ciudad || null,
      tipo_contacto: tipo_contacto,
      empresa: body.empresa || null,
      tipo_empresa: body.tipo_empresa || null,
      representante_legal: body.representante_legal || null,
      tax_id: body.tax_id || null,
      puesto: body.puesto || null,
      tipo_tenencia: body.tipo_tenencia || null,
      sitio_web: body.sitio_web || null,
      direccion_fiscal: body.direccion_fiscal || null,
      tiene_permisos: body.tiene_permisos !== undefined ? body.tiene_permisos : false,
      permite_instalacion: body.permite_instalacion !== undefined ? body.permite_instalacion : false,
      updated_at: new Date().toISOString()
    };

    let resultOwner;

    if (existingOwner) {
      // UPDATE - Usuario ya es owner, actualizar datos
      console.log(`🔄 [WEB OWNERS/COMPLETE] Usuario ya es owner (ID: ${existingOwner.id}). Actualizando...`);

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('owners')
        .update(commonData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [WEB OWNERS/COMPLETE] Update Failed:', updateError);
        return NextResponse.json(
          { 
            error: updateError.message || 'Error al actualizar owner',
            details: updateError
          },
          { status: 500 }
        );
      }
      resultOwner = updated;

    } else {
      // INSERT - Crear nuevo registro owner
      console.log('🆕 [WEB OWNERS/COMPLETE] Creando nuevo registro owner en Supabase...');

      const insertData = {
        ...commonData,
        user_id: userId, // FK a usuarios.id - debe existir
        created_at: new Date().toISOString()
      };

      console.log('📤 [WEB OWNERS/COMPLETE] Datos a insertar:', {
        user_id: insertData.user_id,
        email: insertData.email,
        tipo_contacto: insertData.tipo_contacto,
        has_empresa: !!insertData.empresa
      });

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('owners')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [WEB OWNERS/COMPLETE] Insert Failed:', insertError);
        console.error('❌ [WEB OWNERS/COMPLETE] Error code:', insertError.code);
        console.error('❌ [WEB OWNERS/COMPLETE] Error message:', insertError.message);
        console.error('❌ [WEB OWNERS/COMPLETE] Error details:', insertError.details);
        console.error('❌ [WEB OWNERS/COMPLETE] Error hint:', insertError.hint);
        
        // Mensaje de error más descriptivo para foreign key
        if (insertError.code === '23503' || insertError.message?.includes('foreign key')) {
          return NextResponse.json(
            { 
              error: 'El usuario no existe en la tabla usuarios. Por favor, inicia sesión nuevamente.',
              details: `user_id: ${userId}, error: ${insertError.message}`
            },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { 
            error: insertError.message || 'Error al crear owner',
            details: insertError
          },
          { status: 500 }
        );
      }
      resultOwner = inserted;
    }

    // Actualizar rol del usuario a owner
    console.log('🔄 [WEB OWNERS/COMPLETE] Actualizando rol a owner...');
    try {
      // Obtener rol_id de 'owner'
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('nombre', 'owner')
        .maybeSingle();

      if (roleData) {
        const { error: updateRoleError } = await supabaseAdmin
          .from('usuarios')
          .update({ rol_id: roleData.id, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (updateRoleError) {
          console.error('⚠️ [WEB OWNERS/COMPLETE] Error actualizando rol (no crítico):', updateRoleError);
        } else {
          console.log('✅ [WEB OWNERS/COMPLETE] Rol actualizado a owner');
        }
      } else {
        console.warn('⚠️ [WEB OWNERS/COMPLETE] Rol "owner" no encontrado en tabla roles');
      }
    } catch (error) {
      console.error('⚠️ [WEB OWNERS/COMPLETE] Error actualizando rol (no crítico):', error);
      // No fallar si no se puede actualizar el rol
    }

    console.log('✅ [WEB OWNERS/COMPLETE] Owner creado/actualizado exitosamente en Supabase');
    return NextResponse.json({
      ...resultOwner,
      user_id: userId
    }, { status: existingOwner ? 200 : 201 });

  } catch (error: any) {
    console.error('🔥 [WEB OWNERS/COMPLETE] Error fatal:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

