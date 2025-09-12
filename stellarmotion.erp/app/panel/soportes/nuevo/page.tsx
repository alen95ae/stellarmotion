"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, MapPin, Hash, Link as LinkIcon, Upload } from "lucide-react"
import { toast } from "sonner"

// Constantes coherentes con la página de edición
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
  'Argentina','Bolivia','Chile','Colombia','Costa Rica','Ecuador','El Salvador','España','Estados Unidos','Guatemala','Honduras','México','Nicaragua','Panamá','Paraguay','Perú','República Dominicana','Uruguay'
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Argentina': ['Buenos Aires','Córdoba','Rosario','Mendoza','La Plata','Mar del Plata','Salta','Tucumán','Santa Fe','Neuquén'],
  'Bolivia': ['La Paz','Santa Cruz de la Sierra','Cochabamba','El Alto','Sucre','Oruro','Potosí','Tarija','Trinidad','Cobija'],
  'Chile': ['Santiago','Valparaíso','Concepción','Antofagasta','Temuco','La Serena','Iquique','Valdivia','Puerto Montt','Punta Arenas'],
  'Colombia': ['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Bucaramanga','Pereira','Santa Marta','Ibagué','Cúcuta'],
  'Costa Rica': ['San José','Cartago','Alajuela','Heredia','Puntarenas','Limón','Liberia','Pérez Zeledón','Desamparados','Escazú'],
  'Ecuador': ['Quito','Guayaquil','Cuenca','Santo Domingo','Ambato','Manta','Portoviejo','Machala','Loja','Riobamba'],
  'El Salvador': ['San Salvador','Santa Ana','San Miguel','Soyapango','Santa Tecla','Apopa','Delgado','Mejicanos','San Marcos','Usulután'],
  'España': ['Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Palma','Las Palmas','Bilbao'],
  'Estados Unidos': ['Nueva York','Los Ángeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Miami'],
  'Guatemala': ['Ciudad de Guatemala','Mixco','Villa Nueva','Petapa','San Juan Sacatepéquez','Quetzaltenango','Villa Canales','Escuintla','Chinautla','Chimaltenango'],
  'Honduras': ['Tegucigalpa','San Pedro Sula','Choloma','La Ceiba','El Progreso','Choluteca','Comayagua','Puerto Cortés','La Lima','Danlí'],
  'México': ['Ciudad de México','Guadalajara','Monterrey','Puebla','Tijuana','León','Juárez','Torreón','Querétaro','Mérida'],
  'Nicaragua': ['Managua','León','Granada','Masaya','Chinandega','Matagalpa','Estelí','Tipitapa','Jinotepe','Nueva Guinea'],
  'Panamá': ['Ciudad de Panamá','San Miguelito','Tocumen','David','Arraiján','Colón','La Chorrera','Pacora','Penonome','Santiago'],
  'Paraguay': ['Asunción','Ciudad del Este','San Lorenzo','Luque','Capiatá','Lambaré','Fernando de la Mora','Nemby','Encarnación','Mariano Roque Alonso'],
  'Perú': ['Lima','Arequipa','Trujillo','Chiclayo','Huancayo','Piura','Iquitos','Cusco','Chimbote','Tacna'],
  'República Dominicana': ['Santo Domingo','Santiago','Los Alcarrizos','La Romana','San Pedro de Macorís','Higüey','San Francisco de Macorís','Puerto Plata','La Vega','Bonao'],
  'Uruguay': ['Montevideo','Salto','Ciudad de la Costa','Paysandú','Las Piedras','Rivera','Maldonado','Tacuarembó','Melo','Mercedes']
};

