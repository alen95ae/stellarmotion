import { NextRequest, NextResponse } from 'next/server';
import { convertLead } from '@/lib/crm/convert-lead';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { ConvertLeadDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * POST /api/crm/leads/[id]/convert
 * Convertir un lead en cuenta + contacto + oportunidad
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest();
    const body: Omit<ConvertLeadDTO, 'lead_id'> = await req.json();
    
    // Validaciones
    if (!body.account_name || !body.account_tipo || !body.contact_nombre) {
      return NextResponse.json(
        { error: 'account_name, account_tipo y contact_nombre son requeridos' },
        { status: 400 }
      );
    }
    
    const result = await convertLead(userId, {
      lead_id: params.id,
      ...body,
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al convertir lead' },
      { status: 500 }
    );
  }
}


