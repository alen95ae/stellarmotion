"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  Users,
  Monitor,
  Euro,
  Calendar,
  Eye
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
  supports: Support[]
  users: User[]
}

interface Support {
  id: string
  code: string
  title: string
  type: string
  status: string
  city: string
  country: string
  priceMonth?: number
  imageUrl?: string
}

interface User {
  id: string
  name?: string
  email: string
  role: string
}

interface PartnerDetailPageProps {
  params: {
    id: string
  }
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPartner()
  }, [params.id])

  const fetchPartner = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/partners/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPartner(data)
      } else {
        toast.error("Error al cargar el partner")
        router.push("/panel/partners")
      }
    } catch (error) {
      toast.error("Error de conexión")
      router.push("/panel/partners")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este partner?")) return
    
    try {
      const response = await fetch(`/api/partners/${params.id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Partner eliminado correctamente")
        router.push("/panel/partners")
      } else {
        toast.error("Error al eliminar el partner")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'DISPONIBLE': 'default',
      'OCUPADO': 'destructive', 
      'RESERVADO': 'secondary',
      'NO_DISPONIBLE': 'outline'
    } as const

    const labels = {
      'DISPONIBLE': 'Disponible',
      'OCUPADO': 'Ocupado',
      'RESERVADO': 'Reservado',
      'NO_DISPONIBLE': 'No disponible'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Partner no encontrado</div>
          <Link href="/panel/partners">
            <Button className="mt-4">Volver a Partners</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalRevenue = partner.supports.reduce((sum, support) => 
    sum + (support.priceMonth || 0), 0
  )

  const availableSupports = partner.supports.filter(s => s.status === 'DISPONIBLE').length
  const occupiedSupports = partner.supports.filter(s => s.status === 'OCUPADO').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/panel/partners" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="text-xl font-bold text-slate-800">{partner.name}</div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/panel/partners/${partner.id}/editar`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Partner Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold">{partner.name}</p>
                  </div>
                  {partner.companyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Empresa</label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {partner.companyName}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {partner.email}
                    </p>
                  </div>
                  {partner.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-lg flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {partner.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ubicación</label>
                    <p className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {partner.city ? `${partner.city}, ` : ''}{partner.country}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(partner.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>KPIs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Soportes</span>
                  </div>
                  <span className="text-2xl font-bold">{partner.supports.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Usuarios</span>
                  </div>
                  <span className="text-2xl font-bold">{partner.users.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">Ingresos Totales</span>
                  </div>
                  <span className="text-2xl font-bold">{formatPrice(totalRevenue)}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disponibles</span>
                      <Badge variant="default">{availableSupports}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ocupados</span>
                      <Badge variant="destructive">{occupiedSupports}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Soportes del Partner ({partner.supports.length})</CardTitle>
            <CardDescription>
              Lista de todos los soportes publicitarios de este partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            {partner.supports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Este partner no tiene soportes registrados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Precio/Mes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partner.supports.map((support) => (
                    <TableRow key={support.id}>
                      <TableCell className="font-mono text-sm">
                        {support.code}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{support.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{support.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {support.city}, {support.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(support.priceMonth)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(support.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/panel/soportes/${support.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        {partner.users.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Usuarios del Partner ({partner.users.length})</CardTitle>
              <CardDescription>
                Usuarios asociados a este partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partner.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name || 'Sin nombre'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

