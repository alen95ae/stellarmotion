import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeads } from '@/lib/crm/leads';
import { getUserIdFromRequest } from '@/lib/crm/auth-helper';
import type { CreateLeadDTO } from '@/types/crm';

export const runtime = 'nodejs';

/**
 * GET /api/crm/leads
 * Obtener todos los leads del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    const leads = await getLeads(userId, filters);
    
    return NextResponse.json({ leads }, { status: 200 });
  } catch (error: any) {
    // Si es error de autenticación, devolver 401
    if (error.message === 'No autorizado' || error.message === 'Sesión inválida') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Error al obtener leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/leads
 * Crear un nuevo lead
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest();
    const body: CreateLeadDTO = await req.json();
    
    // Validaciones básicas
    if (!body.nombre || !body.email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }
    
    const lead = await createLead(userId, body);
    
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear lead' },
      { status: 500 }
    );
  }
}


