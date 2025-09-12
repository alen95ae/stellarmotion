"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
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
  DISPONIBLE:   { label: 'Disponible',    className: 'bg-emerald-600 text-white' },
  RESERVADO:    { label: 'Reservado',     className: 'bg-amber-500 text-black' },
  OCUPADO:      { label: 'Ocupado',       className: 'bg-red-600 text-white' },
  NO_DISPONIBLE:{ label: 'No disponible', className: 'bg-neutral-900 text-white' },
} as const

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
  internalCode: string
  userCode: string
  title: string
  type: string
  status: keyof typeof STATUS_META
  widthM: number | null
  heightM: number | null
  dailyImpressions: number | null
  lighting: boolean
  owner: string | null
  imageUrl: string | null
  googleMapsLink: string | null
  description: string | null
  city: string | null
  country: string | null
  priceMonth: number | null
  available: boolean
  featured: boolean
  company?: { name: string }
  createdAt: string
  updatedAt: string
}

export default function SoporteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [support, setSupport] = useState<Support | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
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
    images: [] as string[], // Array de URLs de imágenes
    googleMapsLink: "",
    description: "",
    city: "",
    country: "",
    priceMonth: "",
    available: true
  })

  useEffect(() => {
    if (id) {
      fetchSupport()
    }
  }, [id])

  // Refrescar datos cuando se vuelve a la página (por ejemplo, desde la tabla)
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        fetchSupport()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [id])

  const fetchSupport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/soportes/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSupport(data)
        // Parsear imágenes desde el campo images del backend
        let images: string[] = [];
        try {
          if (data.images) {
            if (typeof data.images === 'string') {
              images = JSON.parse(data.images);
            } else if (Array.isArray(data.images)) {
              images = data.images;
            }
            if (!Array.isArray(images)) images = [];
          }
        } catch (e) {
          console.warn('Failed to parse images:', e);
          images = [];
        }

        // Filtrar placeholders y URLs vacías
        images = images.filter(img => 
          img && 
          img.trim() !== '' && 
          !img.includes('placeholder.svg') && 
          !img.includes('placeholder.jpg') &&
          !img.includes('placeholder.png')
        );

        // Si no hay imágenes válidas en el array pero hay imageUrl válida, usarla
        if (images.length === 0 && data.imageUrl && 
            data.imageUrl.trim() !== '' && 
            !data.imageUrl.includes('placeholder.svg') &&
            !data.imageUrl.includes('placeholder.jpg') &&
            !data.imageUrl.includes('placeholder.png')) {
          images = [data.imageUrl];
        }

        setFormData({
          internalCode: String(data.code || ""),
          userCode: data.userCode || "",
          title: data.title || "",
          type: data.type || "",
          status: data.status || "DISPONIBLE",
          widthM: data.widthM?.toString() || "",
          heightM: data.heightM?.toString() || "",
          dailyImpressions: data.dailyImpressions?.toString() || "",
          lighting: data.lighting || false,
          owner: data.owner || "",
          featured: data.featured || false,
          imageUrl: data.imageUrl || "",
          images: images,
          googleMapsLink: data.googleMapsLink || "",
          description: data.description || data.address || "",
          city: data.city || "",
          country: data.country || "",
          priceMonth: data.priceMonth?.toString() || "",
          available: data.available
        })
      } else {
        toast.error("Soporte no encontrado")
        router.push("/panel/soportes")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Función para manejar la subida de múltiples imágenes
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Verificar límite de 5 imágenes
    const currentImageCount = formData.images?.length || 0;
    const remainingSlots = 5 - currentImageCount;

    if (files.length > remainingSlots) {
      errors.push(`Solo puedes subir ${remainingSlots} imagen(es) más. Máximo 5 imágenes.`);
    }

    files.slice(0, remainingSlots).forEach(file => {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} es demasiado grande (máximo 5MB)`);
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} no es una imagen válida`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors.join(', '));
    }

    // Subir archivos válidos
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/uploads', { method: 'POST', body: formData });
        const { url } = await response.json();
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, url]
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Error al subir ${file.name}`);
      }
    }

    // Limpiar el input
    event.target.value = '';
  };

  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCountryChange = (country: string) => {
    handleChange('country', country);
    // Limpiar ciudad cuando cambie el país
    handleChange('city', '');
  };

  // Obtener ciudades del país seleccionado
  const availableCities = formData.country ? CITIES_BY_COUNTRY[formData.country] || [] : [];

  // Handler para inputs numéricos normales
  const handleNumericChange = (field: string, value: string) => {
    // Permitir solo números y un punto decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    // Evitar múltiples puntos decimales
    const parts = cleaned.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    handleChange(field, finalValue);
  };

  const handleSave = async () => {
    if (!formData.internalCode || !formData.title) {
      toast.error("Código interno y título son requeridos")
      return
    }

    setSaving(true)
    
    try {
      // Convertir los valores numéricos a números para enviar al backend
      const dataToSend = {
        ...formData,
        code: formData.internalCode, // El API espera 'code' no 'internalCode'
        priceMonth: formData.priceMonth ? parseFloat(formData.priceMonth) : null,
        widthM: formData.widthM ? parseFloat(formData.widthM) : null,
        heightM: formData.heightM ? parseFloat(formData.heightM) : null,
        images: JSON.stringify(formData.images) // Convertir array a JSON string
      }

      console.log("Datos a enviar:", dataToSend)

      const response = await fetch(`/api/soportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (response.ok) {
        const updated = await response.json()
        console.log("Datos actualizados recibidos:", updated)
        setSupport(updated)
        setEditing(false)
        toast.success("Soporte actualizado correctamente")
        fetchSupport() // Recargar datos
      } else {
        const error = await response.json()
        console.error("Error del servidor:", error)
        toast.error(error.error || "Error al actualizar el soporte")
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/soportes/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Soporte eliminado correctamente")
        router.push("/panel/soportes")
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!support) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">Soporte no encontrado</div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/panel/soportes" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Soportes
            </Link>
            <div className="text-xl font-bold text-slate-800">
              {editing ? "Editando Soporte" : support.title}
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
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
                        Esta acción no se puede deshacer. Se eliminará permanentemente el soporte "{support.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
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
                    setEditing(false)
                    setFormData({
                      internalCode: (support as any).code || (support as any).internalCode || "",
                      userCode: support.userCode || "",
                      title: support.title || "",
                      type: support.type || "",
                      status: support.status || "DISPONIBLE",
                      widthM: support.widthM?.toString() || "",
                      heightM: support.heightM?.toString() || "",
                      dailyImpressions: support.dailyImpressions?.toString() || "",
                      lighting: support.lighting || false,
                      owner: support.owner || "",
                      featured: support.featured || false,
                      imageUrl: support.imageUrl || "",
                      images: formData.images,
                      googleMapsLink: support.googleMapsLink || "",
                      description: support.description || "",
                      city: support.city || "",
                      country: support.country || "",
                      priceMonth: support.priceMonth?.toString() || "",
                      available: support.available
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-[#D54644] hover:bg-[#B03A38]"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {editing ? "Editar Soporte" : support.title}
            </h1>
            <p className="text-gray-600">
              {editing ? "Modifica la información del soporte" : "Detalles del soporte publicitario"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales del soporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internalCode">Código interno *</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="internalCode"
                          value={formData.internalCode}
                          onChange={(e) => handleChange("internalCode", e.target.value)}
                          className="bg-neutral-100 border-neutral-200 text-gray-900 font-mono pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userCode">Código del usuario</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="userCode"
                          value={formData.userCode}
                          onChange={(e) => handleChange("userCode", e.target.value)}
                          className="pl-10"
                          placeholder="Ej: VLL-001, MUP-A23"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del soporte *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (máximo 500 caracteres)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description?.length || 0}/500 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value as keyof typeof STATUS_META)}>
                      <SelectTrigger className="bg-white dark:bg-white text-gray-900 border border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-md">
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

                  <div className="space-y-2">
                    <Label htmlFor="owner">Propietario</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => handleChange("owner", e.target.value)}
                      placeholder="Propietario del soporte"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <Label htmlFor="featured" className="text-sm font-medium">Publicar en la Web</Label>
                      </div>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleChange("featured", checked)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.featured 
                        ? "Este soporte será visible en la web pública" 
                        : "Este soporte solo será visible en el panel de administración"
                      }
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Código interno</Label>
                      <p className="font-mono font-medium">{support.internalCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Código del usuario</Label>
                      <p className="font-mono">{support.userCode || "No especificado"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                    <p>{support.description || "No especificada"}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Estado</Label>
                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${STATUS_META[support.status]?.className || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_META[support.status]?.label || support.status}
                    </span>
                  </div>

                  {support.owner && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Propietario</Label>
                      <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-sky-700 text-white">
                        {support.owner}
                      </span>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Publicación Web</Label>
                    <div className="flex items-center space-x-2">
                      <Globe className={`w-4 h-4 ${support.featured ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                        support.featured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {support.featured ? 'Publicado en la Web' : 'Solo Panel Admin'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Características Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle>Características Técnicas</CardTitle>
              <CardDescription>Especificaciones técnicas del soporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de soporte *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                      <SelectTrigger className="bg-white dark:bg-white text-gray-900 border border-gray-200">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-md">
                        {TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="widthM">Ancho (m)</Label>
                      <Input
                        id="widthM"
                        type="number"
                        step="0.1"
                        value={formData.widthM}
                        onChange={(e) => handleNumericChange("widthM", e.target.value)}
                        placeholder="10.0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="heightM">Alto (m)</Label>
                      <Input
                        id="heightM"
                        type="number"
                        step="0.1"
                        value={formData.heightM}
                        onChange={(e) => handleNumericChange("heightM", e.target.value)}
                        placeholder="4.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyImpressions">Impactos Diarios</Label>
                    <Input
                      id="dailyImpressions"
                      type="number"
                      value={formData.dailyImpressions}
                      onChange={(e) => handleChange("dailyImpressions", e.target.value)}
                      placeholder="65000"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Iluminación</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D7514C] ${formData.lighting ? 'bg-[#D7514C]' : 'bg-gray-300'}`}
                      onClick={() => handleChange('lighting', !formData.lighting)}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.lighting ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="images">Imágenes del soporte</Label>
                      <span className="text-sm text-gray-500">
                        {formData.images?.length || 0}/5 imágenes
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        className="pl-10 w-full"
                        onChange={handleImageUpload}
                        disabled={(formData.images?.length || 0) >= 5}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Máximo 5 imágenes, 5MB por imagen. Formatos: JPG, PNG, GIF, WebP
                    </p>

                    {(formData.images?.length || 0) > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {(formData.images || []).map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <SupportImage
                              src={imageUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                    <Badge variant="secondary">{support.type}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ancho</Label>
                      <p>{support.widthM ? `${support.widthM}m` : "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Alto</Label>
                      <p>{support.heightM ? `${support.heightM}m` : "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Impactos Diarios</Label>
                    <p>{support.dailyImpressions ? support.dailyImpressions.toLocaleString() : "No especificado"}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Iluminación</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm ${support.lighting ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        {support.lighting ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>

                  {(formData.images?.length || 0) > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Imágenes ({formData.images?.length || 0})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {(formData.images || []).map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <SupportImage
                              src={imageUrl}
                              alt={`Imagen ${index + 1} del soporte`}
                              className="w-full h-32 object-cover rounded-md border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>Información de localización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">País *</Label>
                      <Select value={formData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Select 
                        value={formData.city} 
                        onValueChange={(value) => handleChange('city', value)}
                        disabled={!formData.country}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder={formData.country ? "Seleccionar" : "Primero selecciona un país"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="googleMapsLink">Enlace de Google Maps</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="googleMapsLink"
                        type="url"
                        value={formData.googleMapsLink}
                        onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Ve a Google Maps, busca tu ubicación, haz clic en "Compartir" y pega el enlace aquí
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ciudad</Label>
                      <p>{support.city || "No especificada"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">País</Label>
                      <p>{support.country || "No especificado"}</p>
                    </div>
                  </div>
                  
                  {support.googleMapsLink && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Google Maps</Label>
                      <a 
                        href={support.googleMapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Ver ubicación en Google Maps
                      </a>
                    </div>
                  )}
                </>
              )}
              
              {/* Placeholder para mapa futuro */}
              <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Mapa de ubicación</p>
                  <p className="text-xs">Integración con Google Maps próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
              <CardDescription>Información de tarifas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-2">
                  <Label htmlFor="priceMonth">Precio por Mes (€)</Label>
                  <Input
                    id="priceMonth"
                    type="number"
                    step="0.01"
                    value={formData.priceMonth}
                    onChange={(e) => handleNumericChange("priceMonth", e.target.value)}
                    placeholder="150.00"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Precio por Mes</Label>
                  <p className="text-lg font-semibold">{formatPrice(support.priceMonth)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información del Sistema */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-sm font-medium text-gray-700">Creado</Label>
                <p>{formatDate(support.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Última actualización</Label>
                <p>{formatDate(support.updatedAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Empresa</Label>
                <p>{support.company?.name || "No asignada"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}