import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json({ 
        error: 'Configuración de Supabase faltante. Verifica NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY' 
      }, { status: 500 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten archivos de imagen' }, { status: 400 })
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (máximo 10MB)' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const objectPath = `uploads/${Date.now()}-${safeName}`

    const supabase = createClient(url, serviceKey)
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('soportes')
      .upload(objectPath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from('soportes').getPublicUrl(objectPath)
    return NextResponse.json({ url: pub.publicUrl })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
