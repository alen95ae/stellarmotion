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
  const [editingField, setEditingField] = useState<{id: string, field: string} | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const router = useRouter()

  // Función para convertir dígitos a número decimal
  const numericFromDigits = (value: string): number => {
    const cleaned = (value || '').replace(/[^\d]/g, '');
    if (cleaned.length === 0) return 0;
    
    // Un dígito: tratarlo como 0.X (ej: "4" → 0.4)
    if (cleaned.length === 1) {
      return parseFloat(`0.${cleaned}`);
    }
    
    // Múltiples dígitos: dividir por 10 para obtener el decimal
    // "450" → 450 / 10 = 45.0
    // "453" → 453 / 10 = 45.3
    // "3500" → 3500 / 10 = 350.0
    return parseFloat(cleaned) / 10;
  };

  // Función para formatear la visualización
  const formatNumericInput = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length === 0) return '';
    
    const numericValue = numericFromDigits(cleaned);
    return numericValue.toFixed(1);
  };

  // Handler para el input numérico
  const handleNumericInputChange = (field: string, inputValue: string, setter: (value: string) => void) => {
    const cleaned = inputValue.replace(/[^\d]/g, ''); // Solo dígitos
    setter(cleaned);
  };

  // Funciones para edición inline
  const startEditing = (id: string, field: string, currentValue: any) => {
    setEditingField({ id, field });
    // Para campos numéricos, convertir el valor a dígitos para edición
    if (['priceMonth', 'widthM', 'heightM'].includes(field) && currentValue) {
      // Convertir de decimal a dígitos para edición
      const valueStr = currentValue.toString();
      if (valueStr.includes('.')) {
        const [integer, decimal] = valueStr.split('.');
        setEditingValue(integer + decimal);
      } else {
        setEditingValue(valueStr);
      }
    } else {
      setEditingValue(currentValue?.toString() || '');
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const saveInlineEdit = async () => {
    if (!editingField) return;
    
    const { id, field } = editingField;
    let value = editingValue;
    
    // Convertir valores numéricos si es necesario
    if (['priceMonth', 'widthM', 'heightM'].includes(field)) {
      // Usar directamente el valor formateado que se muestra en pantalla
      value = formatNumericInput(editingValue);
    }
    
    try {
      // Actualizar directamente en el backend
      const response = await fetch(`/api/soportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: field === 'code' ? value : supports.find(s => s.id === id)?.code,
          title: supports.find(s => s.id === id)?.title,
          [field]: value 
        })
      });
      
      if (response.ok) {
        // Actualizar el soporte localmente
        setSupports(prev => prev.map(support => 
          support.id === id 
            ? { ...support, [field]: field === 'priceMonth' || field === 'widthM' || field === 'heightM' 
                ? parseFloat(value) 
                : value }
            : support
        ));
        toast.success("Campo actualizado correctamente");
        cancelEditing();
      } else {
        toast.error("Error al actualizar el campo");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // Componente para campos editables inline
  const EditableField = ({ 
    support, 
    field, 
    value, 
    type = 'text', 
    options = null,
    isNumeric = false,
    className = '',
    title = ''
  }: {
    support: Support;
    field: string;
    value: any;
    type?: 'text' | 'select' | 'number';
    options?: string[] | null;
    isNumeric?: boolean;
    className?: string;
    title?: string;
  }) => {
    const isEditing = editingField?.id === support.id && editingField?.field === field;
    
    // Campos que no se pueden editar
    const nonEditableFields = ['widthM', 'heightM', 'priceMonth'];
    const isNonEditable = nonEditableFields.includes(field);
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          {type === 'select' && options ? (
            <Select value={editingValue} onValueChange={setEditingValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option} value={option}>
                    <div className="flex items-center gap-2">
                      {field === 'status' ? (
                        <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${STATUS_META[option as keyof typeof STATUS_META]?.className || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_META[option as keyof typeof STATUS_META]?.label || option}
                        </span>
                      ) : (
                        option
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="text"
              value={isNumeric ? formatNumericInput(editingValue) : editingValue}
              onChange={(e) => {
                if (isNumeric) {
                  const cleaned = e.target.value.replace(/[^\d]/g, '');
                  setEditingValue(cleaned);
                } else {
                  setEditingValue(e.target.value);
                }
              }}
              className="h-10 text-sm min-w-[120px]"
              placeholder={isNumeric ? "00.0" : ""}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveInlineEdit();
                if (e.key === 'Escape') cancelEditing();
              }}
            />
          )}
          <Button size="sm" variant="ghost" onClick={saveInlineEdit} className="h-6 w-6 p-0">
            ✓
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
            ✕
          </Button>
        </div>
      );
    }
    
    const content = (
      <div 
        className={`p-1 rounded min-h-[32px] flex items-center ${className} ${
          isNonEditable 
            ? 'cursor-not-allowed opacity-60' 
            : 'cursor-pointer hover:bg-gray-100'
        }`}
        onClick={isNonEditable ? undefined : () => startEditing(support.id, field, value)}
        title={title}
      >
        {field === 'status' ? (
          <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${STATUS_META[value as keyof typeof STATUS_META]?.className || 'bg-gray-100 text-gray-800'}`}>
            {STATUS_META[value as keyof typeof STATUS_META]?.label || value}
          </span>
        ) : field === 'owner' ? (
          <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-gray-600 text-white">
            {value || '—'}
          </span>
        ) : field === 'code' ? (
          <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-gray-800 border border-neutral-200">
            {value || '—'}
          </span>
        ) : type === 'select' && options ? (
          <Badge variant="secondary">{value || '—'}</Badge>
        ) : isNumeric ? (
          <span>{
            typeof value === 'number'
              ? value.toFixed(1)
              : (value ? formatNumericInput(String(value)) : '—')
          }</span>
        ) : (
          <span>{value || '—'}</span>
        )}
      </div>
    );

    // Si el campo no es editable, envolver con tooltip
    if (isNonEditable) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent>
              <p>Este campo no se puede editar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  useEffect(() => {
    const ctrl = new AbortController()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (statusFilter.length) params.set('status', statusFilter.join(','))
    
    fetch(`/api/soportes?${params.toString()}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(setSupports)
      .catch(() => {})
    
    return () => ctrl.abort()
  }, [q, statusFilter])

  useEffect(() => {
    fetchSupports()
  }, [])

  const fetchSupports = async (query = "") => {
    try {
      setLoading(true)
      const response = await fetch(`/api/soportes?q=${encodeURIComponent(query)}`)
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

  async function bulkUpdate(patch: any) {
    const ids = Object.keys(selected).filter(id => selected[id])
    try {
      const response = await fetch('/api/soportes/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'update', data: patch })
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

  async function bulkDelete() {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (!confirm(`¿Eliminar ${ids.length} soportes?`)) return
    
    await fetch('/api/soportes/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'delete' })
    })
    fetchSupports()
    setSelected({})
    toast.success(`${ids.length} soportes eliminados`)
  }

  async function bulkStatusChange(newStatus: string) {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (!confirm(`¿Cambiar estado de ${ids.length} soportes a ${STATUS_META[newStatus as keyof typeof STATUS_META]?.label}?`)) return
    
    await fetch('/api/soportes/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'update', data: { status: newStatus } })
    })
    fetchSupports()
    setSelected({})
    toast.success(`${ids.length} soportes actualizados`)
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
            {/* Barra de acciones simplificada */}
            {someSelected && (
              <div className="mb-6 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {Object.keys(selected).filter(id => selected[id]).length} soportes seleccionados
                    </h3>
                    <p className="text-xs text-gray-600">Acciones disponibles para los soportes seleccionados</p>
                      </div>
                  
                  <div className="flex gap-2">
                    {/* Cambiar estado masivo */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Cambiar Estado
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.entries(STATUS_META).map(([key, meta]) => (
                          <DropdownMenuItem 
                            key={key} 
                            onClick={() => bulkStatusChange(key)}
                            className="cursor-pointer"
                          >
                            <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${meta.className}`}>
                              {meta.label}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Eliminar */}
                    <Button variant="destructive" size="sm" onClick={bulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>

                    {/* Deseleccionar todo */}
                    <Button variant="ghost" size="sm" onClick={() => setSelected({})} className="text-gray-600">
                      Deseleccionar
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                        />
                      </TableCell>
                      <TableCell className="max-w-[40ch]">
                        <EditableField 
                          support={support} 
                          field="title" 
                          value={support.title}
                          type="text"
                          className="truncate"
                          title={support.title}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableField 
                          support={support} 
                          field="type" 
                          value={support.type}
                          type="select"
                          options={[...TYPE_OPTIONS]}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span className="text-gray-700 truncate max-w-[18ch]" title={`${support.city}, ${support.country}`}>
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
                            />
                            ×
                            <EditableField 
                              support={support} 
                              field="heightM" 
                              value={support.heightM}
                              type="number"
                              isNumeric={true}
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
                        />
                      </TableCell>
                      <TableCell>
                        <EditableField 
                          support={support} 
                          field="owner" 
                          value={support.owner}
                          type="text"
                          className="truncate max-w-[15ch]"
                          title={support.owner || ''}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/soportes/${support.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/panel/soportes/${support.id}`)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
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
