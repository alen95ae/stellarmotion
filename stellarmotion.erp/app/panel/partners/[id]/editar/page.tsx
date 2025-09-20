"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const COUNTRIES = [
  'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador', 
  'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras', 
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 
  'República Dominicana', 'Uruguay'
]

interface PartnerDetailPageProps {
  params: {
    id: string
  }
}

export default function EditarPartnerPage({ params }: PartnerDetailPageProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    country: '',
    city: ''
  })

  useEffect(() => {
    fetchPartner()
  }, [params.id])

  const fetchPartner = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`/api/partners/${params.id}`)
      if (response.ok) {
        const partner = await response.json()
        setFormData({
          name: partner.name || '',
          email: partner.email || '',
          phone: partner.phone || '',
          companyName: partner.companyName || '',
          country: partner.country || '',
          city: partner.city || ''
        })
      } else {
        toast.error("Error al cargar el partner")
        router.push("/panel/partners")
      }
    } catch (error) {
      toast.error("Error de conexión")
      router.push("/panel/partners")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.country) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/partners/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Partner actualizado correctamente")
        router.push(`/panel/partners/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error al actualizar el partner")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/panel/partners/${params.id}`} className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="text-xl font-bold text-slate-800">Editar Partner</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Editar Partner</CardTitle>
              <CardDescription>
                Modifica la información del partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nombre del partner"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+34 123 456 789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Empresa</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ciudad"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/panel/partners/${params.id}`)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Partner'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

