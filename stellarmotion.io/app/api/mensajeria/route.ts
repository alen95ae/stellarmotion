import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Error al obtener los mensajes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      content
    } = body;

    // Validar campos requeridos
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de mensaje
    const validTypes = ['RESERVATION', 'INVOICE', 'MAINTENANCE', 'SYSTEM'];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { error: 'Tipo de mensaje inválido' },
        { status: 400 }
      );
    }

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        type: type.toUpperCase(),
        title,
        content,
        isRead: false
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Error al crear el mensaje' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de mensaje requerido' },
        { status: 400 }
      );
    }

    // Verificar que el mensaje existe
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateFields: any = { ...updateData };
    
    if (isRead !== undefined) {
      updateFields.isRead = isRead;
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: updateFields
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el mensaje' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const deleteRead = searchParams.get('deleteRead');

    if (deleteRead === 'true') {
      // Eliminar todos los mensajes leídos
      await prisma.message.deleteMany({
        where: {
          isRead: true
        }
      });

      return NextResponse.json({ message: 'Mensajes leídos eliminados exitosamente' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID de mensaje requerido' },
        { status: 400 }
      );
    }

    // Verificar que el mensaje existe
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    await prisma.message.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el mensaje' },
      { status: 500 }
    );
  }
}
