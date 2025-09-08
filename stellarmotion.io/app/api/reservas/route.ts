import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const productId = searchParams.get('productId');

    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (clientId) {
      where.clientId = clientId;
    }
    
    if (productId) {
      where.productId = productId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            dimensions: true,
            pricePerMonth: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Error al obtener las reservas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      productId,
      startDate,
      endDate,
      totalAmount,
      notes
    } = body;

    // Validar campos requeridos
    if (!clientId || !productId || !startDate || !endDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar que las fechas sean válidas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar disponibilidad del producto en las fechas solicitadas
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        productId,
        status: {
          in: ['CONFIRMED', 'ACTIVE']
        },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ]
      }
    });

    if (conflictingReservations.length > 0) {
      return NextResponse.json(
        { error: 'El producto no está disponible en las fechas solicitadas' },
        { status: 409 }
      );
    }

    // Crear la reserva
    const reservation = await prisma.reservation.create({
      data: {
        clientId,
        productId,
        startDate: start,
        endDate: end,
        totalAmount,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            dimensions: true,
            pricePerMonth: true
          }
        }
      }
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Error al crear la reserva' },
      { status: 500 }
    );
  }
}
