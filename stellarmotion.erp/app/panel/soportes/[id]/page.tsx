"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, MapPin, Trash2, Edit, Eye, Calculator, Hash, Link as LinkIcon, Upload, Globe } from "lucide-react"
import { toast } from "sonner"
import SupportImage from "@/components/SupportImage"
import Sidebar from "@/components/dashboard/Sidebar"
import { PhotonAutocomplete } from "@/components/PhotonAutocomplete"
import dynamic from "next/dynamic"

// Importar LeafletHybridMap dinámicamente para evitar problemas de SSR
const LeafletHybridMap = dynamic(() => import("@/components/LeafletHybridMap"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">Cargando mapa...</div>
})

import type { SupportPoint } from "@/components/LeafletHybridMap"

// Constantes para selects y colores
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

const STATUS_META = {
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-green-100 text-green-800 border-green-200' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-100 text-red-800 border-red-200' },
  MANTENIMIENTO:{ label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 border-gray-200' },
} as const

// COUNTRIES array removed - now using Photon autocomplete

interface Support {
  id: string
  internalCode: string
  userCode: string
  title: string
  type: string
  status: keyof typeof STATUS_META
  widthM: string
  heightM: string
  dailyImpressions: string
  lighting: boolean
  owner: string
  featured: boolean
  imageUrl: string
  images: string[]
  googleMapsLink: string
  description: string
  city: string
  country: string
  priceMonth: string
  available: boolean
  latitud?: number
  longitud?: number
  company?: {
    name: string
  }
  createdTime?: string
  // Campos adicionales de Airtable
  codigoInterno?: string
  codigoCliente?: string
  nombre?: string
  tipo?: string
  estado?: string
  dimensiones?: {
    ancho: number
    alto: number
    area: number
  }
  imagenes?: string[]
  descripcion?: string
  ubicacion?: string
  ciudad?: string
  pais?: string
  precio?: number
  impactosDiarios?: number
  partner?: {
    id: string
    name: string
    companyName?: string
    email: string
  }
}

