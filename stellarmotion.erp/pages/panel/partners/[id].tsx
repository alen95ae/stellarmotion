"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export default function PartnerDetailPage() {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '', country: '', city: '' })

  const load = async () => {
    setLoading(true)
    if (!id) return
    const res = await fetch(`/api/partners/${id}`)
    if (res.ok) {
      const data = await res.json()
      setPartner(data)
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        companyName: data.companyName || '',
        country: data.country || '',
        city: data.city || '',
      })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (!partner) return <div className="p-6">Partner no encontrado</div>

  const handleSave = async () => {
    if (!id) return
    const res = await fetch(`/api/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setEditing(false)
      load()
    } else {
      alert('No se pudo guardar')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('¿Eliminar este partner?')) return
    const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/panel/partners')
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información del Partner</CardTitle>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(true)}>Editar</Button>
                  <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave}>Guardar</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!editing ? (
            <>
              <div><b>Nombre:</b> {partner.name}</div>
              <div><b>Email:</b> {partner.email}</div>
              <div><b>Teléfono:</b> {partner.phone || '-'}</div>
              <div><b>Empresa:</b> {partner.companyName || '-'}</div>
              <div><b>País:</b> {partner.country}</div>
              <div><b>Ciudad:</b> {partner.city || '-'}</div>
            </>
          ) : (
            <>
              <Input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Empresa" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <Input placeholder="País" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              <Input placeholder="Ciudad" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </>
          )}
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
