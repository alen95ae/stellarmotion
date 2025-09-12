import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { readdirSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const name = `support_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    // Intentar usar Vercel Blob si está configurado
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(name, new Uint8Array(arrayBuffer), {
          access: 'public',
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobError) {
        console.error('Vercel Blob error, falling back to local storage:', blobError)
      }
    }

    // Fallback a sistema de archivos local
    const bytes = Buffer.from(arrayBuffer)
    const dir = join(process.cwd(), 'public', 'uploads')
    
    try { 
      readdirSync(dir) 
    } catch { 
      mkdirSync(dir, { recursive: true }) 
    }
    
    const rel = `/uploads/${name}`
    writeFileSync(join(dir, name), bytes)
    
    return NextResponse.json({ url: rel })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
