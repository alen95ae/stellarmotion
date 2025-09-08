import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const productId = searchParams.get('productId');
    const assignedTo = searchParams.get('assignedTo');

    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (priority) {
      where.priority = priority.toUpperCase();
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            dimensions: true,
            city: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener los tickets de mantenimiento' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      title,
      description,
      priority,
      assignedTo
    } = body;

    // Validar campos requeridos
    if (!productId || !title || !description) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
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

    // Crear el ticket
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        productId,
        title,
        description,
        priority: priority?.toUpperCase() || 'MEDIUM',
        assignedTo: assignedTo || null,
        status: 'PENDING'
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            dimensions: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear el ticket de mantenimiento' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedTo, resolvedAt, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de ticket requerido' },
        { status: 400 }
      );
    }

    // Verificar que el ticket existe
    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateFields: any = { ...updateData };
    
    if (status) {
      updateFields.status = status.toUpperCase();
      
      // Si se marca como resuelto, establecer fecha de resolución
      if (status.toUpperCase() === 'RESOLVED' && !existingTicket.resolvedAt) {
        updateFields.resolvedAt = resolvedAt ? new Date(resolvedAt) : new Date();
      }
      
      // Si se cambia de resuelto a otro estado, limpiar fecha de resolución
      if (status.toUpperCase() !== 'RESOLVED') {
        updateFields.resolvedAt = null;
      }
    }
    
    if (assignedTo !== undefined) {
      updateFields.assignedTo = assignedTo;
    }

    const updatedTicket = await prisma.maintenanceTicket.update({
      where: { id },
      data: updateFields,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            title: true,
            dimensions: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating maintenance ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el ticket' },
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
        { error: 'ID de ticket requerido' },
        { status: 400 }
      );
    }

    // Verificar que el ticket existe
    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    await prisma.maintenanceTicket.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting maintenance ticket:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el ticket' },
      { status: 500 }
    );
  }
}
