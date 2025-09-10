import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const categories = [
    { slug: 'vallas', label: 'Vallas', iconKey: 'valla' },
    { slug: 'pantallas', label: 'Pantallas', iconKey: 'led' },
    { slug: 'mupis', label: 'Mupis', iconKey: 'mupi' },
    { slug: 'displays', label: 'Displays', iconKey: 'display' },
    { slug: 'paradas', label: 'Paradas de bus', iconKey: 'parada' },
    { slug: 'letreros', label: 'Letreros', iconKey: 'letrero' },
    { slug: 'carteleras', label: 'Carteleras', iconKey: 'cartelera' },
    { slug: 'murales', label: 'Murales', iconKey: 'mural' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('✅ Categories created')

  // Get category IDs for products
  const vallaCategory = await prisma.category.findUnique({ where: { slug: 'vallas' } })
  const pantallaCategory = await prisma.category.findUnique({ where: { slug: 'pantallas' } })
  const mupiCategory = await prisma.category.findUnique({ where: { slug: 'mupis' } })

  if (!vallaCategory || !pantallaCategory || !mupiCategory) {
    throw new Error('Categories not found')
  }

  // Create sample products
  const products = [
    {
      slug: 'valla-centrica',
      title: 'Valla en zona céntrica',
      city: 'La Paz',
      country: 'Bolivia',
      dimensions: '10×4 m',
      dailyImpressions: 44000,
      type: 'Bipolar',
      lighting: true,
      tags: ['centrica', 'alto-trafico'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -16.4897,
      lng: -68.1193,
      pricePerMonth: 850,
      printingCost: 150,
      rating: 4.8,
      reviewsCount: 12,
      shortDescription: 'Valla publicitaria en zona de alto tráfico',
      description: 'Excelente ubicación en zona céntrica con alto tráfico vehicular y peatonal',
      featured: true,
      categoryId: vallaCategory.id,
    },
    {
      slug: 'pantalla-led-premium',
      title: 'Pantalla LED premium',
      city: 'Santa Cruz',
      country: 'Bolivia',
      dimensions: '8×6 m',
      dailyImpressions: 65000,
      type: 'Digital',
      lighting: true,
      tags: ['led', 'digital', 'premium'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -17.7863,
      lng: -63.1812,
      pricePerMonth: 1200,
      printingCost: 0,
      rating: 4.9,
      reviewsCount: 8,
      shortDescription: 'Pantalla LED digital de alta resolución',
      description: 'Pantalla LED de última generación con resolución 4K y sistema de iluminación automática',
      featured: true,
      categoryId: pantallaCategory.id,
    },
    {
      slug: 'mupi-avenida',
      title: 'MUPI en avenida principal',
      city: 'Cochabamba',
      country: 'Bolivia',
      dimensions: '1.2×1.8 m',
      dailyImpressions: 28000,
      type: 'Unipolar',
      lighting: true,
      tags: ['mupi', 'avenida', 'peatonal'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -17.3895,
      lng: -66.1568,
      pricePerMonth: 450,
      printingCost: 80,
      rating: 4.6,
      reviewsCount: 15,
      shortDescription: 'MUPI en avenida de alto tráfico peatonal',
      description: 'MUPI estratégicamente ubicado en avenida principal con alto tráfico peatonal',
      featured: true,
      categoryId: mupiCategory.id,
    },
    {
      slug: 'pantalla-autopista',
      title: 'Pantalla autopista norte',
      city: 'La Paz',
      country: 'Bolivia',
      dimensions: '12×8 m',
      dailyImpressions: 95000,
      type: 'Digital',
      lighting: true,
      tags: ['autopista', 'alto-trafico', 'digital'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -16.4897,
      lng: -68.1193,
      pricePerMonth: 1800,
      printingCost: 0,
      rating: 5.0,
      reviewsCount: 6,
      shortDescription: 'Pantalla digital en autopista de alto tráfico',
      description: 'Pantalla digital de gran formato ubicada en autopista con tráfico constante',
      featured: true,
      categoryId: pantallaCategory.id,
    },
    {
      slug: 'totem-centro-comercial',
      title: 'Totem centro comercial',
      city: 'Santa Cruz',
      country: 'Bolivia',
      dimensions: '2×4 m',
      dailyImpressions: 35000,
      type: 'Unipolar',
      lighting: false,
      tags: ['totem', 'centro-comercial', 'interior'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -17.7863,
      lng: -63.1812,
      pricePerMonth: 650,
      printingCost: 120,
      rating: 4.7,
      reviewsCount: 9,
      shortDescription: 'Totem publicitario en centro comercial',
      description: 'Totem publicitario ubicado en centro comercial con alto tráfico de compradores',
      featured: false,
      categoryId: vallaCategory.id,
    },
    {
      slug: 'valla-carretera',
      title: 'Valla en carretera principal',
      city: 'Cochabamba',
      country: 'Bolivia',
      dimensions: '15×5 m',
      dailyImpressions: 75000,
      type: 'Bipolar',
      lighting: true,
      tags: ['carretera', 'bipolar', 'iluminada'],
      images: ['/placeholder.svg?height=400&width=600'],
      lat: -17.3895,
      lng: -66.1568,
      pricePerMonth: 1100,
      printingCost: 200,
      rating: 4.5,
      reviewsCount: 11,
      shortDescription: 'Valla bipolar en carretera principal',
      description: 'Valla publicitaria bipolar ubicada en carretera principal con iluminación nocturna',
      featured: false,
      categoryId: vallaCategory.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        tags: JSON.stringify(product.tags),
        images: JSON.stringify(product.images),
      },
    })
  }

  console.log('✅ Products created')

  // Create sample clients
  const clients = [
    {
      name: 'Coca Cola Bolivia',
      email: 'contacto@cocacola.bo',
      phone: '+591 2 2345678',
      company: 'The Coca-Cola Company',
      address: 'Av. Arce 2612, La Paz',
      taxId: '1023456789012'
    },
    {
      name: 'María González',
      email: 'maria.gonzalez@banconacional.bo',
      phone: '+591 2 2876543',
      company: 'Banco Nacional de Bolivia',
      address: 'Calle Comercio 1456, La Paz',
      taxId: '2034567890123'
    },
    {
      name: 'Carlos Mendoza',
      email: 'cmendoza@ketal.bo',
      phone: '+591 2 2654321',
      company: 'Supermercados Ketal',
      address: 'Av. 6 de Agosto 2055, La Paz',
      taxId: '3045678901234'
    }
  ]

  const createdClients = []
  for (const client of clients) {
    const createdClient = await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: client,
    })
    createdClients.push(createdClient)
  }

  console.log('✅ Clients created')

  // Create sample reservations
  const sampleProducts = await prisma.product.findMany({ take: 3 })
  
  if (sampleProducts.length > 0 && createdClients.length > 0) {
    const reservations = [
      {
        clientId: createdClients[0].id,
        productId: sampleProducts[0].id,
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-02-10'),
        totalAmount: 8500,
        status: 'CONFIRMED',
        notes: 'Campaña de verano'
      },
      {
        clientId: createdClients[1].id,
        productId: sampleProducts[1].id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-15'),
        totalAmount: 12000,
        status: 'ACTIVE',
        notes: 'Promoción de servicios bancarios'
      },
      {
        clientId: createdClients[2].id,
        productId: sampleProducts[2].id,
        startDate: new Date('2025-01-08'),
        endDate: new Date('2025-04-08'),
        totalAmount: 4500,
        status: 'PENDING',
        notes: 'Campaña de productos nuevos'
      }
    ]

    for (const reservation of reservations) {
      await prisma.reservation.create({
        data: reservation as any
      })
    }

    console.log('✅ Reservations created')

    // Create sample invoices
    const createdReservations = await prisma.reservation.findMany()
    
    const invoices = [
      {
        number: 'FAC-2025-001',
        clientId: createdClients[0].id,
        reservationId: createdReservations[0]?.id,
        productId: sampleProducts[0].id,
        amount: 8500,
        tax: 1105,
        totalAmount: 9605,
        issueDate: new Date('2025-01-10'),
        dueDate: new Date('2025-02-10'),
        status: 'SENT',
        notes: 'Factura por campaña enero-febrero'
      },
      {
        number: 'FAC-2025-002',
        clientId: createdClients[1].id,
        reservationId: createdReservations[1]?.id,
        productId: sampleProducts[1].id,
        amount: 12000,
        tax: 1560,
        totalAmount: 13560,
        issueDate: new Date('2025-01-15'),
        dueDate: new Date('2025-02-15'),
        paidDate: new Date('2025-01-18'),
        status: 'PAID',
        notes: 'Pago recibido por transferencia bancaria'
      }
    ]

    for (const invoice of invoices) {
      await prisma.invoice.create({
        data: invoice as any
      })
    }

    console.log('✅ Invoices created')

    // Create sample maintenance tickets
    const maintenanceTickets = [
      {
        productId: sampleProducts[0].id,
        title: 'Pantalla LED no enciende',
        description: 'La pantalla LED no se enciende desde ayer por la mañana. Posible problema eléctrico.',
        priority: 'HIGH',
        status: 'PENDING',
        assignedTo: 'Juan Pérez'
      },
      {
        productId: sampleProducts[1].id,
        title: 'Limpieza rutinaria',
        description: 'Limpieza rutinaria programada del soporte publicitario.',
        priority: 'LOW',
        status: 'RESOLVED',
        assignedTo: 'María González',
        resolvedAt: new Date('2025-01-06')
      }
    ]

    for (const ticket of maintenanceTickets) {
      await prisma.maintenanceTicket.create({
        data: ticket as any
      })
    }

    console.log('✅ Maintenance tickets created')

    // Create sample messages
    const messages = [
      {
        type: 'RESERVATION',
        title: 'Nueva reserva confirmada',
        content: 'La reserva RES-2025-001 de Coca Cola Bolivia ha sido confirmada.',
        isRead: false
      },
      {
        type: 'INVOICE',
        title: 'Pago recibido',
        content: 'Se ha recibido el pago de la factura FAC-2025-002 de Banco Nacional.',
        isRead: true
      },
      {
        type: 'MAINTENANCE',
        title: 'Ticket de mantenimiento resuelto',
        content: 'El mantenimiento rutinario ha sido completado exitosamente.',
        isRead: true
      },
      {
        type: 'SYSTEM',
        title: 'Actualización del sistema',
        content: 'El sistema se actualizará esta noche entre las 2:00 AM y 4:00 AM.',
        isRead: false
      }
    ]

    for (const message of messages) {
      await prisma.message.create({
        data: message as any
      })
    }

    console.log('✅ Messages created')

    // Create sample settings
    const settings = [
      { key: 'company_name', value: 'PubliMax Bolivia' },
      { key: 'company_email', value: 'info@publimax.bo' },
      { key: 'company_phone', value: '+591 2 2345678' },
      { key: 'default_currency', value: 'BOB' },
      { key: 'default_tax_rate', value: '13' },
      { key: 'invoice_due_days', value: '30' },
      { key: 'notifications_enabled', value: 'true' }
    ]

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }

    console.log('✅ Settings created')
  }

  console.log('🎉 Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
