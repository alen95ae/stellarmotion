"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Partner {
  id: string
  name: string
  email: string
  phone?: string | null
  companyName?: string | null
  country: string
  city?: string | null
  _count?: { supports: number; users: number }
}

export default function PartnersIndexPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '', country: '', city: '' })

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners')
      const data = await res.json()
      setPartners(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPartners() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', email: '', phone: '', companyName: '', country: '', city: '' })
      fetchPartners()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(err?.error || 'Error creando partner')
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partners</h1>
        <Button onClick={() => setShowForm(v => !v)} className="bg-[#D54644] hover:bg-[#B03A38]">Nuevo Partner</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Empresa" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <Input placeholder="País" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
              <Input placeholder="Ciudad" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <div className="md:col-span-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#D54644] hover:bg-[#B03A38]">Crear</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Nombre</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Teléfono</th>
                    <th className="py-2 px-2"># Soportes</th>
                    <th className="py-2 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{p.name}</td>
                      <td className="py-2 px-2">{p.email}</td>
                      <td className="py-2 px-2">{p.phone || '-'}</td>
                      <td className="py-2 px-2">{p._count?.supports ?? 0}</td>
                      <td className="py-2 px-2 flex gap-2">
                        <Link href={`/panel/partners/${p.id}`} className="text-blue-600 hover:underline">Ver</Link>
                        {/* Edit/Delete podrían ir aquí con acciones a /api/partners */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

