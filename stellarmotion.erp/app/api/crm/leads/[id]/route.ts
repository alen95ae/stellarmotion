import { NextRequest, NextResponse } from 'next/server';
import { updateLead, deleteLead } from '@/lib/crm/leads';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CreateLeadDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * PATCH /api/crm/leads/[id]
 * Actualizar un lead
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest();
    const body: Partial<CreateLeadDTO> = await req.json();
    
    const lead = await updateLead(userId, params.id, body);
    
    return NextResponse.json({ lead }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/crm/leads/[id]
 * Eliminar un lead
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest();
    
    await deleteLead(userId, params.id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar lead' },
      { status: 500 }
    );
  }
}


