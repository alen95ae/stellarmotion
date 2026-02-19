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
import { PhotonAutocomplete } from "@/components/PhotonAutocomplete"
import dynamic from "next/dynamic"
import { buildGoogleMapsLinkFromCoords, extractCoordinatesFromGoogleMapsLink } from "@/lib/extract-google-maps-coords"
import GoogleMapsLoader from "@/components/GoogleMapsLoader"

const EditableGoogleMap = dynamic(() => import("@/components/EditableGoogleMap"), { ssr: false })
const StreetViewGoogleMaps = dynamic(() => import("@/components/StreetViewGoogleMaps"), { ssr: false })

const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 }

const MAP_HEIGHT = 380

/** Convierte owner (objeto con id, empresa, nombre, apellidos, email o string) a string para mostrar/guardar. */
function ownerDisplayString(owner: any): string {
  if (owner == null) return ""
  if (typeof owner === "string") return owner
  return (
    (owner as any).name ||
    [(owner as any).nombre, (owner as any).apellidos].filter(Boolean).join(" ") ||
    (owner as any).empresa ||
    (owner as any).email ||
    ""
  )
}

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
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
  MANTENIMIENTO:{ label: 'Mantenimiento', className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
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
  streetViewHeading?: number
  streetViewPitch?: number
  streetViewZoom?: number
  company?: {
    name: string
  }
  createdTime?: string
  // Campos adicionales
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
  owner?: {
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
  const mode = searchParams?.get('mode') || 'edit'
  const isEditMode = mode === 'edit'
  // Si alguien entra con mode=view, abrir soporte en la web y pasar a edición
  useEffect(() => {
    if (mode === 'view' && id) {
      const siteUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : 'http://localhost:3001'
      window.open(`${siteUrl}/product/${id}`, '_blank')
      router.replace(`/panel/soportes/${id}?mode=edit`)
    }
  }, [mode, id, router])
  
  const [support, setSupport] = useState<Support | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isEditMode)
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false)
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
    longitud: 0,
    streetViewHeading: 0,
    streetViewPitch: 0,
    streetViewZoom: 1
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
        owner: ownerDisplayString(support.owner) || "",
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
        longitud: support.longitud || (support as any).lng || 0,
        streetViewHeading: (support as any).streetViewHeading ?? 0,
        streetViewPitch: (support as any).streetViewPitch ?? 0,
        streetViewZoom: (support as any).streetViewZoom ?? 1
      })
    }
  }, [id, support, isEditMode])

  const fetchSupport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/soportes/${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Datos cargados desde la API:', data)
        console.log('🔍 Estado desde la API:', {
          estado: data.estado,
          status: data.status,
          'Estado del soporte': data['Estado del soporte'],
          'Estado': data.Estado
        })
        console.log('💡 Iluminación desde la API:', {
          iluminacion: data.iluminacion,
          lighting: data.lighting,
          'Iluminación': data['Iluminación'],
          'Iluminacion': data.Iluminacion
        })
        
        setSupport(data)
        
        // Mapear todos los campos de la API al formulario
        setFormData({
          internalCode: data.codigoInterno || data['Código interno'] || data.internalCode || "",
          userCode: data.codigoCliente || data['Código cliente'] || data.userCode || "",
          title: data.nombre || data['Título del soporte'] || data.title || "",
          type: data.tipo || data['Tipo de soporte'] || data.type || "",
          status: (() => {
            // Intentar diferentes campos de estado desde la API
            const estadoValue = data['Estado del soporte'] || data.estado || data.status || data.Estado || data.estado;
            console.log('🎯 Estado encontrado:', estadoValue);
            
            // Normalizar el estado a los valores esperados
            if (!estadoValue) return "DISPONIBLE" as keyof typeof STATUS_META;
            
            const estadoNormalizado = estadoValue.toString().toUpperCase();
            
            // Mapear valores comunes de la API a nuestros valores
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
            // Intentar diferentes campos de iluminación desde la API
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
          owner: (typeof data["Propietario"] === "string" ? data["Propietario"] : "") || ownerDisplayString(data.owner) || "",
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
          longitud: data.longitud || data.lng || 0,
          streetViewHeading: data.streetViewHeading ?? data.street_view_heading ?? 0,
          streetViewPitch: data.streetViewPitch ?? data.street_view_pitch ?? 0,
          streetViewZoom: data.streetViewZoom ?? data.street_view_zoom ?? 1
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
      
      // Mapear los datos del formulario al formato de la API
      const apiData = {
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
        latitud: formData.latitud ?? null,
        longitud: formData.longitud ?? null,
        streetViewHeading: formData.streetViewHeading,
        streetViewPitch: formData.streetViewPitch,
        streetViewZoom: formData.streetViewZoom,
        'Propietario': formData.owner,
        'Iluminación': formData.lighting,
        'Destacado': formData.featured
      }
      
      console.log('💾 Enviando datos a la API:', apiData)
      
      const response = await fetch(`/api/soportes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
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
    if (!id) {
      toast.error('No se puede subir imágenes sin un ID de soporte');
      return;
    }

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('soporteId', id);
      
      try {
        toast.loading(`Subiendo ${file.name}...`);
        const response = await fetch('/api/soportes/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir imagen');
        }
        
        const data = await response.json();
        toast.success(`Imagen ${file.name} subida exitosamente`);
        return data.publicUrl || data.path;
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error(`Error al subir ${file.name}: ${error.message}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(url => url !== null);
    
    if (validUrls.length > 0) {
      // Recargar el soporte para obtener las imágenes actualizadas
      await fetchSupport();
    }
  };

  const handleImageDelete = async (imagePath: string, index: number) => {
    if (!id) {
      toast.error('No se puede eliminar imágenes sin un ID de soporte');
      return;
    }

    try {
      toast.loading('Eliminando imagen...');
      
      // Extraer el path relativo si es una URL completa
      let pathToDelete = imagePath;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        const match = imagePath.match(/\/storage\/v1\/object\/public\/soportes\/(.+)$/);
        if (match) {
          pathToDelete = match[1];
        }
      }

      const response = await fetch(`/api/soportes/upload?soporteId=${id}&path=${encodeURIComponent(pathToDelete)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar imagen');
      }

      toast.success('Imagen eliminada exitosamente');
      
      // Recargar el soporte para obtener las imágenes actualizadas
      await fetchSupport();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(`Error al eliminar imagen: ${error.message}`);
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!support) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Soporte no encontrado</div>
      </div>
    )
  }

  if (mode === 'view') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Redirigiendo a la web...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {editing ? "Editar Soporte" : support?.title || "Soporte"}
            </h1>
            <p className="text-muted-foreground">
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
                      const newUrl = `/panel/soportes/${id}?mode=edit`
                      router.push(newUrl)
                    }}
                    className="border-border text-foreground hover:bg-muted dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-border text-red-600 hover:bg-red-600/10 hover:text-red-600 dark:border-red-600 dark:text-red-600 dark:hover:bg-red-600/10 dark:hover:border-red-600 dark:hover:text-red-600">
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
                  onClick={() => router.push('/panel/soportes')}
                  className="border-border text-foreground hover:bg-muted hover:text-foreground dark:border-[#404040] dark:text-[#D1D1D1] dark:hover:bg-[#1E1E1E] dark:hover:text-[#FFFFFF]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#e94446] hover:bg-[#D7514C] text-white shadow-[0_0_12px_rgba(233,68,70,0.45)] hover:shadow-[0_0_20px_rgba(233,68,70,0.6)] dark:text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Soporte Details */}
        <Card className="dark:bg-[#141414] dark:border-[#1E1E1E]">
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
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.internalCode || support?.internalCode || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="userCode">Código Brand</Label>
                  {editing ? (
                    <Input
                      id="userCode"
                      value={formData.userCode}
                      onChange={(e) => setFormData({...formData, userCode: e.target.value})}
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.userCode || support?.userCode || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Título del Soporte</Label>
                  {editing ? (
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.title || support?.title || "N/A"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  {editing ? (
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                        {TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type} className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.type || support?.type || "N/A"}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    {editing ? (
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as keyof typeof STATUS_META})}>
                        <SelectTrigger className="overflow-hidden dark:bg-[#1E1E1E] dark:hover:bg-[#2a2a2a] dark:border-[#1E1E1E] dark:text-foreground">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#141414] dark:border-[#1E1E1E]">
                          {Object.entries(STATUS_META).map(([key, value]) => (
                            <SelectItem key={key} value={key} className="dark:focus:bg-[#1e1e1e] dark:hover:bg-[#1e1e1e] dark:focus:text-foreground dark:hover:text-foreground">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${value.className}`} />
                                {value.label}
                              </div>
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
                    <Label htmlFor="owner">Owner</Label>
                    {editing ? (
                      <Input
                        id="owner"
                        value={typeof formData.owner === "string" ? formData.owner : ownerDisplayString(formData.owner)}
                        onChange={(e) => setFormData({...formData, owner: e.target.value})}
                        placeholder="Nombre del owner"
                        className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                      />
                    ) : (
                      <div className="mt-1">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                          {ownerDisplayString(formData.owner) || ownerDisplayString(support?.owner) || "N/A"}
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
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.widthM ? `${formData.widthM}m` : "N/A"}</p>
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
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.heightM ? `${formData.heightM}m` : "N/A"}</p>
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
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{formData.dailyImpressions || "N/A"}</p>
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
                      className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
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
                  className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{formData.description || support?.description || "N/A"}</p>
              )}
            </div>

            {/* Images - proporción 4/3 como en marketplace */}
            <div>
              <Label>Imágenes</Label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {formData.images.filter(image => image && typeof image === 'string').map((image, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden group bg-muted border border-border">
                    <img src={image} className="w-full h-full object-cover" alt={`Soporte ${index + 1}`} />
                    {editing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleImageDelete(image, index)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {editing && (
                  <label className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-blue-500 hover:bg-muted/50 flex flex-col items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-blue-600">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-xs">Subir</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
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
                    <p className="text-sm text-muted-foreground mt-1">{formData.city || support?.city || "N/A"}</p>
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
                    <p className="text-sm text-muted-foreground mt-1">{formData.country || support?.country || "N/A"}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="googleMapsLink">Enlace de Google Maps</Label>
              {editing ? (
                <div className="space-y-2">
                  <Input
                    id="googleMapsLink"
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData({...formData, googleMapsLink: e.target.value})}
                    className="focus-visible:border-[#e94446] focus-visible:ring-[#e94446]/50"
                    onBlur={async (e) => {
                      const newLink = e.target.value.trim();
                      if (newLink) {
                        setMapCoordsLoading(true);
                        try {
                          const coords = await extractCoordinatesFromGoogleMapsLink(newLink);
                          if (coords) {
                            setFormData(prev => ({
                              ...prev,
                              googleMapsLink: newLink,
                              latitud: coords.lat,
                              longitud: coords.lng
                            }));
                            toast.success('Coordenadas extraídas correctamente');
                          } else {
                            toast.error('No se pudieron extraer coordenadas del enlace');
                          }
                        } finally {
                          setMapCoordsLoading(false);
                        }
                      }
                    }}
                    placeholder="Pega el enlace de Google Maps aquí"
                  />
                  <p className="text-xs text-muted-foreground">
                    Al pegar el enlace, se extraerán automáticamente las coordenadas.
                  </p>
                </div>
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
                    <p className="text-sm text-muted-foreground">No disponible</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">Ubicación del soporte</Label>
              <div className="w-full rounded-xl border border-border bg-background overflow-hidden" style={{ height: MAP_HEIGHT }}>
                {mapCoordsLoading ? (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted">Cargando mapa...</div>
                ) : (
                  <GoogleMapsLoader loadingElement={<div className="h-full bg-muted flex items-center justify-center text-muted-foreground">Cargando...</div>}>
                    <div className="grid grid-cols-2 gap-3 h-full w-full">
                      <div className="bg-muted h-full overflow-hidden">
                        <EditableGoogleMap
                          lat={formData.latitud ?? support?.latitud ?? DEFAULT_MAP_CENTER.lat}
                          lng={formData.longitud ?? support?.longitud ?? DEFAULT_MAP_CENTER.lng}
                          height={MAP_HEIGHT}
                          onChange={editing ? (c) => setFormData((prev) => ({
                            ...prev,
                            latitud: c.lat,
                            longitud: c.lng,
                            googleMapsLink: buildGoogleMapsLinkFromCoords(c.lat, c.lng)
                          })) : undefined}
                        />
                      </div>
                      <div className="bg-muted h-full overflow-hidden">
                        <StreetViewGoogleMaps
                          lat={formData.latitud ?? support?.latitud ?? DEFAULT_MAP_CENTER.lat}
                          lng={formData.longitud ?? support?.longitud ?? DEFAULT_MAP_CENTER.lng}
                          heading={formData.streetViewHeading}
                          pitch={formData.streetViewPitch}
                          zoom={formData.streetViewZoom}
                          height={MAP_HEIGHT}
                          onPovChange={editing ? (pov) => setFormData((prev) => ({
                            ...prev,
                            streetViewHeading: pov.heading,
                            streetViewPitch: pov.pitch,
                            streetViewZoom: pov.zoom
                          })) : undefined}
                        />
                      </div>
                    </div>
                  </GoogleMapsLoader>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Arrastra la chincheta o haz clic en el mapa para fijar la ubicación. Las coordenadas se guardan en la base de datos.</p>
            </div>

          </CardContent>
        </Card>


        {/* Company Info */}
        {support.company && support.company.name && (
          <Card className="mt-6 dark:bg-[#141414] dark:border-[#1E1E1E]">
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
  )
}