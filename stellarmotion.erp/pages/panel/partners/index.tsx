"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Trash2, Eye, Edit } from 'lucide-react'

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
  const [q, setQ] = useState('')

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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return partners
    return partners.filter(p =>
      [p.name, p.email, p.phone, p.companyName, p.country, p.city]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    )
  }, [partners, q])

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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este partner?')) return
    const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
    if (res.ok) fetchPartners()
    else alert('No se pudo eliminar')
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>Gestión de partners asociados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por nombre, email, país…" className="pl-10" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(v => !v)} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Partner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Empresa" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <Input placeholder="País" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
              <Input placeholder="Ciudad" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <div className="md:col-span-3 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Crear</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay partners</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead># Soportes</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.email}</TableCell>
                    <TableCell>{p.phone || '-'}</TableCell>
                    <TableCell>{p.country}</TableCell>
                    <TableCell>{p._count?.supports ?? 0}</TableCell>
                    <TableCell className="space-x-2">
                      <Link href={`/panel/partners/${p.id}`} className="inline-flex items-center text-blue-600 hover:underline">
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="inline-flex items-center text-red-600 hover:underline">
                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
