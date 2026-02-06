'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SoporteForm, FormData } from '@/components/SoporteForm';

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

export function PublicarEspacioClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    status: 'all',
  });

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
    if (formData.title.length > 200) errors.push('El título no puede superar 200 caracteres');
    if (!formData.pricePerMonth || numericFromDigits(formData.pricePerMonth) <= 0) errors.push('El precio debe ser mayor a 0');
    if ((formData.pricePerMonth?.length ?? 0) > 15) errors.push('El precio no puede superar 15 caracteres');
    if (!formData.city.trim()) errors.push('La ciudad es requerida');
    if (formData.city.length > 100) errors.push('La ciudad no puede superar 100 caracteres');
    if (!formData.country) errors.push('El país es requerido');
    if (formData.country.length > 100) errors.push('El país no puede superar 100 caracteres');
    if (!formData.width.trim() || numericFromDigits(formData.width) <= 0) errors.push('El ancho es requerido y debe ser mayor a 0');
    if (formData.width.length > 10) errors.push('El ancho no puede superar 10 caracteres');
    if (!formData.height.trim() || numericFromDigits(formData.height) <= 0) errors.push('La altura es requerida y debe ser mayor a 0');
    if (formData.height.length > 10) errors.push('La altura no puede superar 10 caracteres');
    if (!formData.type) errors.push('El tipo es requerido');
    if ((formData.code?.length ?? 0) > 50) errors.push('El código no puede superar 50 caracteres');
    if ((formData.googleMapsLink?.length ?? 0) > 2000) errors.push('El enlace de Google Maps no puede superar 2000 caracteres');
    if (formData.dailyImpressions && parseInt(formData.dailyImpressions) <= 0) errors.push('Los impactos diarios deben ser mayor a 0');
    if ((formData.dailyImpressions?.length ?? 0) > 10) errors.push('Los impactos diarios no pueden superar 10 dígitos');
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
    
    console.log('=== Formulario enviado ===');
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
      
      // Validar que el título no esté vacío antes de enviar
      if (!formData.title || !formData.title.trim()) {
        toast({
          title: "Error de validación",
          description: "El título es requerido",
          variant: "destructive",
        });
        return;
      }
      
      // Agregar campos básicos
      formDataToSend.append('title', formData.title.trim());
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
      formDataToSend.append('status', formData.status === 'all' ? 'DISPONIBLE' : (formData.status || 'DISPONIBLE'));
      
      // Agregar usuarioId por defecto (ID del usuario creado en el seed)
      formDataToSend.append('usuarioId', 'cmfskhuda0004sj2w46q3g7rc');
      
      // Agregar coordenadas extraídas (si están disponibles)
      if (coordinates.lat !== null && coordinates.lng !== null) {
        formDataToSend.append('lat', coordinates.lat.toString());
        formDataToSend.append('lng', coordinates.lng.toString());
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

      console.log('Enviando petición a /api/soportes');
      const response = await fetch('/api/soportes', {
        method: 'POST',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Error al crear el soporte';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('❌ Error del backend:', errorMessage);
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error('❌ Error en la respuesta (texto):', errorText);
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSubmitting(false);
        setUploadProgress(0);
        return;
      }

      const result = await response.json();
      
      console.log('Response from API:', result);
      
      toast({
        title: "¡Éxito!",
        description: "Tu soporte ha sido publicado correctamente.",
      });

      // Redirigir a la página del producto creado
      if (result.product && result.product.slug) {
        router.push(`/product/${result.product.slug}`);
      } else if (result.slug) {
        router.push(`/product/${result.slug}`);
      } else {
        // Si no hay slug, redirigir a la página de búsqueda
        router.push('/marketplace');
      }
    } catch (error: any) {
      console.error('❌ Error al enviar:', error);
      const errorMessage = error?.message || 'Hubo un problema al publicar tu soporte. Inténtalo de nuevo.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Publicar un Soporte
            </h1>
            <p className="text-lg text-gray-600">
              Completa la información de tu soporte publicitario para que otros puedan encontrarlo y reservarlo.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="publicar-soporte-form"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl bg-[#e94446] hover:bg-[#d63a3a] px-4"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </span>
              ) : (
                'Publicar Espacio'
              )}
            </Button>
          </div>
        </div>

      <form id="publicar-soporte-form" onSubmit={handleSubmit} className="space-y-8">
          <SoporteForm
            formData={formData}
            onInputChange={handleInputChange}
            onCountryChange={handleCountryChange}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            onDimensionInputChange={handleDimensionInputChange}
            onPriceInputChange={handlePriceInputChange}
            formatPriceInput={formatPriceInput}
            availableCities={availableCities}
            isEditMode={false}
            extractCoordinatesFromGoogleMapsLink={extractCoordinatesFromGoogleMapsLink}
          />

        {/* Indicador de Progreso */}
        {isSubmitting && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Publicando tu soporte...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </form>
      </div>
    </div>
  );
}