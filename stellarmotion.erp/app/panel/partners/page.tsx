"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  Users,
  Monitor
} from "lucide-react"
import { toast } from "sonner"

interface Partner {
  id: string
  name: string
  email: string
  phone?: string
  companyName?: string
  country: string
  city?: string
  createdAt: string
  _count?: {
    supports: number
    users: number
  }
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("all")

  const COUNTRIES = [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador', 
    'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras', 
    'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 
    'República Dominicana', 'Uruguay'
  ]

  useEffect(() => {
    fetchPartners()
  }, [searchTerm, countryFilter])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.set('q', searchTerm)
      if (countryFilter && countryFilter !== 'all') params.set('country', countryFilter)
      
      const response = await fetch(`/api/partners?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPartners(data)
      } else {
        toast.error("Error al cargar los partners")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este partner?")) return
    
    try {
      const response = await fetch(`/api/partners/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Partner eliminado correctamente")
        fetchPartners()
      } else {
        toast.error("Error al eliminar el partner")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm || 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = countryFilter === 'all' || partner.country === countryFilter
    
    return matchesSearch && matchesCountry
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 mr-4">
              ← Dashboard
            </Link>
            <div className="text-xl font-bold text-slate-800">Partners</div>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Partners</h1>
          <p className="text-gray-600">Administra los partners y sus soportes publicitarios</p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar partners
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por nombre, email o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los países</SelectItem>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href="/panel/partners/nuevo">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Partner
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soportes Totales</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.reduce((sum, p) => sum + (p._count?.supports || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.reduce((sum, p) => sum + (p._count?.users || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Países</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(partners.map(p => p.country)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Partners ({filteredPartners.length})</CardTitle>
            <CardDescription>
              Lista de todos los partners registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || countryFilter !== 'all' ? "No se encontraron partners" : "No hay partners registrados"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Soportes</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{partner.name}</div>
                          {partner.companyName && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {partner.companyName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {partner.email}
                          </div>
                          {partner.phone && (
                            <div className="text-sm flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {partner.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {partner.city ? `${partner.city}, ` : ''}{partner.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {partner._count?.supports || 0} soportes
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {partner._count?.users || 0} usuarios
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(partner.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/partners/${partner.id}`)}
                            title="Ver detalle"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/partners/${partner.id}/editar`)}
                            title="Editar"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(partner.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Borrar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

