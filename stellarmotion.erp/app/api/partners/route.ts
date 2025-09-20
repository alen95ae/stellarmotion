import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/partners - Lista todos los partners (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden ver todos los partners
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const country = searchParams.get('country')

    // Construir filtros
    const where: any = {}
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } }
      ]
    }
    
    if (country) {
      where.country = country
    }

    const partners = await prisma.partner.findMany({
      where,
      include: {
        _count: {
          select: {
            supports: true,
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/partners - Crear nuevo partner (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden crear partners
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

    // Verificar si el email ya existe
    const existingPartner = await prisma.partner.findUnique({
      where: { email }
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Ya existe un partner con este email' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        email,
        phone: phone || null,
        companyName: companyName || null,
        country,
        city: city || null
      }
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

