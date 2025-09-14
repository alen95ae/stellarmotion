import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// TODO: Protect with NextAuth session and admin check

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const partners = await prisma.partner.findMany({
        include: {
          _count: { select: { supports: true, users: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(partners)
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error interno' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone, companyName, country, city } = req.body || {}
      if (!name || !email || !country) {
        return res.status(400).json({ error: 'name, email y country son requeridos' })
      }
      const created = await prisma.partner.create({
        data: { name, email, phone, companyName, country, city },
      })
      return res.status(201).json(created)
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error interno' })
    }
  }

  res.setHeader('Allow', 'GET,POST')
  return res.status(405).json({ error: 'Method Not Allowed' })
}

