import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/crm/timeline';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CRMTimelineEntityType } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * GET /api/crm/timeline?entity_type=lead&entity_id=xxx
 * Obtener timeline de una entidad
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entity_type') as CRMTimelineEntityType;
    const entityId = searchParams.get('entity_id');
    
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type y entity_id son requeridos' },
        { status: 400 }
      );
    }
    
    const timeline = await getTimeline(userId, entityType, entityId);
    
    return NextResponse.json({ timeline }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener timeline' },
      { status: 500 }
    );
  }
}