export default function NuevoSoportePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
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
    imageUrl: "",
    images: [] as string[], // Array de URLs de imágenes
    googleMapsLink: "",
    description: "",
    city: "",
    country: "",
    priceMonth: ""
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (country: string) => {
    handleChange('country', country);
    handleChange('city', '');
  }

  const availableCities = formData.country ? CITIES_BY_COUNTRY[formData.country] || [] : []

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
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Verificar límite de 5 imágenes
    const currentImageCount = formData.images.length;
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
      toast({
        title: "Error en archivos",
        description: errors.join(', '),
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: `Error al subir ${file.name}`,
          variant: "destructive",
        });
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

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Título es requerido")
      return
    }

    setSaving(true)
    try {
      const dataToSend = {
        code: formData.internalCode,
        title: formData.title,
        type: formData.type,
        status: formData.status,
        widthM: formData.widthM ? parseFloat(formData.widthM) : null,
        heightM: formData.heightM ? parseFloat(formData.heightM) : null,
        dailyImpressions: formData.dailyImpressions,
        lighting: formData.lighting,
        owner: formData.owner,
        imageUrl: formData.imageUrl,
        images: JSON.stringify(formData.images), // Convertir array a JSON string
        description: formData.description,
        city: formData.city,
        country: formData.country,
        priceMonth: formData.priceMonth ? parseFloat(formData.priceMonth) : null
      }

      console.log("Datos a enviar para crear:", dataToSend)

      const response = await fetch('/api/soportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (response.ok) {
        const created = await response.json()
        console.log("Soporte creado:", created)
        toast.success('Soporte creado correctamente')
        router.push(`/panel/soportes/${created.id}`)
      } else {
        const error = await response.json()
        console.error("Error del servidor:", error)
        toast.error(error.error || 'Error al crear el soporte')
      }
    } catch (e) {
      console.error("Error de conexión:", e)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
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
            <div className="text-xl font-bold text-slate-800">Nuevo Soporte</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Crear Nuevo Soporte</h1>
          <p className="text-gray-600">Añade un nuevo soporte publicitario al sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales del soporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="internalCode">Código interno</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="internalCode"
                      value={formData.internalCode}
                      onChange={(e) => handleChange('internalCode', e.target.value)}
                      className="bg-neutral-100 border-neutral-200 text-gray-900 font-mono pl-10"
                      placeholder="Se genera automáticamente (SM-0001, SM-0002...)"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Deja vacío para generar automáticamente</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userCode">Código del usuario</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="userCode"
                      value={formData.userCode}
                      onChange={(e) => handleChange('userCode', e.target.value)}
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
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (máximo 500 caracteres)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value as keyof typeof STATUS_META)}>
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
                  onChange={(e) => handleChange('owner', e.target.value)}
                  placeholder="Propietario del soporte"
                />
              </div>

            </CardContent>
          </Card>

          {/* Características Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle>Características Técnicas</CardTitle>
              <CardDescription>Especificaciones técnicas del soporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de soporte *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
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
                    onChange={(e) => handleNumericChange('widthM', e.target.value)}
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
                    onChange={(e) => handleNumericChange('heightM', e.target.value)}
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
                  onChange={(e) => handleChange('dailyImpressions', e.target.value)}
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
                    {formData.images.length}/5 imágenes
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
                    disabled={formData.images.length >= 5}
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Máximo 5 imágenes, 5MB por imagen. Formatos: JPG, PNG, GIF, WebP
                </p>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            console.error('Error loading image:', imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
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
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>Información de localización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    onChange={(e) => handleChange('googleMapsLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="pl-10"
                  />
                </div>
              </div>

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
              <div className="space-y-2">
                <Label htmlFor="priceMonth">Precio por Mes (€)</Label>
                <Input
                  id="priceMonth"
                  type="number"
                  step="0.01"
                  value={formData.priceMonth}
                  onChange={(e) => handleNumericChange('priceMonth', e.target.value)}
                  placeholder="150.00"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-end">
          <Link href="/panel/soportes">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button 
            onClick={handleSave}
            className="bg-[#D54644] hover:bg-[#B03A38]"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Creando...' : 'Crear Soporte'}
          </Button>
        </div>
      </main>
    </div>
  )
}
