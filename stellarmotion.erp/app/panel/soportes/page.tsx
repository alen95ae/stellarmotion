"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Eye, Edit, Trash2, MapPin, Euro, Upload, Download, Filter, Calculator, Hash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import EditableField from "@/components/EditableField"
import BulkActions from "@/components/BulkActions"

// Constantes para colores de estado
const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-emerald-600 text-white' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-amber-500 text-black' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-600 text-white' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-neutral-900 text-white' },
} as const

// Opciones de tipo
const TYPE_OPTIONS = [
  'Parada de Bus',
  'Mupi',
  'Valla',
  'Pantalla',
  'Display',
  'Cartelera',
  'Mural',
  'Letrero'
] as const

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay'
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Salta', 'Tucumán', 'Santa Fe', 'Neuquén'],
  'Bolivia': ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'El Alto', 'Sucre', 'Oruro', 'Potosí', 'Tarija', 'Trinidad', 'Cobija'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta', 'Temuco', 'La Serena', 'Iquique', 'Valdivia', 'Puerto Montt', 'Punta Arenas'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Cúcuta'],
  'Costa Rica': ['San José', 'Cartago', 'Alajuela', 'Heredia', 'Puntarenas', 'Limón', 'Liberia', 'Pérez Zeledón', 'Desamparados', 'Escazú'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Ambato', 'Manta', 'Portoviejo', 'Machala', 'Loja', 'Riobamba'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Santa Tecla', 'Apopa', 'Delgado', 'Mejicanos', 'San Marcos', 'Usulután'],
  'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
  'Estados Unidos': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Miami'],
  'Guatemala': ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Petapa', 'San Juan Sacatepéquez', 'Quetzaltenango', 'Villa Canales', 'Escuintla', 'Chinautla', 'Chimaltenango'],
  'Honduras': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Choluteca', 'Comayagua', 'Puerto Cortés', 'La Lima', 'Danlí'],
  'México': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'],
  'Nicaragua': ['Managua', 'León', 'Granada', 'Masaya', 'Chinandega', 'Matagalpa', 'Estelí', 'Tipitapa', 'Jinotepe', 'Nueva Guinea'],
  'Panamá': ['Ciudad de Panamá', 'San Miguelito', 'Tocumen', 'David', 'Arraiján', 'Colón', 'La Chorrera', 'Pacora', 'Penonome', 'Santiago'],
  'Paraguay': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Nemby', 'Encarnación', 'Mariano Roque Alonso'],
  'Perú': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Huancayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Tacna'],
  'República Dominicana': ['Santo Domingo', 'Santiago', 'Los Alcarrizos', 'La Romana', 'San Pedro de Macorís', 'Higüey', 'San Francisco de Macorís', 'Puerto Plata', 'La Vega', 'Bonao'],
  'Uruguay': ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes']
};

interface Support {
  id: string
  code: string  // Código interno (SM-0001, SM-0002, etc.)
  title: string
  type: string
  status: keyof typeof STATUS_META
  widthM: number | null
  heightM: number | null
  city: string
  country: string
  priceMonth: number | null
  available: boolean
  areaM2: number | null
  pricePerM2: number | null
  productionCost: number | null
  partnerId: string | null
  partner: {
    id: string
    name: string
    companyName: string | null
    email: string
  } | null
  owner: string | null
  imageUrl: string | null
  company?: { name: string }
}

