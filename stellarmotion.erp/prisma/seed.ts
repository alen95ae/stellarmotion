import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stellarmotion.io' },
    update: {},
    create: {
      email: 'admin@stellarmotion.io',
      name: 'Admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  const comercial1 = await prisma.user.upsert({
    where: { email: 'maria.garcia@stellarmotion.io' },
    update: {},
    create: {
      email: 'maria.garcia@stellarmotion.io',
      name: 'María García',
      password: await bcrypt.hash('password123', 10),
      role: 'MANAGER',
    },
  })

  const comercial2 = await prisma.user.upsert({
    where: { email: 'carlos.lopez@stellarmotion.io' },
    update: {},
    create: {
      email: 'carlos.lopez@stellarmotion.io',
      name: 'Carlos López',
      password: await bcrypt.hash('password123', 10),
      role: 'OPERATOR',
    },
  })

  const comp = await prisma.company.create({
    data: { name: 'StellarMotion Media', website: 'https://stellarmotion.io' },
  })

  // Crear partner de prueba
  const partner = await prisma.partner.upsert({
    where: { email: 'contacto@publicidadvialimagen.com' },
    update: {},
    create: {
      name: 'Carlos Mendoza',
      email: 'contacto@publicidadvialimagen.com',
      phone: '+34 123 456 789',
      companyName: 'Publicidad Vial Imagen SRL',
      country: 'España',
      city: 'Madrid'
    }
  })

  // Crear usuario para el partner
  const partnerUser = await prisma.user.upsert({
    where: { email: 'contacto@publicidadvialimagen.com' },
    update: {},
    create: {
      email: 'contacto@publicidadvialimagen.com',
      name: 'Carlos Mendoza',
      password: await bcrypt.hash('partner123', 10),
      role: 'PARTNER',
      partnerId: partner.id
    }
  })

  // Crear categorías de ejemplo
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'vallas' },
      update: {},
      create: {
        slug: 'vallas',
        label: 'Vallas',
        iconKey: 'vallas'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mupis' },
      update: {},
      create: {
        slug: 'mupis',
        label: 'Mupis',
        iconKey: 'mupis'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'pantallas' },
      update: {},
      create: {
        slug: 'pantallas',
        label: 'Pantallas',
        iconKey: 'pantallas'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'carteleras' },
      update: {},
      create: {
        slug: 'carteleras',
        label: 'Carteleras',
        iconKey: 'carteleras'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'displays' },
      update: {},
      create: {
        slug: 'displays',
        label: 'Displays',
        iconKey: 'displays'
      }
    })
  ])

  // Crear soportes de ejemplo
  const existingSupports = await prisma.support.count()
  const existingPartnerSupports = await prisma.support.count({
    where: { partnerId: partner.id }
  })
  
  if (existingSupports < 5) {
    await prisma.support.createMany({
      data: [
        { 
          code: 'SM-001', 
          title: 'Valla Avenidas', 
          type: 'valla', 
          city: 'Zamora', 
          country: 'ES', 
          priceMonth: 450, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 4.0,
          heightM: 3.0,
          areaM2: 12.0,
          pricePerM2: 12.0,
          productionCost: 144.0,
          productionCostOverride: false,
          owner: 'Imagen',
          companyId: comp.id,
          categoryId: categories[0].id, // Vallas
          latitude: 41.503, 
          longitude: -5.744 
        },
        { 
          code: 'SM-002', 
          title: 'LED Centro', 
          type: 'pantalla', 
          city: 'Zamora', 
          country: 'ES', 
          priceMonth: 950, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 6.0,
          heightM: 4.0,
          areaM2: 24.0,
          pricePerM2: 15.0,
          productionCost: 360.0,
          productionCostOverride: false,
          companyId: comp.id,
          categoryId: categories[2].id, // Pantallas
          latitude: 41.505, 
          longitude: -5.741 
        },
        { 
          code: 'SM-003', 
          title: 'Parada de Bus Plaza Mayor', 
          type: 'Parada de Bus', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 320, 
          available: true, 
          status: 'RESERVADO',
          widthM: 2.5,
          heightM: 1.8,
          areaM2: 4.5,
          pricePerM2: 18.0,
          productionCost: 81.0,
          productionCostOverride: false,
          owner: 'Ayuntamiento',
          companyId: comp.id,
          categoryId: categories[1].id, // Mupis
          latitude: 40.4168, 
          longitude: -3.7038 
        },
        { 
          code: 'SM-004', 
          title: 'Mupi Gran Vía', 
          type: 'Mupi', 
          city: 'Barcelona', 
          country: 'España', 
          priceMonth: 680, 
          available: true, 
          status: 'OCUPADO',
          widthM: 3.0,
          heightM: 2.0,
          areaM2: 6.0,
          pricePerM2: 20.0,
          productionCost: 120.0,
          productionCostOverride: false,
          owner: 'Clear Channel',
          companyId: comp.id,
          categoryId: categories[1].id, // Mupis
          latitude: 41.3851, 
          longitude: 2.1734 
        },
        { 
          code: 'SM-005', 
          title: 'Display Aeropuerto', 
          type: 'Display', 
          city: 'Valencia', 
          country: 'España', 
          priceMonth: 1200, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 4.0,
          heightM: 3.0,
          areaM2: 12.0,
          pricePerM2: 25.0,
          productionCost: 300.0,
          productionCostOverride: false,
          owner: 'JCDecaux',
          companyId: comp.id,
          categoryId: categories[4].id, // Displays
          latitude: 39.4699, 
          longitude: -0.3763 
        }
      ].map((d:any)=>({ ...d })),
    })
  }

  // Crear soportes del partner si no existen
  if (existingPartnerSupports === 0) {
    await prisma.support.createMany({
      data: [
        { 
          code: 'PVI-001', 
          title: 'Valla Gran Vía Madrid', 
          type: 'Valla', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 850, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 6.0,
          heightM: 3.0,
          areaM2: 18.0,
          pricePerM2: 15.0,
          productionCost: 270.0,
          productionCostOverride: false,
          owner: 'Publicidad Vial Imagen SRL',
          partnerId: partner.id,
          categoryId: categories[0].id, // Vallas
          latitude: 40.4168, 
          longitude: -3.7038,
          slug: 'valla-gran-via-madrid',
          dimensions: '6x3m',
          dailyImpressions: 50000,
          lighting: true,
          tags: 'centro, gran-via, alta-visibilidad',
          shortDescription: 'Valla premium en el corazón de Madrid con iluminación LED',
          description: 'Excelente ubicación en Gran Vía con alta visibilidad y tráfico peatonal. Incluye iluminación LED para máxima visibilidad nocturna.',
          featured: true,
          rating: 4.8,
          reviewsCount: 12
        },
        { 
          code: 'PVI-002', 
          title: 'Mupi Plaza Mayor', 
          type: 'Mupi', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 450, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 3.0,
          heightM: 2.0,
          areaM2: 6.0,
          pricePerM2: 18.0,
          productionCost: 108.0,
          productionCostOverride: false,
          owner: 'Publicidad Vial Imagen SRL',
          partnerId: partner.id,
          categoryId: categories[1].id, // Mupis
          latitude: 40.4155, 
          longitude: -3.7074,
          slug: 'mupi-plaza-mayor-madrid',
          dimensions: '3x2m',
          dailyImpressions: 25000,
          lighting: false,
          tags: 'plaza-mayor, turistico, centro-historico',
          shortDescription: 'Mupi en Plaza Mayor con gran afluencia turística',
          description: 'Ubicación estratégica en Plaza Mayor, punto de alta concentración turística y local. Perfecto para campañas dirigidas al sector turístico.',
          featured: false,
          rating: 4.5,
          reviewsCount: 8
        },
        { 
          code: 'PVI-003', 
          title: 'Pantalla LED Retiro', 
          type: 'Pantalla', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 1200, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 4.0,
          heightM: 3.0,
          areaM2: 12.0,
          pricePerM2: 25.0,
          productionCost: 300.0,
          productionCostOverride: false,
          owner: 'Publicidad Vial Imagen SRL',
          partnerId: partner.id,
          categoryId: categories[2].id, // Pantallas
          latitude: 40.4150, 
          longitude: -3.6850,
          slug: 'pantalla-led-retiro-madrid',
          dimensions: '4x3m',
          dailyImpressions: 35000,
          lighting: true,
          tags: 'retiro, pantalla-led, alta-tecnologia',
          shortDescription: 'Pantalla LED de alta resolución en zona Retiro',
          description: 'Pantalla LED de última generación con alta resolución. Ubicada en zona de alto tráfico cerca del Parque del Retiro.',
          featured: true,
          rating: 4.9,
          reviewsCount: 15
        },
        { 
          code: 'PVI-004', 
          title: 'Display Aeropuerto Barajas', 
          type: 'Display', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 1800, 
          available: true, 
          status: 'DISPONIBLE',
          widthM: 5.0,
          heightM: 3.5,
          areaM2: 17.5,
          pricePerM2: 30.0,
          productionCost: 525.0,
          productionCostOverride: false,
          owner: 'Publicidad Vial Imagen SRL',
          partnerId: partner.id,
          categoryId: categories[4].id, // Displays
          latitude: 40.4839, 
          longitude: -3.5680,
          slug: 'display-aeropuerto-barajas-madrid',
          dimensions: '5x3.5m',
          dailyImpressions: 75000,
          lighting: true,
          tags: 'aeropuerto, barajas, premium, internacional',
          shortDescription: 'Display premium en Aeropuerto Adolfo Suárez Madrid-Barajas',
          description: 'Display de alta gama en el aeropuerto más importante de España. Audiencia internacional y de alto poder adquisitivo.',
          featured: true,
          rating: 4.7,
          reviewsCount: 22
        },
        { 
          code: 'PVI-005', 
          title: 'Cartelera Sol', 
          type: 'Cartelera', 
          city: 'Madrid', 
          country: 'España', 
          priceMonth: 650, 
          available: true, 
          status: 'OCUPADO',
          widthM: 4.0,
          heightM: 2.5,
          areaM2: 10.0,
          pricePerM2: 20.0,
          productionCost: 200.0,
          productionCostOverride: false,
          owner: 'Publicidad Vial Imagen SRL',
          partnerId: partner.id,
          categoryId: categories[3].id, // Carteleras
          latitude: 40.4168, 
          longitude: -3.7038,
          slug: 'cartelera-sol-madrid',
          dimensions: '4x2.5m',
          dailyImpressions: 60000,
          lighting: true,
          tags: 'puerta-del-sol, centro, iconico',
          shortDescription: 'Cartelera icónica en Puerta del Sol',
          description: 'Ubicación emblemática en Puerta del Sol, el corazón de Madrid. Máxima visibilidad y reconocimiento.',
          featured: false,
          rating: 4.6,
          reviewsCount: 18
        }
      ]
    })
  }

  // Crear etiquetas de contacto
  const tags = await Promise.all([
    prisma.contactTag.upsert({
      where: { name: 'VIP' },
      update: {},
      create: { name: 'VIP', color: '#FFD700' }
    }),
    prisma.contactTag.upsert({
      where: { name: 'Nuevo' },
      update: {},
      create: { name: 'Nuevo', color: '#00FF00' }
    }),
    prisma.contactTag.upsert({
      where: { name: 'Potencial' },
      update: {},
      create: { name: 'Potencial', color: '#FF6B6B' }
    }),
    prisma.contactTag.upsert({
      where: { name: 'Activo' },
      update: {},
      create: { name: 'Activo', color: '#4ECDC4' }
    })
  ])

  // Crear contactos de ejemplo
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        kind: 'COMPANY',
        relation: 'CUSTOMER',
        displayName: 'AA Shop S.R.L.',
        legalName: 'AA Shop Sociedad de Responsabilidad Limitada',
        taxId: '12345678',
        phone: '+591 2 123456',
        email: 'contacto@aashop.bo',
        website: 'https://aashop.bo',
        address1: 'Av. 16 de Julio 1234',
        city: 'La Paz',
        country: 'BO',
        salesOwnerId: comercial1.id,
        favorite: true,
        tags: {
          create: [
            { tagId: tags[0].id }, // VIP
            { tagId: tags[3].id }  // Activo
          ]
        }
      }
    }),
    prisma.contact.create({
      data: {
        kind: 'COMPANY',
        relation: 'SUPPLIER',
        displayName: 'Digital Print Solutions',
        legalName: 'Digital Print Solutions Ltda.',
        taxId: '87654321',
        phone: '+591 3 654321',
        email: 'info@digitalprint.bo',
        website: 'https://digitalprint.bo',
        address1: 'Calle Comercio 567',
        city: 'Santa Cruz',
        country: 'BO',
        salesOwnerId: comercial2.id,
        tags: {
          create: [
            { tagId: tags[2].id } // Potencial
          ]
        }
      }
    }),
    prisma.contact.create({
      data: {
        kind: 'INDIVIDUAL',
        relation: 'CUSTOMER',
        displayName: 'Juan Pérez',
        phone: '+591 7 123456',
        email: 'juan.perez@email.com',
        address1: 'Calle Sucre 789',
        city: 'Cochabamba',
        country: 'BO',
        salesOwnerId: comercial1.id,
        tags: {
          create: [
            { tagId: tags[1].id } // Nuevo
          ]
        }
      }
    }),
    prisma.contact.create({
      data: {
        kind: 'COMPANY',
        relation: 'BOTH',
        displayName: 'MediaCorp Bolivia',
        legalName: 'MediaCorp Bolivia S.A.',
        taxId: '11223344',
        phone: '+591 4 112233',
        email: 'ventas@mediacorp.bo',
        website: 'https://mediacorp.bo',
        address1: 'Av. Mariscal Santa Cruz 456',
        city: 'La Paz',
        country: 'BO',
        salesOwnerId: comercial2.id,
        favorite: true,
        tags: {
          create: [
            { tagId: tags[0].id }, // VIP
            { tagId: tags[2].id }  // Potencial
          ]
        }
      }
    }),
    prisma.contact.create({
      data: {
        kind: 'INDIVIDUAL',
        relation: 'CUSTOMER',
        displayName: 'María Rodríguez',
        phone: '+591 6 987654',
        email: 'maria.rodriguez@email.com',
        address1: 'Calle Ballivián 321',
        city: 'Oruro',
        country: 'BO',
        salesOwnerId: comercial1.id
      }
    }),
    prisma.contact.create({
      data: {
        kind: 'COMPANY',
        relation: 'SUPPLIER',
        displayName: 'Tech Supplies Co.',
        legalName: 'Tech Supplies Company',
        taxId: '55667788',
        phone: '+591 2 556677',
        email: 'info@techsupplies.bo',
        website: 'https://techsupplies.bo',
        address1: 'Av. Camacho 789',
        city: 'La Paz',
        country: 'BO',
        salesOwnerId: comercial2.id
      }
    })
  ])

  console.log('Seed completado:', { 
    admin: admin.email, 
    company: comp.name,
    partner: partner.companyName,
    partnerEmail: partner.email,
    partnerPassword: 'partner123',
    categories: categories.length,
    contacts: contacts.length,
    tags: tags.length
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
