import { NextRequest, NextResponse } from 'next/server';
import { updateOpportunityStage } from '@/lib/crm/opportunities';
import { handleWonOpportunity } from '@/lib/crm/automations';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { UpdateOpportunityStageDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * PATCH /api/crm/opportunities/[id]/stage
 * Actualizar etapa de una oportunidad (drag & drop en pipeline)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest();
    const body: UpdateOpportunityStageDTO = await req.json();
    
    if (!body.stage_id) {
      return NextResponse.json(
        { error: 'stage_id es requerido' },
        { status: 400 }
      );
    }
    
    const opportunity = await updateOpportunityStage(userId, {
      opportunity_id: params.id,
      ...body,
    });
    
    // Si se ganó, ejecutar automatización
    if (opportunity.is_won) {
      await handleWonOpportunity(userId, opportunity);
    }
    
    return NextResponse.json({ opportunity }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar etapa' },
      { status: 500 }
    );
  }
}


