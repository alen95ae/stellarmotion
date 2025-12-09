import { NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'
import { supabaseServer } from '@/lib/supabase-server'
import { parse } from 'csv-parse/sync'

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return withCors(NextResponse.json({ error: 'Archivo requerido' }, { status: 400 }))

    const buf = Buffer.from(await file.arrayBuffer())
    const csvContent = buf.toString('utf8')
    console.log('CSV Content:', csvContent.substring(0, 500) + '...')
    
    const rows = parse(csvContent, { columns: true, skip_empty_lines: true })
    console.log('Parsed rows:', rows.length)
    console.log('First row:', rows[0])

    let created = 0, updated = 0
    for (const r of rows) {
      // columnas esperadas (case-insensitive): title,type,status,widthM,heightM,dailyImpressions,lighting,owner,imageUrl,description,city,country,priceMonth,address,latitude,longitude
      const providedCode = String(r.code || r.CODE || r.codigo_interno || r.CODIGO_INTERNO || '').trim()
      console.log('Processing row:', r)
      console.log('Provided code:', providedCode)
      
      // Generar código automáticamente si no se proporciona
      let code = providedCode
      if (!code) {
        // Buscar el último código existente con formato SM-XXXX
        const { data: lastSupport } = await supabaseServer
          .from('soportes')
          .select('codigo_interno')
          .not('codigo_interno', 'is', null)
          .like('codigo_interno', 'SM-%')
          .order('codigo_interno', { ascending: false })
          .limit(1)
          .single()
        
        let nextNumber = 1
        if (lastSupport?.codigo_interno) {
          // Extraer el número del último código (ej: SM-0001 -> 1)
          const match = lastSupport.codigo_interno.match(/SM-(\d+)/)
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
      
      // Mapear datos a formato de SupabaseService
      const soporteData: any = {
        'Título del soporte': r.title ?? r.TITLE,
        'Descripción': r.description ?? r.DESCRIPTION,
        'Tipo de soporte': r.type ?? r.TYPE,
        'Estado del soporte': r.status ?? r.STATUS ?? 'DISPONIBLE',
        'Precio por mes': r.priceMonth ? Number(r.priceMonth) : null,
        dimensiones: {
          ancho: r.widthM ? Number(r.widthM) : 0,
          alto: r.heightM ? Number(r.heightM) : 0,
          area: 0 // Se calculará automáticamente
        },
        imagenes: r.imageUrl || r.IMAGEURL || r.image_url || r.IMAGE_URL ? [r.imageUrl || r.IMAGEURL || r.image_url || r.IMAGE_URL] : [],
        ciudad: r.city ?? r.CITY,
        pais: r.country ?? r.COUNTRY,
        'Código interno': code,
        'Impactos diarios': r.dailyImpressions ?? r.DAILYIMPRESSIONS ?? r.daily_impressions ?? r.DAILY_IMPRESSIONS ? Number(r.dailyImpressions ?? r.DAILYIMPRESSIONS ?? r.daily_impressions ?? r.DAILY_IMPRESSIONS) : null,
        'Iluminación': r.lighting === 'true' || r.lighting === '1' || r.lighting === 'TRUE' || r.LIGHTING === 'true' || r.LIGHTING === '1' || r.LIGHTING === 'TRUE',
        'Enlace de Google Maps': r.googleMapsLink ?? r.GOOGLEMAPSLINK ?? r.google_maps_link ?? r.GOOGLE_MAPS_LINK ?? r.address ?? r.ADDRESS,
        latitud: r.latitude ? Number(r.latitude) : null,
        longitud: r.longitude ? Number(r.longitude) : null,
      }

      console.log('Data to save:', soporteData)
      
      // Buscar si existe por código interno
      const { data: existing } = await supabaseServer
        .from('soportes')
        .select('id')
        .eq('codigo_interno', code)
        .limit(1)
        .maybeSingle()
      
      if (existing) { 
        console.log('Updating existing support:', code)
        const updatedSoporte = await SupabaseService.updateSoporte(existing.id, soporteData)
        if (updatedSoporte) {
          updated++
        }
      } else { 
        console.log('Creating new support:', code)
        const newSoporte = await SupabaseService.createSoporte(soporteData)
        if (newSoporte) {
          created++
        }
      }
    }

    return withCors(NextResponse.json({ ok: true, created, updated }))
  } catch (error) {
    console.error("Error importing CSV:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}