export default function SoporteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  
  // Obtener el modo desde la URL (ver o editar)
  const mode = searchParams?.get('mode') || 'view'
  const isEditMode = mode === 'edit'
  
  const [support, setSupport] = useState<Support | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isEditMode)
  const [formData, setFormData] = useState({
    internalCode: "",
    userCode: "",
    title: "",
    type: "",
    status: "DISPONIBLE" as keyof typeof STATUS_META,
    widthM: "",
    heightM: "",
    dailyImpressions: "",
    lighting: false,
    owner: "",
    featured: false,
    imageUrl: "",
    images: [] as string[],
    googleMapsLink: "",
    description: "",
    city: "",
    country: "",
    priceMonth: "",
    available: true,
    latitud: 0,
    longitud: 0
  })

  useEffect(() => {
    if (id) {
      fetchSupport()
    }
  }, [id])

  // Actualizar el estado de edición cuando cambie el modo en la URL
  useEffect(() => {
    setEditing(isEditMode)
  }, [isEditMode])

  // Asegurar que los datos se carguen cuando cambie el modo
  useEffect(() => {
    if (id && support) {
      // Re-mapear los datos cuando cambie el modo para asegurar que formData esté actualizado
      setFormData({
        internalCode: support.codigoInterno || support.internalCode || "",
        userCode: support.codigoCliente || support.userCode || "",
        title: support.nombre || support.title || "",
        type: support.tipo || support.type || "",
        status: (() => {
          const supportAny = support as any;
          const estadoValue = support.estado || support.status || supportAny['Estado del soporte'] || supportAny.Estado || support.estado;
          if (!estadoValue) return "DISPONIBLE" as keyof typeof STATUS_META;
          const estadoNormalizado = estadoValue.toString().toUpperCase();
          const estadoMap: Record<string, keyof typeof STATUS_META> = {
            'DISPONIBLE': 'DISPONIBLE',
            'DISPONIBLES': 'DISPONIBLE',
            'RESERVADO': 'RESERVADO',
            'RESERVADOS': 'RESERVADO',
            'OCUPADO': 'OCUPADO',
            'OCUPADOS': 'OCUPADO',
            'MANTENIMIENTO': 'MANTENIMIENTO',
            'MANTENIMIENTOS': 'MANTENIMIENTO',
            'NO_DISPONIBLE': 'MANTENIMIENTO',
            'NO DISPONIBLE': 'MANTENIMIENTO'
          };
          return estadoMap[estadoNormalizado] || 'DISPONIBLE';
        })(),
        widthM: support.dimensiones?.ancho?.toString() || support.widthM || "",
        heightM: support.dimensiones?.alto?.toString() || support.heightM || "",
        dailyImpressions: support.impactosDiarios?.toString() || support.dailyImpressions || "",
        lighting: (() => {
          const supportAny = support as any;
          const iluminacionValue = supportAny.iluminacion || support.lighting || supportAny['Iluminación'] || supportAny.Iluminacion || supportAny.iluminacion;
          if (iluminacionValue === null || iluminacionValue === undefined) return false;
          if (typeof iluminacionValue === 'boolean') return iluminacionValue;
          if (typeof iluminacionValue === 'string') {
            const normalized = iluminacionValue.toLowerCase().trim();
            return normalized === 'true' || normalized === '1' || normalized === 'sí' || normalized === 'si' || normalized === 'yes';
          }
          if (typeof iluminacionValue === 'number') return iluminacionValue > 0;
          return Boolean(iluminacionValue);
        })(),
        owner: support.owner || support.partner?.name || "",
        featured: (() => {
          const supportAny = support as any;
          const destacadoValue = supportAny.destacado || support.featured || supportAny.Destacado || false;
          if (typeof destacadoValue === 'boolean') return destacadoValue;
          if (typeof destacadoValue === 'string') {
            const normalized = destacadoValue.toLowerCase().trim();
            return normalized === 'true' || normalized === '1' || normalized === 'sí' || normalized === 'si' || normalized === 'yes';
          }
          return Boolean(destacadoValue);
        })(),
        imageUrl: support.imagenes?.[0] || support.imageUrl || "",
        images: support.imagenes || support.images || [],
        googleMapsLink: support.googleMapsLink || "",
        description: support.descripcion || support.description || "",
        city: support.ciudad || support.city || "",
        country: support.pais || support.country || "",
        priceMonth: support.precio?.toString() || support.priceMonth || "",
        available: support.available !== false,
        latitud: support.latitud || (support as any).lat || 0,
        longitud: support.longitud || (support as any).lng || 0
      })
    }
  }, [id, support, isEditMode])

  const fetchSupport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/soportes/${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Datos cargados desde Airtable:', data)
        console.log('🔍 Estado desde Airtable:', {
          estado: data.estado,
          status: data.status,
          'Estado del soporte': data['Estado del soporte'],
          'Estado': data.Estado
        })
        console.log('💡 Iluminación desde Airtable:', {
          iluminacion: data.iluminacion,
          lighting: data.lighting,
          'Iluminación': data['Iluminación'],
          'Iluminacion': data.Iluminacion
        })
        
        setSupport(data)
        
        // Mapear todos los campos de Airtable al formulario
        setFormData({
          internalCode: data.codigoInterno || data['Código interno'] || data.internalCode || "",
          userCode: data.codigoCliente || data['Código cliente'] || data.userCode || "",
          title: data.nombre || data['Título del soporte'] || data.title || "",
          type: data.tipo || data['Tipo de soporte'] || data.type || "",
          status: (() => {
            // Intentar diferentes campos de estado desde Airtable
            const estadoValue = data['Estado del soporte'] || data.estado || data.status || data.Estado || data.estado;
            console.log('🎯 Estado encontrado:', estadoValue);
            
            // Normalizar el estado a los valores esperados
            if (!estadoValue) return "DISPONIBLE" as keyof typeof STATUS_META;
            
            const estadoNormalizado = estadoValue.toString().toUpperCase();
            
            // Mapear valores comunes de Airtable a nuestros valores
            const estadoMap: Record<string, keyof typeof STATUS_META> = {
              'DISPONIBLE': 'DISPONIBLE',
              'DISPONIBLES': 'DISPONIBLE',
              'RESERVADO': 'RESERVADO',
              'RESERVADOS': 'RESERVADO',
              'OCUPADO': 'OCUPADO',
              'OCUPADOS': 'OCUPADO',
              'MANTENIMIENTO': 'MANTENIMIENTO',
              'MANTENIMIENTOS': 'MANTENIMIENTO',
              'NO_DISPONIBLE': 'MANTENIMIENTO',
              'NO DISPONIBLE': 'MANTENIMIENTO'
            };
            
            const estadoFinal = estadoMap[estadoNormalizado] || 'DISPONIBLE';
            console.log('✅ Estado final mapeado:', estadoFinal);
            return estadoFinal;
          })(),
          widthM: data.dimensiones?.ancho?.toString() || data.Ancho?.toString() || data.widthM || "",
          heightM: data.dimensiones?.alto?.toString() || data.Alto?.toString() || data.heightM || "",
          dailyImpressions: data.impactosDiarios?.toString() || data['Impactos diarios']?.toString() || data.dailyImpressions || "",
          lighting: (() => {
            // Intentar diferentes campos de iluminación desde Airtable
            const iluminacionValue = data['Iluminación'] || data.iluminacion || data.lighting || data.Iluminacion || data.iluminacion;
            console.log('💡 Iluminación encontrada:', iluminacionValue);
            
            // Convertir a booleano
            if (iluminacionValue === null || iluminacionValue === undefined) return false;
            if (typeof iluminacionValue === 'boolean') return iluminacionValue;
            if (typeof iluminacionValue === 'string') {
              const normalized = iluminacionValue.toLowerCase().trim();
              return normalized === 'true' || normalized === '1' || normalized === 'sí' || normalized === 'si' || normalized === 'yes';
            }
            if (typeof iluminacionValue === 'number') return iluminacionValue > 0;
            
            const iluminacionFinal = Boolean(iluminacionValue);
            console.log('✅ Iluminación final mapeada:', iluminacionFinal);
            return iluminacionFinal;
          })(),
          owner: data['Propietario'] || data.owner || data.partner?.name || "",
          featured: data['Destacado'] || data.featured || false,
          imageUrl: data.imagenes?.[0] || data.imageUrl || "",
          images: data.imagenes || data.images || [],
          googleMapsLink: data['Enlace de Google Maps'] || data.googleMapsLink || "",
          description: data.descripcion || data['Descripción'] || data.description || "",
          city: data.ciudad || data.Ciudad || data.city || "",
          country: data.pais || data.País || data.country || "",
          priceMonth: data['Precio por mes']?.toString() || data.precio?.toString() || data.priceMonth || "",
          available: data.available !== false,
          latitud: data.latitud || data.lat || 0,
          longitud: data.longitud || data.lng || 0
        })
        
        console.log('🎯 FormData mapeado:', {
          internalCode: data.codigoInterno || data.internalCode || "",
          userCode: data.codigoCliente || data.userCode || "",
          title: data.nombre || data.title || "",
          type: data.tipo || data.type || "",
          status: data.estado || data.status || "DISPONIBLE",
          widthM: data.dimensiones?.ancho?.toString() || data.widthM || "",
          heightM: data.dimensiones?.alto?.toString() || data.heightM || "",
          dailyImpressions: data.impactosDiarios?.toString() || data.dailyImpressions || "",
          city: data.ciudad || data.city || "",
          country: data.pais || data.country || "",
          priceMonth: data.precio?.toString() || data.priceMonth || ""
        })
      } else {
        toast.error("Error al cargar el soporte")
      }
    } catch (error) {
      console.error("Error fetching support:", error)
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Mapear los datos del formulario al formato de Airtable
      const airtableData = {
        'Título del soporte': formData.title,
        'Descripción': formData.description,
        'Tipo de soporte': formData.type,
        'Estado del soporte': formData.status,
        'Precio por mes': formData.priceMonth ? parseFloat(formData.priceMonth) : null,
        dimensiones: {
          ancho: formData.widthM ? parseFloat(formData.widthM) : null,
          alto: formData.heightM ? parseFloat(formData.heightM) : null,
          area: formData.widthM && formData.heightM ? 
            parseFloat(formData.widthM) * parseFloat(formData.heightM) : null
        },
        imagenes: formData.images,
        ubicacion: `${formData.city}, ${formData.country}`,
        ciudad: formData.city,
        pais: formData.country,
        'Código interno': formData.internalCode,
        'Código cliente': formData.userCode,
        'Impactos diarios': formData.dailyImpressions ? parseInt(formData.dailyImpressions) : null,
        'Enlace de Google Maps': formData.googleMapsLink,
        'Propietario': formData.owner,
        'Iluminación': formData.lighting,
        'Destacado': formData.featured
      }
      
      console.log('💾 Enviando datos a Airtable:', airtableData)
      
      const response = await fetch(`/api/soportes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData),
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (response.ok) {
        // Intentar leer la respuesta como texto primero
        const responseText = await response.text()
        console.log('📡 Response text:', responseText)
        
        let result = {}
        if (responseText) {
          try {
            result = JSON.parse(responseText)
            console.log('📡 Parsed response:', result)
          } catch (parseError) {
            console.warn('⚠️ No se pudo parsear la respuesta como JSON:', parseError)
            // Si no es JSON válido, usar un objeto vacío
            result = { success: true }
          }
        } else {
          // Si no hay texto, asumir éxito
          result = { success: true }
        }
        
        toast.success("Soporte actualizado correctamente")
        // Redirigir al modo de visualización después de guardar
        const newUrl = `/panel/soportes/${id}?mode=view`
        router.push(newUrl)
        fetchSupport()
      } else {
        // Manejar errores de manera segura
        const responseText = await response.text()
        console.error('❌ Error response text:', responseText)
        
        let errorData = {}
        if (responseText) {
          try {
            errorData = JSON.parse(responseText)
          } catch (parseError) {
            console.warn('⚠️ No se pudo parsear el error como JSON:', parseError)
            errorData = { error: `Error HTTP ${response.status}: ${responseText || 'Sin detalles'}` }
          }
        } else {
          errorData = { error: `Error HTTP ${response.status}: Sin respuesta del servidor` }
        }
        
        console.error('❌ Error data:', errorData)
        toast.error((errorData as any).error || "Error al actualizar el soporte")
      }
    } catch (error) {
      console.error("Error saving support:", error)
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/soportes/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success("Soporte eliminado correctamente")
        router.push('/panel/soportes')
      } else {
        toast.error("Error al eliminar el soporte")
      }
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  // Función para manejar la subida de múltiples imágenes
  const handleImageUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Error al subir imagen');
        }
        
        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(url => url !== null);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validUrls]
    }));
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">Cargando...</div>
        </div>
      </Sidebar>
    )
  }

  if (!support) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">Soporte no encontrado</div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/panel/soportes" className="text-[#e94446] hover:text-[#d63d3f] font-medium mr-8">
              Soportes
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Buscar</span>
            <span className="text-gray-800 font-medium">admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {editing ? "Editar Soporte" : support?.title || "Soporte"}
            </h1>
            <p className="text-gray-600">
              {editing ? "Modifica los datos del soporte" : "Detalles del soporte publicitario"}
            </p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                {/* Solo mostrar botón de editar si estamos en modo view y queremos cambiar a edit */}
                {mode === 'view' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Cambiar a modo edición actualizando la URL
                      const newUrl = `/panel/soportes/${id}?mode=edit`
                      router.push(newUrl)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar soporte?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el soporte "{support?.title || 'este soporte'}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Cambiar a modo visualización
                    const newUrl = `/panel/soportes/${id}?mode=view`
                    router.push(newUrl)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Soporte Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              Información del Soporte
            </CardTitle>
            <CardDescription>
              Detalles principales del soporte publicitario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="internalCode">Código Interno</Label>
                  {editing ? (
                    <Input
                      id="internalCode"
                      value={formData.internalCode}
                      onChange={(e) => setFormData({...formData, internalCode: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.internalCode || support?.internalCode || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="userCode">Código Cliente</Label>
                  {editing ? (
                    <Input
                      id="userCode"
                      value={formData.userCode}
                      onChange={(e) => setFormData({...formData, userCode: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.userCode || support?.userCode || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Título del Soporte</Label>
                  {editing ? (
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.title || support?.title || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  {editing ? (
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.type || support?.type || "N/A"}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    {editing ? (
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as keyof typeof STATUS_META})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_META).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={STATUS_META[formData.status]?.className ?? 'bg-gray-500 text-white'}>
                          {STATUS_META[formData.status]?.label ?? formData.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="partner">Partner</Label>
                    {editing ? (
                      <Input
                        id="partner"
                        value={formData.owner}
                        onChange={(e) => setFormData({...formData, owner: e.target.value})}
                        placeholder="Nombre del partner"
                      />
                    ) : (
                      <div className="mt-1">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {formData.owner || support?.partner?.name || support?.owner || "N/A"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="widthM">Ancho (m)</Label>
                  {editing ? (
                    <Input
                      id="widthM"
                      type="number"
                      value={formData.widthM}
                      onChange={(e) => setFormData({...formData, widthM: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.widthM ? `${formData.widthM}m` : "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="heightM">Alto (m)</Label>
                  {editing ? (
                    <Input
                      id="heightM"
                      type="number"
                      value={formData.heightM}
                      onChange={(e) => setFormData({...formData, heightM: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.heightM ? `${formData.heightM}m` : "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dailyImpressions">Impresiones Diarias</Label>
                  {editing ? (
                    <Input
                      id="dailyImpressions"
                      type="number"
                      value={formData.dailyImpressions}
                      onChange={(e) => setFormData({...formData, dailyImpressions: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.dailyImpressions || "N/A"}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lighting"
                    checked={editing ? formData.lighting : formData.lighting}
                    onCheckedChange={editing ? (checked) => setFormData({...formData, lighting: checked}) : undefined}
                    disabled={!editing}
                    className="data-[state=checked]:bg-[#e94446] data-[state=checked]:border-[#e94446]"
                  />
                  <Label htmlFor="lighting">Iluminación</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={editing ? formData.featured : formData.featured}
                    onCheckedChange={editing ? (checked) => setFormData({...formData, featured: checked}) : undefined}
                    disabled={!editing}
                    className="data-[state=checked]:bg-[#e94446] data-[state=checked]:border-[#e94446]"
                  />
                  <Label htmlFor="featured">Destacado</Label>
                </div>

                <div>
                  <Label htmlFor="priceMonth">Precio por Mes (€)</Label>
                  {editing ? (
                    <Input
                      id="priceMonth"
                      type="number"
                      value={formData.priceMonth}
                      onChange={(e) => setFormData({...formData, priceMonth: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.priceMonth ? formatPrice(parseFloat(formData.priceMonth)) : "No especificado"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="description">Descripción</Label>
              {editing ? (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{formData.description || support?.description || "N/A"}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <Label>Imágenes</Label>
              <div className="mt-2">
                {formData.images && formData.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.images.filter(image => image && typeof image === 'string').map((image, index) => (
                      <div key={index} className="relative">
                        <SupportImage 
                          src={image} 
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {editing && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index)
                              setFormData({...formData, images: newImages})
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Seleccionar archivos
                    </Button>
                  </div>
                )}
                
                {editing && formData.images && formData.images.length > 0 && (
                  <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Agregar más imágenes</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload-more"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload-more')?.click()}
                    >
                      Seleccionar archivos
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {editing ? (
                  <PhotonAutocomplete
                    label="Ciudad"
                    placeholder="Buscar ciudad..."
                    value={formData.city}
                    onChange={(value) => setFormData({...formData, city: value})}
                    type="city"
                  />
                ) : (
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <p className="text-sm text-gray-600 mt-1">{formData.city || support?.city || "N/A"}</p>
                  </div>
                )}
              </div>

              <div>
                {editing ? (
                  <PhotonAutocomplete
                    label="País"
                    placeholder="Buscar país..."
                    value={formData.country}
                    onChange={(value) => setFormData({...formData, country: value})}
                    type="country"
                  />
                ) : (
                  <div>
                    <Label htmlFor="country">País</Label>
                    <p className="text-sm text-gray-600 mt-1">{formData.country || support?.country || "N/A"}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="googleMapsLink">Enlace de Google Maps</Label>
              {editing ? (
                <Input
                  id="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={(e) => setFormData({...formData, googleMapsLink: e.target.value})}
                />
              ) : (
                <div className="mt-1">
                  {formData.googleMapsLink || support?.googleMapsLink ? (
                    <a
                      href={formData.googleMapsLink || support?.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  ) : (
                    <p className="text-sm text-gray-600">No disponible</p>
                  )}
                </div>
              )}
            </div>

            {/* Mapa interactivo */}
            <div>
              <Label>Ubicación en el Mapa</Label>
              <div className="mt-2">
                <LeafletHybridMap
                  points={support?.latitud && support?.longitud ? [{
                    id: support.id || '1',
                    lat: support.latitud,
                    lng: support.longitud,
                    title: support.title || support.nombre || 'Soporte',
                    type: 'billboard' as const,
                    dimensions: support.widthM && support.heightM ? `${support.widthM}m × ${support.heightM}m` : undefined,
                    image: support.imageUrl || support.imagenes?.[0],
                    monthlyPrice: support.priceMonth ? parseFloat(support.priceMonth) : undefined,
                    city: support.city || support.ciudad,
                    format: support.type || support.tipo
                  }] : []}
                  height={400}
                  center={support?.latitud && support?.longitud ? [support.latitud, support.longitud] : [40.4168, -3.7038]}
                  zoom={15}
                />
              </div>
            </div>


          </CardContent>
        </Card>


        {/* Company Info */}
        {support.company && support.company.name && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label>Empresa</Label>
                  <p>{support.company.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      </div>
    </Sidebar>
  )
}