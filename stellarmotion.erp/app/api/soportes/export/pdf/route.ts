// app/api/soportes/export/pdf/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { join } from 'path'
import { readFile } from 'fs/promises'

function isPng(buf: Uint8Array) {
  return buf.length >= 8
    && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47
    && buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A
}
function isJpg(buf: Uint8Array) {
  return buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF
}

async function loadLocal(publicPath: string): Promise<Uint8Array | null> {
  try {
    const rel = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
    const abs = join(process.cwd(), 'public', rel.replace(/^public\//, ''))
    const buf = await readFile(abs)
    return new Uint8Array(buf)
  } catch {
    return null
  }
}

async function loadRemote(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    const ab = await r.arrayBuffer()
    return new Uint8Array(ab)
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = (searchParams.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (!ids.length) return NextResponse.json({ error: 'ids requeridos' }, { status: 400 })

    const { data: items, error } = await supabaseServer
      .from('soportes')
      .select('*')
      .in('id', ids)
      .order('codigo_interno', { ascending: true })

    if (error) {
      console.error('Error fetching soportes for PDF:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No se encontraron soportes' }, { status: 404 })
    }

    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

    // A4 en puntos: 595.28 × 841.89
    const PAGE_W = 595.28
    const PAGE_H = 841.89
    const MARGIN = 40

    // Portada simple
    {
      const page = pdf.addPage([PAGE_W, PAGE_H])
      page.drawText('Catálogo de Soportes', {
        x: MARGIN, y: PAGE_H - MARGIN - 40,
        size: 28, font: fontBold, color: rgb(0.1,0.1,0.1)
      })
      page.drawText(new Date().toLocaleDateString('es-ES'), {
        x: MARGIN, y: PAGE_H - MARGIN - 70,
        size: 10, font, color: rgb(0.4,0.4,0.4)
      })
    }

    for (const s of items) {
      const page = pdf.addPage([PAGE_W, PAGE_H])
      let y = PAGE_H - MARGIN

      const line = (txt: string, size = 11, bold = false) => {
        y -= size + 6
        page.drawText(txt, {
          x: MARGIN, y,
          size, font: bold ? fontBold : font, color: rgb(0,0,0)
        })
      }

      const code = s.codigo_interno || s.id || '-'
      const title = s.titulo || ''
      const tipo = s.tipo_soporte || '-'
      const ancho = s.ancho ?? 0
      const alto = s.alto ?? 0
      const superficie = s.superficie ?? (ancho * alto)
      const estado = s.estado || '-'
      const precio = s.precio_mes ?? '-'
      
      line(`${code} — ${title}`, 16, true)
      const sizeStr = `Tamaño: ${ancho} × ${alto} m`
      const areaStr = `Área: ${superficie} m²`
      const row1 = `Tipo: ${tipo}     ${sizeStr}     ${areaStr}`
      line(row1, 11, false)

      const row2 = `Disponibilidad: ${estado}     Precio/mes: ${precio}`
      line(row2, 11, false)

      // Imagen (si JPG/PNG) - usar imagen_1
      y -= 16
      let imgBuf: Uint8Array | null = null
      const imageUrl = s.imagen_1 || s.imagen_2 || s.imagen_3
      if (imageUrl) {
        imgBuf = imageUrl.startsWith('http')
          ? await loadRemote(imageUrl)
          : await loadLocal(imageUrl)
      }

      if (imgBuf && (isJpg(imgBuf) || isPng(imgBuf))) {
        try {
          const img = isJpg(imgBuf)
            ? await pdf.embedJpg(imgBuf)
            : await pdf.embedPng(imgBuf)

          const maxW = PAGE_W - MARGIN*2
          const maxH = 260
          const { width, height } = img.scale(1)
          const scale = Math.min(maxW / width, maxH / height)
          const w = width * scale
          const h = height * scale
          page.drawImage(img, { x: MARGIN, y: y - h, width: w, height: h })
          y -= (h + 10)
        } catch {
          // Si falla la imagen, seguimos sin romper
        }
      }

      // Separador
      page.drawLine({
        start: { x: MARGIN, y: y - 6 },
        end:   { x: PAGE_W - MARGIN, y: y - 6 },
        thickness: 0.5,
        color: rgb(0.85,0.85,0.85)
      })
    }

    const bytes = await pdf.save()
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="catalogo-soportes.pdf"'
      }
    })
  } catch (e) {
    // Para depurar en consola del server:
    console.error('[PDF EXPORT ERROR]', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
