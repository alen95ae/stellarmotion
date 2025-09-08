"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Building2, User, Star } from "lucide-react"
import { toast } from "sonner"

interface SalesOwner {
  id: string
  name: string
  email: string
}

export default function NuevoContactoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [salesOwners, setSalesOwners] = useState<SalesOwner[]>([])
  const [formData, setFormData] = useState({
    kind: "COMPANY" as "INDIVIDUAL" | "COMPANY",
    relation: "CUSTOMER" as "CUSTOMER" | "SUPPLIER" | "BOTH",
    displayName: "",
    legalName: "",
    taxId: "",
    phone: "",
    email: "",
    website: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    salesOwnerId: "none",
    notes: "",
    favorite: false
  })

  useEffect(() => {
    fetchSalesOwners()
  }, [])

  const fetchSalesOwners = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const users = await response.json()
        setSalesOwners(users.filter((user: any) => user.role !== "ADMIN"))
      }
    } catch (error) {
      console.error("Error fetching sales owners:", error)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.displayName) {
      toast.error("El nombre es requerido")
      return
    }

    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        salesOwnerId: formData.salesOwnerId === "none" ? null : formData.salesOwnerId
      }
      
      const response = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const created = await response.json()
        toast.success("Contacto creado correctamente")
        router.push(`/panel/contactos/${created.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear el contacto")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/panel/contactos" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Contactos
            </Link>
            <div className="text-xl font-bold text-slate-800">Nuevo Contacto</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Buscar</span>
            <span className="text-gray-800 font-medium">admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Crear Nuevo Contacto</h1>
          <p className="text-gray-600">Añade un nuevo contacto a tu base de datos</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Encabezado */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="kind-company"
                      name="kind"
                      value="COMPANY"
                      checked={formData.kind === "COMPANY"}
                      onChange={(e) => handleChange("kind", e.target.value)}
                      className="w-4 h-4 text-[#D54644]"
                    />
                    <Label htmlFor="kind-company" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Compañía
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="kind-individual"
                      name="kind"
                      value="INDIVIDUAL"
                      checked={formData.kind === "INDIVIDUAL"}
                      onChange={(e) => handleChange("kind", e.target.value)}
                      className="w-4 h-4 text-[#D54644]"
                    />
                    <Label htmlFor="kind-individual" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Individual
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorite"
                    checked={formData.favorite}
                    onCheckedChange={(checked) => handleChange("favorite", checked)}
                  />
                  <Label htmlFor="favorite" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Favorito
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-lg font-medium">
                    Nombre del Contacto *
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    placeholder={formData.kind === "COMPANY" ? "Nombre de la empresa" : "Nombre completo"}
                    className="text-lg mt-2"
                    required
                  />
                </div>

                {formData.kind === "COMPANY" && (
                  <div>
                    <Label htmlFor="legalName">Razón Social</Label>
                    <Input
                      id="legalName"
                      value={formData.legalName}
                      onChange={(e) => handleChange("legalName", e.target.value)}
                      placeholder="Razón social completa"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">NIT</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => handleChange("taxId", e.target.value)}
                      placeholder="Número de identificación tributaria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relation">Relación *</Label>
                    <Select value={formData.relation} onValueChange={(value) => handleChange("relation", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">Cliente</SelectItem>
                        <SelectItem value="SUPPLIER">Proveedor</SelectItem>
                        <SelectItem value="BOTH">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Datos para comunicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+591 2 123456"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="salesOwnerId">Comercial Asignado</Label>
                  <Select value={formData.salesOwnerId} onValueChange={(value) => handleChange("salesOwnerId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar comercial" />
                    </SelectTrigger>
                    <SelectContent>
                                              <SelectItem value="none">Sin asignar</SelectItem>
                      {salesOwners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dirección */}
            <Card>
              <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <CardDescription>Información de ubicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address1">Dirección 1</Label>
                  <Input
                    id="address1"
                    value={formData.address1}
                    onChange={(e) => handleChange("address1", e.target.value)}
                    placeholder="Calle y número"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address2">Dirección 2</Label>
                  <Input
                    id="address2"
                    value={formData.address2}
                    onChange={(e) => handleChange("address2", e.target.value)}
                    placeholder="Apartamento, suite, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Ciudad"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">Estado/Provincia</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Estado"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      placeholder="CP"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="País"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
              <CardDescription>Información adicional sobre el contacto</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Escribe notas adicionales sobre este contacto..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex gap-4 justify-end">
            <Link href="/panel/contactos">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-[#D54644] hover:bg-[#B03A38]"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Creando..." : "Crear Contacto"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
