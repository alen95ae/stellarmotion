import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CRMAccount } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * GET /api/crm/accounts
 * Obtener todas las cuentas del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const supabase = getAdminSupabase();
    
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo');
    const pais = searchParams.get('pais');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('crm_accounts')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    if (pais) {
      query = query.eq('pais', pais);
    }
    
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data: accounts, error } = await query;
    
    if (error) {
      throw new Error(`Error al obtener cuentas: ${error.message}`);
    }
    
    return NextResponse.json({ accounts: accounts || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener cuentas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/accounts
 * Crear una nueva cuenta
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const supabase = getAdminSupabase();
    const body = await req.json();
    
    // Validaciones
    if (!body.nombre || !body.tipo || !body.ciudad || !body.pais) {
      return NextResponse.json(
        { error: 'nombre, tipo, ciudad y pais son requeridos' },
        { status: 400 }
      );
    }
    
    const accountData = {
      owner_id: userId,
      nombre: body.nombre.trim(),
      tipo: body.tipo,
      email: body.email?.trim() || null,
      telefono: body.telefono?.trim() || null,
      sitio_web: body.sitio_web?.trim() || null,
      direccion: body.direccion?.trim() || null,
      ciudad: body.ciudad.trim(),
      estado_provincia: body.estado_provincia?.trim() || null,
      pais: body.pais.trim(),
      codigo_postal: body.codigo_postal?.trim() || null,
      tax_id: body.tax_id?.trim() || null,
      razon_social: body.razon_social?.trim() || null,
      representante_legal: body.representante_legal?.trim() || null,
      soportes_asociados: body.soportes_asociados || null,
      es_propietario_soportes: body.es_propietario_soportes || false,
      es_anunciante: body.es_anunciante || false,
      es_agencia: body.es_agencia || false,
      notas: body.notas?.trim() || null,
      metadata: body.metadata || null,
      created_by: userId,
      updated_by: userId,
    };
    
    const { data: account, error } = await supabase
      .from('crm_accounts')
      .insert([accountData])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `Error al crear cuenta: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Crear entrada en timeline
    await supabase.rpc('create_timeline_entry', {
      p_owner_id: userId,
      p_entity_type: 'account',
      p_entity_id: account.id,
      p_evento_tipo: 'account_created',
      p_titulo: 'Cuenta creada',
      p_descripcion: `Cuenta "${body.nombre}" creada`,
      p_created_by: userId,
    });
    
    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear cuenta' },
      { status: 500 }
    );
  }
}


