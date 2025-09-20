import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/partners/[id] - Obtener partner específico con soportes y usuarios
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden ver cualquier partner
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        supports: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            status: true,
            city: true,
            country: true,
            priceMonth: true,
            imageUrl: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 })
    }

    return NextResponse.json(partner)
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/partners/[id] - Actualizar partner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden actualizar partners
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, companyName, country, city } = body

    // Validaciones
    if (!name || !email || !country) {
      return NextResponse.json(
        { error: 'Nombre, email y país son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el partner existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id: params.id }
    })

    if (!existingPartner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 })
    }

    // Verificar si el email ya existe en otro partner
    const emailConflict = await prisma.partner.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (emailConflict) {
      return NextResponse.json(
        { error: 'Ya existe otro partner con este email' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone: phone || null,
        companyName: companyName || null,
        country,
        city: city || null
      }
    })

    return NextResponse.json(partner)
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[id] - Eliminar partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden eliminar partners
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verificar si el partner existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            supports: true,
            users: true
          }
        }
      }
    })

    if (!existingPartner) {
      return NextResponse.json({ error: 'Partner no encontrado' }, { status: 404 })
    }

    // Verificar si tiene soportes o usuarios asociados
    if (existingPartner._count.supports > 0 || existingPartner._count.users > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el partner porque tiene soportes o usuarios asociados',
          details: {
            supports: existingPartner._count.supports,
            users: existingPartner._count.users
          }
        },
        { status: 400 }
      )
    }

    await prisma.partner.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Partner eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

