import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const csvContent = buf.toString('utf8')
    console.log('CSV Content:', csvContent.substring(0, 500) + '...')
    
    const rows = parse(csvContent, { columns: true, skip_empty_lines: true })
    console.log('Parsed rows:', rows.length)
    console.log('First row:', rows[0])

    let created = 0, updated = 0
    for (const r of rows) {
      // columnas esperadas (case-insensitive): title,type,status,widthM,heightM,dailyImpressions,lighting,owner,imageUrl,description,city,country,priceMonth,address,latitude,longitude,areaM2,pricePerM2,productionCost,shortDescription,tags,featured,rating,reviewsCount,printingCost
      const providedCode = String(r.code || r.CODE || '').trim()
      console.log('Processing row:', r)
      console.log('Provided code:', providedCode)
      
      // Generar código automáticamente si no se proporciona
      let code = providedCode
      if (!code) {
        // Buscar el último código existente con formato SM-XXXX
        const lastSupport = await prisma.support.findFirst({
          where: {
            code: {
              startsWith: 'SM-'
            }
          },
          orderBy: {
            code: 'desc'
          }
        })
        
        let nextNumber = 1
        if (lastSupport) {
          // Extraer el número del último código (ej: SM-0001 -> 1)
          const match = lastSupport.code.match(/SM-(\d+)/)
          if (match) {
            nextNumber = parseInt(match[1]) + 1
          }
        }
        
        // Generar el nuevo código con formato SM-0001, SM-0002, etc.
        code = `SM-${nextNumber.toString().padStart(4, '0')}`
        console.log('Generated code:', code)
      }
      
      // Validar que tenemos un título (campo requerido)
      const title = String(r.title || r.TITLE || '').trim()
      if (!title) {
        console.log('Skipping row - no title')
        continue
      }
      
      const data: any = {
        code,
        title: r.title ?? r.TITLE,
        type: r.type ?? r.TYPE,
        status: r.status ?? r.STATUS,
        widthM: r.widthM ? Number(r.widthM) : undefined,
        heightM: r.heightM ? Number(r.heightM) : undefined,
        dailyImpressions: r.dailyImpressions ?? r.DAILYIMPRESSIONS ?? r.daily_impressions ?? r.DAILY_IMPRESSIONS ? Number(r.dailyImpressions ?? r.DAILYIMPRESSIONS ?? r.daily_impressions ?? r.DAILY_IMPRESSIONS) : undefined,
        lighting: r.lighting === 'true' || r.lighting === '1' || r.lighting === 'TRUE' || r.LIGHTING === 'true' || r.LIGHTING === '1' || r.LIGHTING === 'TRUE',
        owner: r.owner ?? r.OWNER,
        imageUrl: r.imageUrl ?? r.IMAGEURL ?? r.image_url ?? r.IMAGE_URL,
        description: r.description ?? r.DESCRIPTION,
        city: r.city ?? r.CITY, 
        country: r.country ?? r.COUNTRY,
        priceMonth: r.priceMonth ? Number(r.priceMonth) : undefined,
        // Campo googleMapsLink - lo guardamos en address por compatibilidad
        address: r.googleMapsLink ?? r.GOOGLEMAPSLINK ?? r.google_maps_link ?? r.GOOGLE_MAPS_LINK ?? r.address ?? r.ADDRESS,
      }

      console.log('Data to save:', data)
      
      const exist = await prisma.support.findUnique({ where: { code } })
      if (exist) { 
        console.log('Updating existing support:', code)
        await prisma.support.update({ where: { code }, data })
        updated++ 
      } else { 
        console.log('Creating new support:', code)
        await prisma.support.create({ data })
        created++ 
      }
    }

    return NextResponse.json({ ok: true, created, updated })
  } catch (error) {
    console.error("Error importing CSV:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
