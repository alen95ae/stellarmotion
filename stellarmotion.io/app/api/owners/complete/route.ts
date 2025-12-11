import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase/admin';

// Forzar runtime Node.js para acceso completo a process.env
export const runtime = 'nodejs';

type OwnerBody = {
  user_id: string;
  email?: string;
  nombre_contacto?: string;
  telefono?: string;
  pais?: string;
  direccion?: string | null;
  ciudad?: string | null;
  tipo_contacto?: 'persona' | 'empresa' | 'agencia' | 'gobierno';
  tipo_owner?: 'persona' | 'empresa' | 'agencia' | 'gobierno';
  empresa?: string | null;
  tipo_empresa?: string | null;
  representante_legal?: string | null;
  tax_id?: string | null;
  puesto?: string | null;
  tipo_tenencia?: string | null;
  sitio_web?: string | null;
  direccion_fiscal?: string | null;
  tiene_permisos?: boolean;
  permite_instalacion?: boolean;
};

export async function POST(req: Request) {
  try {
    const body: OwnerBody = await req.json();
    console.log('📡 [WEB OWNERS/COMPLETE] Iniciando creación/actualización de owner (WEB → Supabase directo)');
    
    // ⚠️ LOGGING OBLIGATORIO PARA VERIFICAR ENV
    console.log('[ENV CHECK]', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLoaded: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    console.log('📡 [WEB OWNERS/COMPLETE] Variables de entorno:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      cwd: process.cwd(),
    });

    // Inicializar cliente Supabase Admin (validará variables de entorno)
    let supabase;
    try {
      supabase = getAdminSupabase();
      console.log('✅ [WEB OWNERS/COMPLETE] Cliente Supabase Admin inicializado correctamente');
    } catch (supabaseError: any) {
      console.error('❌ [WEB OWNERS/COMPLETE] Error inicializando Supabase Admin:', supabaseError);
      return NextResponse.json(
        { 
          error: 'Error de configuración del servidor',
          details: supabaseError.message || 'No se pudo inicializar el cliente Supabase'
        },
        { status: 500 }
      );
    }

    // Validar user_id
    if (!body.user_id || typeof body.user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_id es requerido y debe ser string' },
        { status: 400 }
      );
    }
    const userId = body.user_id.trim();

    // Validar tipo_contacto
    const tipo_contacto =
      body.tipo_contacto ||
      (body.tipo_owner === 'empresa' ? 'empresa' : body.tipo_owner) ||
      'persona';

    if (!['persona', 'empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
      return NextResponse.json(
        { error: `tipo_contacto inválido: ${tipo_contacto}. Debe ser persona, empresa, agencia o gobierno.` },
        { status: 400 }
      );
    }

    // Validaciones de campos requeridos
    if (tipo_contacto === 'persona') {
      if (!body.nombre_contacto || !body.email || !body.telefono || !body.pais) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' },
          { status: 400 }
        );
      }
    } else {
      if (!body.empresa) {
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

    // Verificar usuario - CRÍTICO para evitar error de foreign key
    console.log(`🔍 [WEB OWNERS/COMPLETE] Verificando usuario en Supabase: ${userId}`);
    console.log(`🔍 [WEB OWNERS/COMPLETE] Tipo de userId:`, typeof userId);
    console.log(`🔍 [WEB OWNERS/COMPLETE] userId length:`, userId.length);
    
    const { data: existingUser, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, nombre, rol_id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error('❌ [WEB OWNERS/COMPLETE] Error verificando usuario:', userError);
      console.error('❌ [WEB OWNERS/COMPLETE] Error code:', userError.code);
      console.error('❌ [WEB OWNERS/COMPLETE] Error message:', userError.message);
      return NextResponse.json({ 
        error: 'Error verificando usuario',
        details: userError.message 
      }, { status: 500 });
    }

    if (!existingUser) {
      console.error('❌ [WEB OWNERS/COMPLETE] Usuario NO encontrado en BD');
      console.error('❌ [WEB OWNERS/COMPLETE] userId buscado:', userId);
      console.error('❌ [WEB OWNERS/COMPLETE] Email del body:', body.email);
      
      // Intentar buscar por email para debug
      const { data: userByEmail } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('email', body.email?.toLowerCase()?.trim())
        .maybeSingle();
      
      if (userByEmail) {
        console.error('❌ [WEB OWNERS/COMPLETE] ¡Usuario encontrado por EMAIL pero con ID diferente!');
        console.error('❌ [WEB OWNERS/COMPLETE] ID correcto:', userByEmail.id);
        console.error('❌ [WEB OWNERS/COMPLETE] ID recibido:', userId);
        console.error('❌ [WEB OWNERS/COMPLETE] ¡El frontend está enviando un user_id INCORRECTO!');
        
        return NextResponse.json(
          { 
            error: `El user_id ${userId} no existe en la tabla usuarios.`,
            hint: `Usuario encontrado con email ${body.email} pero con ID diferente: ${userByEmail.id}`,
            correctUserId: userByEmail.id,
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `El user_id ${userId} no existe en la tabla usuarios.`,
          hint: 'El usuario no fue encontrado ni por ID ni por email. Verifica que el registro se completó correctamente.'
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ [WEB OWNERS/COMPLETE] Usuario encontrado en BD:`, {
      id: existingUser.id,
      email: existingUser.email,
      nombre: existingUser.nombre,
    });

    // Timestamp para created_at y updated_at
    const now = new Date().toISOString();

    // Verificar si ya existe owner
    const { data: existingOwner, error: ownerCheckError } = await supabase
      .from('owners')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (ownerCheckError && ownerCheckError.code !== 'PGRST116') {
      console.error('❌ [WEB OWNERS/COMPLETE] Error verificando owner:', ownerCheckError);
      return NextResponse.json({ error: 'Error verificando owner' }, { status: 500 });
    }

    let resultOwner;

    if (existingOwner) {
      // UPDATE - Owner ya existe
      console.log('🔄 [WEB OWNERS/COMPLETE] Actualizando owner existente...');
      console.log('🔄 [WEB OWNERS/COMPLETE] Owner ID:', existingOwner.id);
      console.log('🔄 [WEB OWNERS/COMPLETE] user_id:', userId);
      
      const updateData = {
        tipo_contacto,
        nombre_contacto: body.nombre_contacto || existingUser.nombre || body.email,
        email: body.email || existingUser.email,
        telefono: body.telefono || null,
        pais: body.pais || null,
        ciudad: body.ciudad || null,
        direccion: body.direccion || null,
        empresa: body.empresa || null,
        tipo_empresa: body.tipo_empresa || null,
        representante_legal: body.representante_legal || null,
        tax_id: body.tax_id || null,
        puesto: body.puesto || null,
        tipo_tenencia: body.tipo_tenencia || null,
        sitio_web: body.sitio_web || null,
        direccion_fiscal: body.direccion_fiscal || null,
        tiene_permisos: body.tiene_permisos ?? false,
        permite_instalacion: body.permite_instalacion ?? false,
        updated_at: now,
      };
      
      const { data: updated, error: updateError } = await supabase
        .from('owners')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [WEB OWNERS/COMPLETE] Error actualizando owner:', updateError);
        return NextResponse.json(
          { error: updateError.message || 'Error al actualizar owner', details: updateError },
          { status: 500 }
        );
      }
      
      console.log('✅ [WEB OWNERS/COMPLETE] Owner actualizado correctamente');
      resultOwner = updated;
    } else {
      // INSERT - Crear nuevo owner
      console.log('🆕 [WEB OWNERS/COMPLETE] Creando nuevo owner...');
      console.log('🆕 [WEB OWNERS/COMPLETE] user_id a insertar:', userId);
      
      // ⚠️ ESTRUCTURA EXPLÍCITA DEL INSERT - user_id SIEMPRE PRIMERO
      const insertData = {
        user_id: userId,                                              // ← OBLIGATORIO: Foreign key a usuarios
        tipo_contacto,                                                // ← Campo requerido
        nombre_contacto: body.nombre_contacto || existingUser.nombre || body.email,
        email: body.email || existingUser.email,
        telefono: body.telefono || null,
        pais: body.pais || null,
        ciudad: body.ciudad || null,
        direccion: body.direccion || null,
        empresa: body.empresa || null,
        tipo_empresa: body.tipo_empresa || null,
        representante_legal: body.representante_legal || null,
        tax_id: body.tax_id || null,
        puesto: body.puesto || null,
        tipo_tenencia: body.tipo_tenencia || null,
        sitio_web: body.sitio_web || null,
        direccion_fiscal: body.direccion_fiscal || null,
        tiene_permisos: body.tiene_permisos ?? false,
        permite_instalacion: body.permite_instalacion ?? false,
        created_at: now,
        updated_at: now,
      };
      
      console.log('🆕 [WEB OWNERS/COMPLETE] Datos a insertar:', {
        user_id: insertData.user_id,
        tipo_contacto: insertData.tipo_contacto,
        email: insertData.email,
        camposTotales: Object.keys(insertData).length,
      });

      const { data: inserted, error: insertError } = await supabase
        .from('owners')
        .insert(insertData)  // ← Sin array, objeto directo
        .select()
        .single();

      if (insertError) {
        console.error('❌ [WEB OWNERS/COMPLETE] Error insertando owner:', insertError);
        console.error('❌ [WEB OWNERS/COMPLETE] Error code:', insertError.code);
        console.error('❌ [WEB OWNERS/COMPLETE] Error message:', insertError.message);
        console.error('❌ [WEB OWNERS/COMPLETE] Error details:', insertError.details);
        console.error('❌ [WEB OWNERS/COMPLETE] user_id enviado:', userId);
        
        // Mensaje específico para foreign key
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
          { error: insertError.message || 'Error al crear owner', details: insertError },
          { status: 500 }
        );
      }
      
      console.log('✅ [WEB OWNERS/COMPLETE] Owner insertado correctamente:', inserted.id);
      resultOwner = inserted;
    }

    // Actualizar rol a owner
    try {
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', 'owner')
        .maybeSingle();

      if (roleData) {
        const { error: roleError } = await supabase
          .from('usuarios')
          .update({ rol_id: roleData.id, updated_at: now })
          .eq('id', userId);

        if (roleError) {
          console.warn('⚠️ [WEB OWNERS/COMPLETE] No se pudo actualizar rol a owner:', roleError);
        }
      } else {
        console.warn('⚠️ [WEB OWNERS/COMPLETE] Rol "owner" no encontrado en tabla roles');
      }
    } catch (e) {
      console.warn('⚠️ [WEB OWNERS/COMPLETE] Error no crítico al actualizar rol:', e);
    }

    console.log('✅ [WEB OWNERS/COMPLETE] Owner procesado correctamente');
    return NextResponse.json(
      { ...resultOwner, user_id: userId },
      { status: existingOwner ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('🔥 [WEB OWNERS/COMPLETE] Error fatal:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

