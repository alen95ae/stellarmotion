import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    try {
      const partner = await prisma.partner.findUnique({
        where: { id },
        include: {
          supports: true,
          users: { select: { id: true, name: true, email: true, role: true } },
        },
      })
      if (!partner) return res.status(404).json({ error: 'Partner no encontrado' })
      return res.status(200).json(partner)
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error interno' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, email, phone, companyName, country, city } = req.body || {}
      const updated = await prisma.partner.update({
        where: { id },
        data: { name, email, phone, companyName, country, city },
      })
      return res.status(200).json(updated)
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error interno' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.partner.delete({ where: { id } })
      return res.status(200).json({ ok: true })
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error interno' })
    }
  }

  res.setHeader('Allow', 'GET,PUT,DELETE')
  return res.status(405).json({ error: 'Method Not Allowed' })
}

