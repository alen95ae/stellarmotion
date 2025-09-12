import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import { readFile } from 'fs/promises'

export const config = {
  api: {
    bodyParser: false,
  },
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

async function parseJsonBody(req: NextApiRequest): Promise<any> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  try { return JSON.parse(raw) } catch { return {} }
}

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, keepExtensions: true })
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return res.status(500).json({ error: 'Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)' })
    }

    let fileBuffer: Buffer | null = null
    let filename: string | undefined
    let mime: string | undefined

    const contentTypeHeader = req.headers['content-type'] || ''
    if (contentTypeHeader.includes('multipart/form-data')) {
      const { fields, files } = await parseForm(req)
      const f = (files.file as formidable.File) || (Object.values(files)[0] as formidable.File)
      if (!f) return res.status(400).json({ error: 'file is required' })
      fileBuffer = await readFile(f.filepath)
      filename = (fields.filename as string) || f.originalFilename || 'upload.png'
      mime = f.mimetype || 'image/png'
    } else {
      // JSON base64 fallback
      const body = await parseJsonBody(req)
      const fileB64 = body?.file as string | undefined
      filename = body?.filename as string | undefined
      const detectedType: string | undefined = body?.contentType
      if (!fileB64 || !filename) {
        return res.status(400).json({ error: 'file (base64) and filename are required' })
      }
      let b64 = fileB64
      const m = b64.match(/^data:(.*?);base64,(.*)$/)
      if (m) {
        mime = detectedType || m[1]
        b64 = m[2]
      }
      fileBuffer = Buffer.from(b64, 'base64')
      mime = mime || detectedType || 'image/png'
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const objectPath = `uploads/${Date.now()}-${safeName}`

    const supabase = createClient(url, serviceKey)
    const { error: uploadError } = await supabase.storage.from('soportes').upload(objectPath, toArrayBuffer(fileBuffer), {
      contentType: mime || 'image/png',
      upsert: false,
    })
    if (uploadError) {
      return res.status(500).json({ error: uploadError.message })
    }

    const { data: pub } = supabase.storage.from('soportes').getPublicUrl(objectPath)
    return res.status(200).json({ url: pub.publicUrl })
  } catch (err: any) {
    console.error('Supabase upload error:', err)
    return res.status(500).json({ error: err?.message || 'Internal Server Error' })
  }
}
