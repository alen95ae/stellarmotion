import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const month = searchParams.get('month');

    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (clientId) {
      where.clientId = clientId;
    }

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
      
      where.issueDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const invoices = await prisma.invoice.findMany({
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
        reservation: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error al obtener las facturas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      reservationId,
      productId,
      amount,
      tax,
      dueDate,
      notes
    } = body;

    // Validar campos requeridos
    if (!clientId || !amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
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

    // Generar número de factura
    const currentYear = new Date().getFullYear();
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `FAC-${currentYear}-`
        }
      },
      orderBy: {
        number: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `FAC-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;

    // Calcular totales
    const taxAmount = tax || Math.round(amount * 0.13); // 13% IVA por defecto
    const totalAmount = amount + taxAmount;

    // Calcular fecha de vencimiento (30 días por defecto)
    const issueDate = new Date();
    const defaultDueDate = new Date(issueDate);
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    // Crear la factura
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId,
        reservationId: reservationId || null,
        productId: productId || null,
        amount,
        tax: taxAmount,
        totalAmount,
        issueDate,
        dueDate: dueDate ? new Date(dueDate) : defaultDueDate,
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
        reservation: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Error al crear la factura' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidDate, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de factura requerido' },
        { status: 400 }
      );
    }

    // Verificar que la factura existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateFields: any = { ...updateData };
    
    if (status) {
      updateFields.status = status.toUpperCase();
      
      // Si se marca como pagada, establecer fecha de pago
      if (status.toUpperCase() === 'PAID' && !existingInvoice.paidDate) {
        updateFields.paidDate = paidDate ? new Date(paidDate) : new Date();
      }
      
      // Si se cambia de pagada a otro estado, limpiar fecha de pago
      if (status.toUpperCase() !== 'PAID') {
        updateFields.paidDate = null;
      }
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateFields,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        reservation: {
          select: {
            id: true,
            startDate: true,
            endDate: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la factura' },
      { status: 500 }
    );
  }
}
