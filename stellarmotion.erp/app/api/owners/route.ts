import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
      const { data: usuario } = await supabaseAdmin
        .from('usuarios')
        .select('id, email, contacto_id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (!usuario?.contacto_id) {
        return withCors(NextResponse.json([]));
      }

      const { data: contacto, error } = await supabaseAdmin
        .from('contactos')
        .select('*')
        .eq('id', usuario.contacto_id)
        .contains('roles', ['owner'])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[API owners GET] error:', error.message);
        return withCors(NextResponse.json({ error: 'Error al buscar owner' }, { status: 500 }));
      }

      if (!contacto) {
        return withCors(NextResponse.json([]));
      }

      return withCors(NextResponse.json([{
        id: contacto.id,
        user_id: usuario.id,
        email: usuario.email,
        nombre_contacto: contacto.nombre || contacto.razon_social,
        empresa: contacto.razon_social,
        telefono: contacto.telefono,
        pais: contacto.pais,
        ciudad: contacto.ciudad,
        direccion: contacto.direccion,
        nif: contacto.nif,
        tipo_contacto: contacto.tipo_entidad,
        tiene_permisos: contacto.tiene_permisos,
        permite_instalacion: contacto.permite_instalacion,
        representante_legal: contacto.representante_legal,
        puesto: contacto.puesto,
      }]));
    }

    return withCors(NextResponse.json({ error: 'Email parameter is required' }, { status: 400 }));
  } catch (error) {
    console.error('[API owners GET] error:', error);
    return withCors(NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('[API owners POST] body:', JSON.stringify(data, null, 2));

    const tipo_entidad = data.tipo_contacto === 'persona' ? 'persona' : 'empresa';

    if (tipo_entidad === 'persona') {
      if (!data.nombre_contacto || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json({ error: 'Faltan campos requeridos: nombre_contacto, email, telefono, pais' }, { status: 400 }));
      }
    } else {
      if (!data.empresa || !data.nit || !data.email || !data.telefono || !data.pais) {
        return withCors(NextResponse.json({ error: 'Faltan campos requeridos: empresa, nit, email, telefono, pais' }, { status: 400 }));
      }
    }

    const isExistingUser = !!data.user_id;
    if (!isExistingUser && !data.password) {
      return withCors(NextResponse.json({ error: 'Falta campo requerido: password' }, { status: 400 }));
    }

    let userId: string;

    if (isExistingUser) {
      userId = data.user_id;
      const existingUser = await getUserByIdSupabase(userId);
      if (!existingUser) {
        return withCors(NextResponse.json({ error: 'El user_id proporcionado no es válido' }, { status: 400 }));
      }

      if (existingUser.contacto_id) {
        const { data: existingContacto } = await supabaseAdmin
          .from('contactos')
          .select('id, roles')
          .eq('id', existingUser.contacto_id)
          .maybeSingle();

        if (existingContacto) {
          const currentRoles = Array.isArray(existingContacto.roles) ? existingContacto.roles : [];
          const newRoles = Array.from(new Set([...currentRoles, 'owner']));

          const contactoUpdate: Record<string, unknown> = {
            roles: newRoles,
            nombre: data.nombre_contacto || undefined,
            razon_social: data.empresa || data.nombre_contacto || undefined,
            telefono: data.telefono || undefined,
            pais: data.pais || undefined,
            ciudad: data.ciudad || undefined,
            direccion: data.direccion || undefined,
            nif: data.nit || undefined,
            sitio_web: data.sitio_web || undefined,
            tipo_entidad: tipo_entidad,
            tiene_permisos: data.tiene_permisos ?? false,
            permite_instalacion: data.permite_instalacion ?? false,
            representante_legal: data.representante_legal || undefined,
            puesto: data.puesto || undefined,
            updated_at: new Date().toISOString(),
          };

          const { data: updated, error: upErr } = await supabaseAdmin
            .from('contactos')
            .update(contactoUpdate)
            .eq('id', existingUser.contacto_id)
            .select()
            .single();

          if (upErr) {
            console.error('[API owners POST] update contacto error:', upErr.message);
            return withCors(NextResponse.json({ error: upErr.message }, { status: 500 }));
          }

          try { await updateUserRoleSupabase(userId, 'owner'); } catch {}

          return withCors(NextResponse.json({ ...updated, user_id: userId }, { status: 200 }));
        }
      }

      try { await updateUserRoleSupabase(userId, 'owner'); } catch {}
    } else {
      const existingUser = await findUserByEmail(data.email);
      if (existingUser) {
        return withCors(NextResponse.json({ error: 'Este email ya está registrado.' }, { status: 409 }));
      }
      const newUser = await createUserWithRole(data.email, data.password, data.nombre_contacto, 'owner');
      userId = newUser.id;
    }

    const emailArr = data.email ? [data.email.trim()] : [];
    const contactoInsert: Record<string, unknown> = {
      user_id: userId,
      roles: ['owner'],
      tipo_entidad: tipo_entidad,
      nombre: data.nombre_contacto?.trim() || null,
      razon_social: data.empresa?.trim() || data.nombre_contacto?.trim() || 'Sin nombre',
      nif: data.nit?.trim() || null,
      email: emailArr,
      telefono: data.telefono?.trim() || null,
      direccion: data.direccion?.trim() || null,
      ciudad: data.ciudad?.trim() || null,
      pais: data.pais?.trim() || null,
      sitio_web: data.sitio_web?.trim() || null,
      origen: 'web',
      tiene_permisos: data.tiene_permisos ?? false,
      permite_instalacion: data.permite_instalacion ?? false,
      representante_legal: data.representante_legal?.trim() || null,
      puesto: data.puesto?.trim() || null,
    };

    const { data: contacto, error: cErr } = await supabaseAdmin
      .from('contactos')
      .insert(contactoInsert)
      .select()
      .single();

    if (cErr) {
      console.error('[API owners POST] insert contacto error:', cErr.message);
      if (!isExistingUser) {
        await supabaseAdmin.from('usuarios').delete().eq('id', userId).catch(() => {});
      }
      return withCors(NextResponse.json({ error: cErr.message }, { status: 500 }));
    }

    await supabaseAdmin
      .from('usuarios')
      .update({ contacto_id: contacto.id })
      .eq('id', userId);

    return withCors(NextResponse.json({ ...contacto, user_id: userId }, { status: 201 }));
  } catch (error) {
    console.error('[API owners POST] error:', error);
    return withCors(NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 }));
  }
}
