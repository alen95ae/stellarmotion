import { NextRequest, NextResponse } from 'next/server';
import { createOpportunity, getOpportunities } from '@/lib/crm/opportunities';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CreateOpportunityDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * GET /api/crm/opportunities
 * Obtener todas las oportunidades del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    
    const { searchParams } = new URL(req.url);
    const filters = {
      account_id: searchParams.get('account_id') || undefined,
      stage_id: searchParams.get('stage_id') || undefined,
      is_won: searchParams.get('is_won') === 'true' ? true : undefined,
      is_lost: searchParams.get('is_lost') === 'true' ? true : undefined,
    };
    
    const opportunities = await getOpportunities(userId, filters);
    
    return NextResponse.json({ opportunities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener oportunidades' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/opportunities
 * Crear una nueva oportunidad
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const body: CreateOpportunityDTO = await req.json();
    
    // Validaciones
    if (!body.account_id || !body.nombre || !body.importe_estimado) {
      return NextResponse.json(
        { error: 'account_id, nombre e importe_estimado son requeridos' },
        { status: 400 }
      );
    }
    
    const opportunity = await createOpportunity(userId, body);
    
    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear oportunidad' },
      { status: 500 }
    );
  }
}