export default function SoportesPage() {
  const [supports, setSupports] = useState<Support[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [openImport, setOpenImport] = useState(false)
  const router = useRouter()

  // Handler para inputs numéricos normales
  const handleNumericChange = (field: string, value: string, setter: (value: string) => void) => {
    // Permitir solo números y un punto decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    // Evitar múltiples puntos decimales
    const parts = cleaned.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setter(finalValue);
  };


  // Función callback para guardar cambios desde EditableField
  const handleFieldSave = async (id: string, field: string, value: any) => {
    try {
      // Obtener el soporte actual para preservar todos los campos
      const currentSupport = supports.find(s => s.id === id);
      if (!currentSupport) {
        toast.error("Soporte no encontrado");
        return;
      }

      // Crear el objeto de actualización con todos los campos existentes
      const updateData = {
        ...currentSupport,
        [field]: value
      };

      // Actualizar directamente en el backend
      const response = await fetch(`/api/soportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        // Actualizar el soporte localmente
        setSupports(prev => prev.map(support => 
          support.id === id 
            ? { ...support, [field]: value }
            : support
        ));
        toast.success("Campo actualizado correctamente");
        
        // Refrescar los datos desde el servidor para asegurar sincronización
        setTimeout(() => {
          fetchSupports();
        }, 500);
      } else {
        toast.error("Error al actualizar el campo");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  useEffect(() => {
    fetchSupports()
  }, [q, statusFilter])


  const fetchSupports = async (searchQuery = q, statusFilters = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchQuery) params.set('q', searchQuery)
      if (statusFilters.length) params.set('status', statusFilters.join(','))
      
      const response = await fetch(`/api/soportes?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSupports(data)
      } else {
        toast.error("Error al cargar los soportes")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }



  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este soporte?")) return
    
    try {
      const response = await fetch(`/api/soportes/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Soporte eliminado correctamente")
        fetchSupports()
      } else {
        toast.error("Error al eliminar el soporte")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price)
  }

  const ids = supports.map(i => i.id)
  const allSelected = ids.length > 0 && ids.every(id => selected[id])
  const someSelected = ids.some(id => selected[id])
  const selectedIds = Object.keys(selected).filter(id => selected[id])
  const singleSelected = selectedIds.length === 1

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {}
    ids.forEach(id => { next[id] = checked })
    setSelected(next)
  }

  // Función helper para obtener IDs seleccionados
  const getSelectedIds = () => Object.keys(selected).filter(id => selected[id])

  // Función para actualización masiva (PATCH)
  async function bulkUpdate(patch: any) {
    const ids = getSelectedIds()
    if (ids.length === 0) return

    try {
      const response = await fetch('/api/soportes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, data: patch })
      })
      
      if (response.ok) {
        toast.success(`${ids.length} soportes actualizados correctamente`)
        fetchSupports()
        setSelected({})
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar los soportes")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  // Función para eliminación masiva (DELETE)
  async function bulkDelete() {
    const ids = getSelectedIds()
    if (ids.length === 0) return
    if (!confirm(`¿Eliminar ${ids.length} soportes?`)) return
    
    try {
      const response = await fetch('/api/soportes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      
      if (response.ok) {
        toast.success(`${ids.length} soportes eliminados`)
        fetchSupports()
        setSelected({})
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar los soportes")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  // Función para cambio de estado masivo
  async function bulkStatusChange(newStatus: string) {
    const ids = getSelectedIds()
    if (ids.length === 0) return
    if (!confirm(`¿Cambiar estado de ${ids.length} soportes a ${STATUS_META[newStatus as keyof typeof STATUS_META]?.label}?`)) return
    
    await bulkUpdate({ status: newStatus })
  }

  async function exportPDF() {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (!ids.length) return
    const url = `/api/soportes/export/pdf?ids=${ids.join(',')}`
    window.open(url, '_blank')
  }

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    
    const fd = new FormData()
    fd.set('file', f)
    
    try {
      const response = await fetch('/api/soportes/import', { method: 'POST', body: fd })
      const result = await response.json()
      
      if (result.ok) {
        toast.success(`Importación completada: ${result.created} creados, ${result.updated} actualizados`)
        fetchSupports()
      } else {
        toast.error('Error en la importación')
      }
    } catch (error) {
      toast.error('Error en la importación')
    }
    
    setOpenImport(false)
    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 mr-4">
              ← Dashboard
            </Link>
            <div className="text-xl font-bold text-slate-800">Soportes</div>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Soportes</h1>
          <p className="text-gray-600">Administra los soportes publicitarios disponibles</p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar soportes
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por código, título, ciudad, tipo o propietario..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  
                  {/* Filtros avanzados */}
                  <Select
                    value={statusFilter.length ? statusFilter.join(',') : 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? [] : (value ? value.split(',') : []))}
                  >
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(STATUS_META).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${meta.className}`}></span>
                            {meta.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={openImport} onOpenChange={setOpenImport}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Importar CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Importar soportes (CSV)</DialogTitle>
                      <DialogDescription>
                        Columnas requeridas: title, type, status, city, country. Opcionales: widthM, heightM, dailyImpressions, lighting, owner, priceMonth, description, imageUrl, googleMapsLink. El código interno se genera automáticamente.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">Campos Básicos:</h4>
                          <ul className="space-y-1 text-gray-600">
                            <li>• title (título) *</li>
                            <li>• type (tipo) *</li>
                            <li>• status (estado) *</li>
                            <li>• city (ciudad) *</li>
                            <li>• country (país) *</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Dimensiones y Precios:</h4>
                          <ul className="space-y-1 text-gray-600">
                            <li>• widthM, heightM (dimensiones)</li>
                            <li>• dailyImpressions (impactos)</li>
                            <li>• lighting (true/false)</li>
                            <li>• priceMonth (precio/mes)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Información Adicional:</h4>
                          <ul className="space-y-1 text-gray-600">
                            <li>• owner (propietario)</li>
                            <li>• description (descripción)</li>
                            <li>• imageUrl (imagen)</li>
                            <li>• googleMapsLink (enlace maps)</li>
                            <li>• code (se genera automáticamente)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <a href="/api/soportes/import/template" className="text-blue-600 hover:text-blue-800 underline">
                          Descargar plantilla CSV
                        </a>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            accept=".csv,text/csv" 
                            onChange={handleCsv}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  onClick={exportPDF}
                  disabled={!someSelected}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Catálogo PDF
                </Button>
                
                <Link href="/panel/soportes/nuevo">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Soporte
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Soportes ({supports.length})</CardTitle>
            <CardDescription>
              Lista de todos los soportes publicitarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Barra de acciones masivas */}
            <BulkActions
              selectedCount={Object.keys(selected).filter(id => selected[id]).length}
              onBulkDelete={bulkDelete}
              onBulkStatusChange={bulkStatusChange}
            />

            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : supports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {q ? "No se encontraron soportes" : "No hay soportes registrados"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                        aria-label="Seleccionar todo"
                      />
                    </TableHead>
                    <TableHead>Código Interno</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Dimensiones</TableHead>
                    <TableHead>Precio/Mes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supports.map((support) => (
                    <TableRow key={support.id}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={!!selected[support.id]}
                          onCheckedChange={(v) =>
                            setSelected(prev => ({ ...prev, [support.id]: Boolean(v) }))
                          }
                          aria-label={`Seleccionar ${support.code}`}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <EditableField 
                          support={support} 
                          field="code" 
                          value={support.code}
                          type="text"
                          onSave={handleFieldSave}
                        />
                      </TableCell>
                      <TableCell className="max-w-[30ch]">
                        <EditableField 
                          support={support} 
                          field="title" 
                          value={support.title}
                          type="text"
                          className="truncate"
                          title={support.title}
                          onSave={handleFieldSave}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableField 
                          support={support} 
                          field="type" 
                          value={support.type}
                          type="select"
                          options={[...TYPE_OPTIONS]}
                          onSave={handleFieldSave}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span 
                            className="text-gray-700 truncate max-w-[18ch]"
                            title={`${support.city}, ${support.country}`}
                          >
                            {support.city}, {support.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-0.5">
                            <EditableField 
                              support={support} 
                              field="widthM" 
                              value={support.widthM}
                              type="number"
                              isNumeric={true}
                              onSave={handleFieldSave}
                            />
                            ×
                            <EditableField 
                              support={support} 
                              field="heightM" 
                              value={support.heightM}
                              type="number"
                              isNumeric={true}
                              onSave={handleFieldSave}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="w-3 h-3" />
                          <EditableField 
                            support={support} 
                            field="priceMonth" 
                            value={support.priceMonth}
                            type="number"
                            isNumeric={true}
                            onSave={handleFieldSave}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <EditableField 
                          support={support} 
                          field="status" 
                          value={support.status}
                          type="select"
                          options={Object.keys(STATUS_META)}
                          onSave={handleFieldSave}
                        />
                      </TableCell>
                      <TableCell>
                        {support.partner ? (
                          <div className="text-sm">
                            <div className="font-medium text-blue-600">
                              {support.partner.companyName || support.partner.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Partner: {support.partner.email}
                            </div>
                          </div>
                        ) : (
                          <EditableField 
                            support={support} 
                            field="owner" 
                            value={support.owner}
                            type="text"
                            className="truncate max-w-[20ch]"
                            title={support.owner || ''}
                            onSave={handleFieldSave}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/soportes/${support.id}`)}
                            title="Ver"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/soportes/${support.id}`)}
                            title="Editar"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(support.id)}
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
