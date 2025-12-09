'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin, DollarSign, Ruler, Lightbulb, Pencil, Eye, Globe, Link, Hash, ArrowLeft } from 'lucide-react';

interface Support {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  tags: string;
  images: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  lat: number;
  lng: number;
  pricePerMonth: number;
  printingCost: number;
  rating: number;
  reviewsCount: number;
  categoryId: string;
  status: string;
  available: boolean;
  address: string;
  googleMapsLink?: string; // Enlace de Google Maps
  createdAt: string;
  updatedAt: string;
  code?: string;
}

interface FormData {
  title: string;
  pricePerMonth: string;
  images: File[];
  city: string;
  country: string;
  width: string;
  height: string;
  lighting: boolean;
  type: string;
  code: string;
  dailyImpressions: string;
  description: string;
  googleMapsLink: string;
  status: string;
}

const TYPES = [
  'Parada de bus',
  'Mupi',
  'Valla',
  'Pantalla',
  'Display',
  'Cartelera',
  'Mural',
  'Letrero'
];

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

interface EditarSoporteClientProps {
  supportId: string;
}

export default function EditarSoporteClient({ supportId }: EditarSoporteClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [support, setSupport] = useState<Support | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    pricePerMonth: '',
    images: [],
    city: '',
    country: '',
    width: '',
    height: '',
    lighting: false,
    type: '',
    code: '',
    dailyImpressions: '',
    description: '',
    googleMapsLink: '',
    status: 'DISPONIBLE'
  });

  // Cargar datos del soporte
  useEffect(() => {
    const fetchSupport = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/soportes/${supportId}`);
        if (!response.ok) {
          throw new Error('Soporte no encontrado');
        }
        const supportData = await response.json();
        setSupport(supportData);
        
        // Extraer dimensiones
        const dimensionsMatch = supportData.dimensions?.match(/(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)/);
        const width = dimensionsMatch ? dimensionsMatch[1] : '';
        const height = dimensionsMatch ? dimensionsMatch[2] : '';
        
        setFormData({
          title: supportData.title || '',
          pricePerMonth: supportData.pricePerMonth?.toString() || '',
          images: [],
          city: supportData.city || '',
          country: supportData.country || '',
          width: width,
          height: height,
          lighting: supportData.lighting || false,
          type: supportData.type || '',
          code: supportData.code || '',
          dailyImpressions: supportData.dailyImpressions?.toString() || '',
          description: supportData.description || '',
          googleMapsLink: supportData.googleMapsLink || '', // Cargar el enlace existente
          status: supportData.status || 'DISPONIBLE'
        });
      } catch (error) {
        console.error('Error fetching support:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el soporte",
          variant: "destructive",
        });
        router.push('/panel/soportes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupport();
  }, [supportId, router, toast]);

  const handleInputChange = (field: keyof FormData, value: string | boolean | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = (country: string) => {
    handleInputChange('country', country);
    // Limpiar ciudad cuando cambie el país
    handleInputChange('city', '');
  };

  // Obtener ciudades del país seleccionado
  const availableCities = formData.country ? CITIES_BY_COUNTRY[formData.country] || [] : [];

  // Función para extraer coordenadas del enlace de Google Maps
  const extractCoordinatesFromGoogleMapsLink = (link: string): { lat: number | null, lng: number | null } => {
    if (!link) return { lat: null, lng: null };

    // Patrones para diferentes formatos de Google Maps
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng
      /query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query=lat,lng (API format)
      /center=(-?\d+\.\d+),(-?\d+\.\d+)/, // center=lat,lng
      /@(-?\d+\.\d+),(-?\d+\.\d+),/ // @lat,lng,zoom
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }

    return { lat: null, lng: null };
  };

  const formatPriceInput = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d]/g, ''); // Remove non-digits
    if (cleaned.length === 0) return '';
    
    // Convert to number and format with 1 decimal place
    const numericValue = numericFromDigits(cleaned);
    return numericValue.toFixed(1);
  };

  const numericFromDigits = (value: string): number => {
    const cleaned = (value || '').replace(/[^\d]/g, '');
    if (cleaned.length === 0) return 0;
    
    // Always treat the last digit as decimal, rest as integer
    // But if there's only one digit, treat it as 0.X
    if (cleaned.length === 1) {
      return parseFloat(`0.${cleaned}`);
    }
    
    const integerPart = cleaned.slice(0, -1);
    const decimalPart = cleaned.slice(-1);
    return parseFloat(`${integerPart}.${decimalPart}`);
  };

  const handlePriceInputChange = (inputValue: string) => {
    const cleaned = inputValue.replace(/[^\d]/g, ''); // keep only digits typed
    handleInputChange('pricePerMonth', cleaned);
  };

  const handleDimensionInputChange = (field: 'width' | 'height', inputValue: string) => {
    const cleaned = inputValue.replace(/[^\d]/g, '');
    handleInputChange(field, cleaned);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }

    // Limpiar el input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('El título es requerido');
    if (!formData.pricePerMonth || numericFromDigits(formData.pricePerMonth) <= 0) errors.push('El precio debe ser mayor a 0');
    if (!formData.city.trim()) errors.push('La ciudad es requerida');
    if (!formData.country) errors.push('El país es requerido');
    if (!formData.width.trim() || numericFromDigits(formData.width) <= 0) errors.push('El ancho es requerido y debe ser mayor a 0');
    if (!formData.height.trim() || numericFromDigits(formData.height) <= 0) errors.push('La altura es requerida y debe ser mayor a 0');
    if (!formData.type) errors.push('El tipo es requerido');
    if (formData.dailyImpressions && parseInt(formData.dailyImpressions) <= 0) errors.push('Los impactos diarios deben ser mayor a 0');
    // Validar que el enlace de Google Maps sea válido (opcional)
    if (formData.googleMapsLink.trim()) {
      try {
        const url = new URL(formData.googleMapsLink);
        const hostname = url.hostname.toLowerCase();
        
        // Aceptar dominios de Google Maps: google.com, maps.google.com, maps.app.goo.gl, goo.gl
        const isValidGoogleMaps = 
          hostname === 'google.com' ||
          hostname === 'maps.google.com' ||
          hostname === 'maps.app.goo.gl' ||
          hostname === 'goo.gl' ||
          hostname.endsWith('.google.com') ||
          hostname.endsWith('.goo.gl');
        
        if (!isValidGoogleMaps) {
          errors.push('El enlace debe ser de Google Maps');
        }
      } catch (error) {
        errors.push('El enlace debe ser una URL válida de Google Maps');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Formulario de edición enviado ===');
    console.log('FormData:', formData);
    
    // Validar formulario
    const errors = validateForm();
    console.log('Errores de validación:', errors);
    
    if (errors.length > 0) {
      console.log('Formulario no válido, mostrando errores');
      toast({
        title: "Error de validación",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    console.log('Formulario válido, enviando...');

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      
      // Extraer coordenadas del enlace de Google Maps
      const coordinates = extractCoordinatesFromGoogleMapsLink(formData.googleMapsLink);
      
      // Agregar campos básicos
      formDataToSend.append('title', formData.title);
      formDataToSend.append('pricePerMonth', numericFromDigits(formData.pricePerMonth).toFixed(1));
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('dimensions', `${numericFromDigits(formData.width).toFixed(1)}×${numericFromDigits(formData.height).toFixed(1)} m`);
      formDataToSend.append('lighting', formData.lighting.toString());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('dailyImpressions', formData.dailyImpressions || '0');
      formDataToSend.append('description', formData.description);
      formDataToSend.append('googleMapsLink', formData.googleMapsLink);
      formDataToSend.append('status', formData.status);
      
      // Agregar ownerId por defecto (ID del owner creado en el seed)
      formDataToSend.append('ownerId', 'cmfskhuda0004sj2w46q3g7rc');
      
      // Agregar coordenadas extraídas (si están disponibles)
      if (coordinates.lat !== null && coordinates.lng !== null) {
        formDataToSend.append('lat', coordinates.lat.toString());
        formDataToSend.append('lng', coordinates.lng.toString());
      } else if (support?.lat && support?.lng) {
        // Usar coordenadas existentes si no se proporcionan nuevas
        formDataToSend.append('lat', support.lat.toString());
        formDataToSend.append('lng', support.lng.toString());
      }

      // Agregar imágenes
      formData.images.forEach((image, index) => {
        formDataToSend.append(`image_${index}`, image);
      });

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      console.log('Enviando petición a /api/soportes/' + supportId);
      const response = await fetch(`/api/soportes/${supportId}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error('Error al actualizar el soporte');
      }

      const result = await response.json();
      
      console.log('Response from API:', result);
      
      toast({
        title: "¡Éxito!",
        description: "Tu soporte ha sido actualizado correctamente.",
      });

      // Redirigir a la página del soporte actualizado
      if (result.product && result.product.slug) {
        router.push(`/product/${result.product.slug}`);
      } else if (result.slug) {
        router.push(`/product/${result.slug}`);
      } else {
        // Si no hay slug, redirigir al dashboard
        router.push('/panel/soportes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar tu soporte. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Soporte no encontrado</h1>
          <Button onClick={() => router.push('/panel/soportes')}>
            Volver al dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Editar Soporte
        </h1>
        <p className="text-gray-600">
          Modifica la información de tu soporte publicitario.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Datos principales de tu soporte publicitario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="block mb-2">Título del Soporte *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Valla publicitaria en Av. Corrientes"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerMonth" className="block mb-2">Precio por Mes (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pricePerMonth"
                    type="text"
                    value={formatPriceInput(formData.pricePerMonth)}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    placeholder="00.0"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dailyImpressions" className="block mb-2">Impactos Diarios</Label>
                <div className="relative">
                  <Eye className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dailyImpressions"
                    type="number"
                    value={formData.dailyImpressions}
                    onChange={(e) => handleInputChange('dailyImpressions', e.target.value)}
                    placeholder="65000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="block mb-2">Tipo de Soporte *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="code" className="block mb-2">Código</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Ej: VLL-001, MUP-A23"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="block mb-2">Estado del Soporte *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="RESERVADO">Reservado</SelectItem>
                  <SelectItem value="OCUPADO">Ocupado</SelectItem>
                  <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <CardDescription>
              Información sobre la ubicación del espacio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="block mb-2">País *</Label>
                <Select value={formData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona un país" />
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

              <div>
                <Label htmlFor="city" className="block mb-2">Ciudad *</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => handleInputChange('city', value)}
                  disabled={!formData.country}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={formData.country ? "Selecciona una ciudad" : "Primero selecciona un país"} />
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

            <div>
              <Label htmlFor="googleMapsLink" className="block mb-2">Enlace de Google Maps (opcional)</Label>
              <div className="relative">
                <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="googleMapsLink"
                  type="url"
                  value={formData.googleMapsLink}
                  onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ve a Google Maps, busca tu ubicación, haz clic en "Compartir" y pega el enlace aquí
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Características Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Características Técnicas
            </CardTitle>
            <CardDescription>
              Especificaciones técnicas del espacio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width" className="block mb-2">Ancho (m) *</Label>
                <Input
                  id="width"
                  type="text"
                  value={formatPriceInput(formData.width)}
                  onChange={(e) => handleDimensionInputChange('width', e.target.value)}
                  placeholder="00.0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="height" className="block mb-2">Alto (m) *</Label>
                <Input
                  id="height"
                  type="text"
                  value={formatPriceInput(formData.height)}
                  onChange={(e) => handleDimensionInputChange('height', e.target.value)}
                  placeholder="00.0"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Lightbulb className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Iluminación</span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D7514C] ${formData.lighting ? 'bg-[#D7514C]' : 'bg-gray-300'}`}
                onClick={() => handleInputChange('lighting', !formData.lighting)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.lighting ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Imágenes
            </CardTitle>
            <CardDescription>
              Sube nuevas imágenes de tu espacio publicitario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="images" className="block">Seleccionar Imágenes</Label>
                <span className="text-sm text-gray-500">
                  {formData.images.length}/5 imágenes
                </span>
              </div>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
                disabled={formData.images.length >= 5}
              />
              <p className="text-sm text-gray-500 mt-1">
                Máximo 5 imágenes, 5MB por imagen. Formatos: JPG, PNG, GIF, WebP
              </p>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
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
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
            <CardDescription>
              Describe tu soporte publicitario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description" className="block mb-2">Descripción (máximo 500 caracteres)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción detallada del soporte, ubicación, características especiales, etc."
                rows={4}
                maxLength={500}
                className="focus:ring-[#D7514C] focus:border-[#D7514C]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indicador de Progreso */}
        {isSubmitting && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Actualizando tu soporte...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] bg-[#D7514C] hover:bg-[#D7514C]/90 text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </div>
            ) : (
              'Actualizar Soporte'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
