import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';

export const runtime = 'nodejs';

/**
 * GET /api/crm/pipeline/stages
 * Obtener todas las etapas del pipeline del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const supabase = getAdminSupabase();
    
    const { data: stages, error } = await supabase
      .from('crm_pipeline_stages')
      .select('*')
      .eq('owner_id', userId)
      .order('orden', { ascending: true });
    
    if (error) {
      throw new Error(`Error al obtener etapas: ${error.message}`);
    }
    
    return NextResponse.json({ stages: stages || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener etapas' },
      { status: 500 }
    );
  }
}


