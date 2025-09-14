"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Support { id: string; title: string; code: string | null; city: string | null; country: string | null }
interface Partner {
  id: string
  name: string
  email: string
  phone?: string | null
  companyName?: string | null
  country: string
  city?: string | null
  supports: Support[]
}

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/partners/${params.id}`)
    if (res.ok) {
      setPartner(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [params.id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!partner) return <div className="p-6">Partner no encontrado</div>

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Partner</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><b>Nombre:</b> {partner.name}</div>
          <div><b>Email:</b> {partner.email}</div>
          <div><b>Teléfono:</b> {partner.phone || '-'}</div>
          <div><b>Empresa:</b> {partner.companyName || '-'}</div>
          <div><b>País:</b> {partner.country}</div>
          <div><b>Ciudad:</b> {partner.city || '-'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Soportes vinculados</CardTitle>
        </CardHeader>
        <CardContent>
          {partner.supports.length === 0 ? (
            <div className="text-gray-500">Sin soportes vinculados</div>
          ) : (
            <ul className="space-y-2">
              {partner.supports.map(s => (
                <li key={s.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-gray-500">{s.code || ''} · {s.city || ''} {s.country || ''}</div>
                  </div>
                  <Link href={`/panel/soportes/${s.id}`} className="text-blue-600 hover:underline">Abrir</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Leads: requiere modelo que no existe aún; placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Leads generados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">Integrar cuando exista el modelo de Leads.</div>
        </CardContent>
      </Card>
    </div>
  )
}

