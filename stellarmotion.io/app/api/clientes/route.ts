import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true
          }
        },
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Enriquecer datos con métricas calculadas
    const enrichedClients = clients.map(client => {
      const activeReservations = client.reservations.filter(
        r => r.status === 'ACTIVE' || r.status === 'CONFIRMED'
      ).length;
      
      const totalSpent = client.invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.totalAmount, 0);

      const lastReservation = client.reservations
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

      return {
        ...client,
        activeReservations,
        totalSpent,
        lastReservationDate: lastReservation?.startDate || null,
        status: activeReservations > 0 ? 'active' : 'inactive'
      };
    });

    // Filtrar por estado si se especifica
    const filteredClients = status 
      ? enrichedClients.filter(c => c.status === status)
      : enrichedClients;

    return NextResponse.json(filteredClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      address,
      taxId
    } = body;

    // Validar campos requeridos
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso
    const existingClient = await prisma.client.findUnique({
      where: { email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este email' },
        { status: 409 }
      );
    }

    // Crear el cliente
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        address: address || null,
        taxId: taxId || null
      },
      include: {
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true
          }
        },
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email !== existingClient.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Formato de email inválido' },
          { status: 400 }
        );
      }

      const clientWithEmail = await prisma.client.findUnique({
        where: { email }
      });

      if (clientWithEmail) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este email' },
          { status: 409 }
        );
      }

      updateData.email = email;
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        reservations: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true
          }
        },
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        reservations: true,
        invoices: true
      }
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no tenga reservas activas
    const activeReservations = existingClient.reservations.filter(
      r => r.status === 'ACTIVE' || r.status === 'CONFIRMED'
    );

    if (activeReservations.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con reservas activas' },
        { status: 409 }
      );
    }

    // Verificar que no tenga facturas pendientes
    const pendingInvoices = existingClient.invoices.filter(
      i => i.status === 'PENDING' || i.status === 'SENT'
    );

    if (pendingInvoices.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con facturas pendientes' },
        { status: 409 }
      );
    }

    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    );
  }
}
