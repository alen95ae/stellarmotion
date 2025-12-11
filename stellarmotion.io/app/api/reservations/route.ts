import { NextRequest, NextResponse } from 'next/server';
import { ReservationRequest, ReservationResponse } from '@/types/product';

// Forzar runtime Node.js para consistencia
export const runtime = 'nodejs';

// TODO: conectar a backend real
export async function POST(request: NextRequest) {
  try {
    const body: ReservationRequest = await request.json();
    
    // Validaciones básicas
    if (!body.productId || !body.start || !body.end) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que las fechas sean válidas
    const startDate = new Date(body.start);
    const endDate = new Date(body.end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Fechas inválidas' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la de inicio' },
        { status: 400 }
      );
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generar ID único para la reserva
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: ReservationResponse = {
      ok: true,
      reservationId
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
