"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Save, MapPin, Upload, Globe } from "lucide-react"
import { toast } from "sonner"
import SupportImage from "@/components/SupportImage"
import Sidebar from "@/components/dashboard/Sidebar"
import { PhotonAutocomplete } from "@/components/PhotonAutocomplete"
import dynamic from "next/dynamic"
import { buildGoogleMapsLinkFromCoords, extractCoordinatesFromGoogleMapsLink } from "@/lib/extract-google-maps-coords"
import GoogleMapsLoader from "@/components/GoogleMapsLoader"

const EditableGoogleMap = dynamic(() => import("@/components/EditableGoogleMap"), { ssr: false })
const StreetViewGoogleMaps = dynamic(() => import("@/components/StreetViewGoogleMaps"), { ssr: false })

const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 }
const MAP_HEIGHT = 380

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
  iluminacion?: boolean
  destacado?: boolean
  createdAt: Date
  updatedAt: Date
}

export default function NuevoSoportePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handler para inputs numéricos normales
  const handleNumericChange = (field: string, value: string) => {
    // Permitir solo números y un punto decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    // Evitar múltiples puntos decimales
    const parts = cleaned.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    handleChange(field, finalValue);
  };

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
        latitud: formData.latitud || null,
        longitud: formData.longitud || null,
        streetViewHeading: formData.streetViewHeading,
        streetViewPitch: formData.streetViewPitch,
        streetViewZoom: formData.streetViewZoom,
        'Propietario': formData.owner,
        'Iluminación': formData.lighting,
        'Destacado': formData.featured
      }
      
      console.log('💾 Enviando datos a la API:', apiData)
      
      const response = await fetch(`/api/soportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || 'Error al crear el soporte')
      }
      
      const result = await response.json()
      console.log('✅ Soporte creado exitosamente:', result)
      
      toast.success("Soporte creado exitosamente")
      router.push('/panel/soportes')
      
    } catch (error) {
      console.error('❌ Error creating support:', error)
      toast.error("Error al crear el soporte")
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price)
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link prefetch={false} href="/panel/soportes" className="text-[#e94446] hover:text-[#d63d3f] font-medium mr-8">
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
                Nuevo Soporte
              </h1>
              <p className="text-gray-600">
                Crear un nuevo soporte publicitario
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/panel/soportes')}
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
                    <Input
                      id="internalCode"
                      value={formData.internalCode}
                      onChange={(e) => setFormData({...formData, internalCode: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="userCode">Código Brand</Label>
                    <Input
                      id="userCode"
                      value={formData.userCode}
                      onChange={(e) => setFormData({...formData, userCode: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Título del Soporte</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo</Label>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Estado</Label>
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
                    </div>
                    
                    <div>
                      <Label htmlFor="owner">Owner</Label>
                      <Input
                        id="owner"
                        value={formData.owner}
                        onChange={(e) => setFormData({...formData, owner: e.target.value})}
                        placeholder="Nombre del owner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="widthM">Ancho (m)</Label>
                    <Input
                      id="widthM"
                      type="number"
                      value={formData.widthM}
                      onChange={(e) => setFormData({...formData, widthM: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="heightM">Alto (m)</Label>
                    <Input
                      id="heightM"
                      type="number"
                      value={formData.heightM}
                      onChange={(e) => setFormData({...formData, heightM: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dailyImpressions">Impresiones Diarias</Label>
                    <Input
                      id="dailyImpressions"
                      type="number"
                      value={formData.dailyImpressions}
                      onChange={(e) => setFormData({...formData, dailyImpressions: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lighting"
                      checked={formData.lighting}
                      onCheckedChange={(checked) => setFormData({...formData, lighting: checked})}
                      className="data-[state=checked]:bg-[#e94446] data-[state=checked]:border-[#e94446]"
                    />
                    <Label htmlFor="lighting">Iluminación</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                      className="data-[state=checked]:bg-[#e94446] data-[state=checked]:border-[#e94446]"
                    />
                    <Label htmlFor="featured">Destacado</Label>
                  </div>

                  <div>
                    <Label htmlFor="priceMonth">Precio por Mes (€)</Label>
                    <Input
                      id="priceMonth"
                      type="number"
                      value={formData.priceMonth}
                      onChange={(e) => setFormData({...formData, priceMonth: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PhotonAutocomplete
                  label="Ciudad"
                  placeholder="Buscar ciudad..."
                  value={formData.city}
                  onChange={(value) => setFormData({...formData, city: value})}
                  type="city"
                />

                <PhotonAutocomplete
                  label="País"
                  placeholder="Buscar país..."
                  value={formData.country}
                  onChange={(value) => setFormData({...formData, country: value})}
                  type="country"
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLink">Enlace de Google Maps</Label>
                <Input
                  id="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={(e) => setFormData({...formData, googleMapsLink: e.target.value})}
                  onBlur={async (e) => {
                    const newLink = e.target.value.trim()
                    if (newLink) {
                      setMapCoordsLoading(true)
                      try {
                        const coords = await extractCoordinatesFromGoogleMapsLink(newLink)
                        if (coords) {
                          setFormData((prev) => ({
                            ...prev,
                            googleMapsLink: newLink,
                            latitud: coords.lat,
                            longitud: coords.lng
                          }))
                          toast.success("Coordenadas extraídas correctamente")
                        } else {
                          toast.error("No se pudieron extraer coordenadas del enlace")
                        }
                      } finally {
                        setMapCoordsLoading(false)
                      }
                    }
                  }}
                  placeholder="Pega el enlace de Google Maps aquí"
                />
                <p className="text-xs text-gray-500 mt-1">Al pegar el enlace, se extraerán las coordenadas y se colocará la chincheta en el mapa.</p>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Ubicación del soporte</Label>
                {mapCoordsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-300 h-[380px] flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500 text-sm">Obteniendo ubicación del enlace...</span>
                    </div>
                    <div className="rounded-lg border border-gray-300 h-[380px] bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Street View</span>
                    </div>
                  </div>
                ) : (
                  <GoogleMapsLoader loadingElement={<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="h-[380px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">Cargando mapa...</div><div className="h-[380px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">Cargando Street View...</div></div>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg overflow-hidden border border-gray-300">
                        <EditableGoogleMap
                          lat={formData.latitud && formData.longitud ? formData.latitud : DEFAULT_MAP_CENTER.lat}
                          lng={formData.latitud && formData.longitud ? formData.longitud : DEFAULT_MAP_CENTER.lng}
                          onChange={(c) => setFormData((prev) => ({
                            ...prev,
                            latitud: c.lat,
                            longitud: c.lng,
                            googleMapsLink: buildGoogleMapsLinkFromCoords(c.lat, c.lng)
                          }))}
                          height={MAP_HEIGHT}
                        />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-300">
                        <StreetViewGoogleMaps
                          lat={formData.latitud && formData.longitud ? formData.latitud : DEFAULT_MAP_CENTER.lat}
                          lng={formData.latitud && formData.longitud ? formData.longitud : DEFAULT_MAP_CENTER.lng}
                          heading={formData.streetViewHeading}
                          pitch={formData.streetViewPitch}
                          zoom={formData.streetViewZoom}
                          height={MAP_HEIGHT}
                          onPovChange={(pov) => setFormData((prev) => ({
                            ...prev,
                            streetViewHeading: pov.heading,
                            streetViewPitch: pov.pitch,
                            streetViewZoom: pov.zoom
                          }))}
                        />
                      </div>
                    </div>
                  </GoogleMapsLoader>
                )}
                <p className="text-sm text-gray-500 mt-2">Arrastra la chincheta o haz clic en el mapa para fijar la ubicación. Las coordenadas se guardan al guardar el soporte.</p>
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </Sidebar>
  )
}