import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { addTimelineEntry } from '@/lib/crm/timeline';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CreateActivityDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * GET /api/crm/activities
 * Obtener actividades del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const supabase = getAdminSupabase();
    
    const { searchParams } = new URL(req.url);
    const lead_id = searchParams.get('lead_id');
    const account_id = searchParams.get('account_id');
    const opportunity_id = searchParams.get('opportunity_id');
    const contact_id = searchParams.get('contact_id');
    const tipo = searchParams.get('tipo');
    const completada = searchParams.get('completada');
    
    let query = supabase
      .from('crm_activities')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (lead_id) query = query.eq('lead_id', lead_id);
    if (account_id) query = query.eq('account_id', account_id);
    if (opportunity_id) query = query.eq('opportunity_id', opportunity_id);
    if (contact_id) query = query.eq('contact_id', contact_id);
    if (tipo) query = query.eq('tipo', tipo);
    if (completada !== null) query = query.eq('completada', completada === 'true');
    
    const { data: activities, error } = await query;
    
    if (error) {
      throw new Error(`Error al obtener actividades: ${error.message}`);
    }
    
    return NextResponse.json({ activities: activities || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/activities
 * Crear una nueva actividad
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const supabase = getAdminSupabase();
    const body: CreateActivityDTO = await req.json();
    
    // Validación: al menos una relación debe existir
    if (!body.lead_id && !body.account_id && !body.opportunity_id && !body.contact_id) {
      return NextResponse.json(
        { error: 'Al menos una relación (lead_id, account_id, opportunity_id, contact_id) es requerida' },
        { status: 400 }
      );
    }
    
    if (!body.tipo || !body.titulo) {
      return NextResponse.json(
        { error: 'tipo y titulo son requeridos' },
        { status: 400 }
      );
    }
    
    const activityData = {
      owner_id: userId,
      lead_id: body.lead_id || null,
      account_id: body.account_id || null,
      opportunity_id: body.opportunity_id || null,
      contact_id: body.contact_id || null,
      tipo: body.tipo,
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() || null,
      fecha_inicio: body.fecha_inicio || null,
      fecha_fin: body.fecha_fin || null,
      fecha_recordatorio: body.fecha_recordatorio || null,
      completada: false,
      metadata: body.metadata || null,
      created_by: userId,
      updated_by: userId,
    };
    
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .insert([activityData])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `Error al crear actividad: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Crear entrada en timeline según la entidad relacionada
    if (body.lead_id) {
      await addTimelineEntry(
        userId,
        'lead',
        body.lead_id,
        body.tipo,
        body.titulo,
        body.descripcion,
        { activity_id: activity.id, ...body.metadata },
        userId
      );
    }
    if (body.account_id) {
      await addTimelineEntry(
        userId,
        'account',
        body.account_id,
        body.tipo,
        body.titulo,
        body.descripcion,
        { activity_id: activity.id, ...body.metadata },
        userId
      );
    }
    if (body.opportunity_id) {
      await addTimelineEntry(
        userId,
        'opportunity',
        body.opportunity_id,
        body.tipo,
        body.titulo,
        body.descripcion,
        { activity_id: activity.id, ...body.metadata },
        userId
      );
    }
    if (body.contact_id) {
      await addTimelineEntry(
        userId,
        'contact',
        body.contact_id,
        body.tipo,
        body.titulo,
        body.descripcion,
        { activity_id: activity.id, ...body.metadata },
        userId
      );
    }
    
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear actividad' },
      { status: 500 }
    );
  }
}


