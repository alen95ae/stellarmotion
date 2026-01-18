import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession, signSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type OwnerCompleteBody = {
  tipo_contacto?: 'persona' | 'empresa' | 'gobierno';
  empresa?: string;
  tipo_empresa?: string;
  representante_legal?: string;
  tax_id?: string;
  puesto?: string;
  sitio_web?: string;
  direccion?: string;
  direccion_fiscal?: string;
  ciudad?: string;
  tiene_permisos?: boolean;
  permite_instalacion?: boolean;
};

export async function POST(req: Request) {
  try {
    const body: OwnerCompleteBody = await req.json();

    // Verificar JWT
    const cookieStore = await cookies();
    const st = cookieStore.get("st_session");

    if (!st || !st.value) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifySession(st.value);
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      );
    }

    const userId = payload.sub;

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Inicializar Supabase
    const supabase = getAdminSupabase();

    // Verificar que el usuario existe
    const { data: existingUser, error: userError } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { error: 'Error verificando usuario', details: userError.message },
        { status: 500 }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const now = new Date().toISOString();
    const updateData: any = {
      updated_at: now,
      rol_id: null, // Se actualizará después con el rol 'owner'
    };

    // Campos opcionales del formulario
    if (body.tipo_contacto) updateData.tipo_contacto = body.tipo_contacto;
    if (body.empresa) updateData.empresa = body.empresa.trim();
    if (body.tipo_empresa) updateData.tipo_empresa = body.tipo_empresa.trim();
    if (body.representante_legal) updateData.representante_legal = body.representante_legal.trim();
    if (body.tax_id) updateData.tax_id = body.tax_id.trim();
    if (body.puesto) updateData.puesto = body.puesto.trim();
    if (body.sitio_web) updateData.sitio_web = body.sitio_web.trim();
    if (body.direccion) updateData.direccion = body.direccion.trim();
    if (body.direccion_fiscal) updateData.direccion_fiscal = body.direccion_fiscal.trim();
    if (body.ciudad) updateData.ciudad = body.ciudad.trim();
    if (body.tiene_permisos !== undefined) updateData.tiene_permisos = body.tiene_permisos;
    if (body.permite_instalacion !== undefined) updateData.permite_instalacion = body.permite_instalacion;

    // Obtener rol_id de 'owner'
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'owner')
      .maybeSingle();

    if (roleData) {
      updateData.rol_id = roleData.id;
    }

    // Actualizar usuario
    const { error: updateError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario', details: updateError.message },
        { status: 500 }
      );
    }

    // Crear nuevo JWT con role=owner
    const newToken = await signSession({
      id: userId,
      email: payload.email,
      role: 'owner',
      name: payload.name || ''
    });

    // Crear respuesta
    const response = NextResponse.json({
      success: true
    }, { status: 200 });

    // Guardar nueva cookie con role=owner
    setSessionCookie(response, newToken);

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}


