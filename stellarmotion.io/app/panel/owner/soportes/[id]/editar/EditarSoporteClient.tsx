'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SoporteForm, type SoporteFormData } from '@/components/SoporteForm';
import { extractCoordinatesFromGoogleMapsLink, buildGoogleMapsLinkFromCoords } from '@/lib/extract-google-maps-coords';

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
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false);
  const [formData, setFormData] = useState<SoporteFormData>({
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
    description: '',
    googleMapsLink: '',
    status: 'all',
    showApproximateLocation: false,
    approximateRadius: 500,
    priceRangeEnabled: false,
    priceMin: '',
    priceMax: '',
    rentalPeriod: 'meses'
  });
  const [streetViewPov, setStreetViewPov] = useState({ heading: 0, pitch: 0, zoom: 1 });

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
        
        // Extraer dimensiones: prioridad dimensiones.ancho/alto, luego string "10x4" o "10×4"
        const fromObj = supportData.dimensiones != null && typeof supportData.dimensiones === 'object';
        const width = fromObj
          ? String((supportData.dimensiones as { ancho?: number }).ancho ?? '')
          : (supportData.dimensions?.match(/(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)/i) ?? [])[1] ?? '';
        const height = fromObj
          ? String((supportData.dimensiones as { alto?: number }).alto ?? '')
          : (supportData.dimensions?.match(/(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)/i) ?? [])[2] ?? '';
        const rawStatus = supportData.estado ?? supportData.status ?? '';
        const status = rawStatus ? String(rawStatus).toUpperCase() : 'DISPONIBLE';
        
        setFormData({
          title: supportData.title || '',
          pricePerMonth: supportData.pricePerMonth != null ? String(supportData.pricePerMonth) : '',
          images: [],
          city: supportData.city || '',
          country: supportData.country || '',
          width,
          height,
          lighting: supportData.lighting || false,
          type: supportData.type || '',
          code: supportData.code || '',
          description: supportData.description || '',
          googleMapsLink: supportData.googleMapsLink || '',
          status,
          showApproximateLocation: supportData.showApproximateLocation ?? false,
          approximateRadius: supportData.approximateRadius ?? 500,
          priceRangeEnabled: supportData.priceRangeEnabled ?? false,
          priceMin: supportData.priceMin != null ? String(supportData.priceMin) : '',
          priceMax: supportData.priceMax != null ? String(supportData.priceMax) : '',
          rentalPeriod: supportData.rentalPeriod ?? 'meses'
        });
        setStreetViewPov({
          heading: supportData.streetViewHeading ?? 0,
          pitch: supportData.streetViewPitch ?? 0,
          zoom: supportData.streetViewZoom ?? 1
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

  const handleInputChange = (field: keyof SoporteFormData, value: string | boolean | File[]) => {
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

  const updateMapCoordsFromLink = useCallback(async (link: string) => {
    if (!link.trim()) {
      setMapCoords(null);
      return;
    }
    setMapCoordsLoading(true);
    try {
      const coords = await extractCoordinatesFromGoogleMapsLink(link);
      if (coords.lat != null && coords.lng != null) {
        setMapCoords({ lat: coords.lat, lng: coords.lng });
      } else {
        setMapCoords(null);
      }
    } finally {
      setMapCoordsLoading(false);
    }
  }, []);

  useEffect(() => {
    const link = formData.googleMapsLink?.trim() || '';
    if (!link) {
      if (support?.lat != null && support?.lng != null) {
        setMapCoords({ lat: support.lat, lng: support.lng });
      } else {
        setMapCoords(null);
      }
      return;
    }
    updateMapCoordsFromLink(link);
  }, [formData.googleMapsLink, updateMapCoordsFromLink, support?.lat, support?.lng]);

  const handlePriceInputChange = (inputValue: string) => {
    // Allow user to type with decimal point, then convert to cents
    // User can type: "350", "350.00", "350.5", etc.
    let cleaned = inputValue.replace(/[^\d.]/g, ''); // Keep digits and decimal point
    
    // If there's a decimal point, handle it properly
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      const integerPart = parts[0] || '';
      const decimalPart = parts[1] || '';
      
      // Limit decimal part to 2 digits
      const limitedDecimal = decimalPart.slice(0, 2);
      
      // Convert to cents: "350.50" -> "35050" cents
      const cents = (integerPart + limitedDecimal.padEnd(2, '0')).replace(/^0+/, '') || '0';
      handleInputChange('pricePerMonth', cents);
    } else {
      // No decimal point: user typed "350" -> store as "35000" cents (350.00)
      const cents = (cleaned + '00').replace(/^0+/, '') || '0';
      handleInputChange('pricePerMonth', cents);
    }
  };

  const handleDimensionInputChange = (field: 'width' | 'height', inputValue: string) => {
    const cleaned = inputValue.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
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
    if (formData.priceRangeEnabled) {
      const minVal = (formData.priceMin ?? '').trim();
      const maxVal = (formData.priceMax ?? '').trim();
      const minNum = parseFloat(minVal);
      const maxNum = parseFloat(maxVal);
      if (!minVal || isNaN(minNum) || minNum < 0) errors.push('El precio mínimo es requerido y debe ser un número válido');
      if (!maxVal || isNaN(maxNum) || maxNum < 0) errors.push('El precio máximo es requerido y debe ser un número válido');
      if (minVal && maxVal && maxNum <= minNum) errors.push('El precio máximo debe ser mayor que el mínimo');
      if ((formData.priceMin?.length ?? 0) > 30) errors.push('El precio mínimo no puede superar 30 caracteres');
      if ((formData.priceMax?.length ?? 0) > 30) errors.push('El precio máximo no puede superar 30 caracteres');
    } else {
      const priceNum = parseFloat(formData.pricePerMonth || '');
      if (!formData.pricePerMonth?.trim() || isNaN(priceNum) || priceNum < 0) errors.push('El precio es requerido y debe ser un número válido');
    }
    if (!formData.city.trim()) errors.push('La ciudad es requerida');
    if (formData.city.length > 100) errors.push('La ciudad no puede superar 100 caracteres');
    if (!formData.country) errors.push('El país es requerido');
    if (formData.country.length > 100) errors.push('El país no puede superar 100 caracteres');
    if (!formData.width.trim()) errors.push('El ancho es requerido');
    if (!formData.height.trim()) errors.push('La altura es requerida');
    if (!formData.type) errors.push('El tipo es requerido');
    if ((formData.code?.length ?? 0) > 50) errors.push('El código no puede superar 50 caracteres');
    if ((formData.googleMapsLink?.length ?? 0) > 2000) errors.push('El enlace de Google Maps no puede superar 2000 caracteres');
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
      
      // Coordenadas: usar las del mapa (chincheta arrastrada) o extraer del enlace
      let coordinates = { lat: mapCoords?.lat ?? null, lng: mapCoords?.lng ?? null };
      if ((coordinates.lat == null || coordinates.lng == null) && formData.googleMapsLink?.trim()) {
        coordinates = await extractCoordinatesFromGoogleMapsLink(formData.googleMapsLink);
      }
      
      // Agregar campos básicos
      formDataToSend.append('title', formData.title);
      if (formData.priceRangeEnabled) {
        formDataToSend.append('priceRangeEnabled', 'true');
        formDataToSend.append('priceMin', (formData.priceMin ?? '').trim() || '0');
        formDataToSend.append('priceMax', (formData.priceMax ?? '').trim() || '0');
        formDataToSend.append('pricePerMonth', (formData.priceMin ?? '0')); // fallback para API que espere un solo precio
      } else {
        formDataToSend.append('pricePerMonth', formData.pricePerMonth.trim() ? parseFloat(formData.pricePerMonth).toString() : '0');
      }
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('dimensions', `${formData.width}×${formData.height} m`);
      formDataToSend.append('widthM', formData.width);
      formDataToSend.append('heightM', formData.height);
      formDataToSend.append('lighting', formData.lighting.toString());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('googleMapsLink', formData.googleMapsLink);
      formDataToSend.append('status', formData.status === 'all' ? 'DISPONIBLE' : (formData.status || 'DISPONIBLE'));
      formDataToSend.append('showApproximateLocation', (formData.showApproximateLocation ?? false).toString());
      formDataToSend.append('approximateRadius', String(formData.approximateRadius ?? 500));
      formDataToSend.append('rentalPeriod', formData.rentalPeriod ?? 'meses');
      
      // Agregar usuarioId por defecto (ID del usuario creado en el seed)
      formDataToSend.append('usuarioId', 'cmfskhuda0004sj2w46q3g7rc');
      
      // Agregar coordenadas extraídas (si están disponibles)
      if (coordinates.lat != null && coordinates.lng != null) {
        formDataToSend.append('lat', coordinates.lat.toString());
        formDataToSend.append('lng', coordinates.lng.toString());
      } else if (support?.lat != null && support?.lng != null) {
        // Usar coordenadas existentes si no se proporcionan nuevas
        formDataToSend.append('lat', support.lat.toString());
        formDataToSend.append('lng', support.lng.toString());
      }

      formDataToSend.append('streetViewHeading', streetViewPov.heading.toString());
      formDataToSend.append('streetViewPitch', streetViewPov.pitch.toString());
      formDataToSend.append('streetViewZoom', streetViewPov.zoom.toString());

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 break-words">
            Editar Soporte
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 break-words">
            Modifica la información de tu soporte publicitario.
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
            form="editar-soporte-form"
            size="sm"
            disabled={isSubmitting}
            className="rounded-xl bg-[#e94446] hover:bg-[#d63a3a] px-4"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </span>
            ) : (
              'Actualizar Soporte'
            )}
          </Button>
        </div>
      </div>

      <form id="editar-soporte-form" onSubmit={handleSubmit} className="space-y-8">
        <SoporteForm
          formData={formData}
          onInputChange={handleInputChange}
          onCountryChange={handleCountryChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onDimensionInputChange={handleDimensionInputChange}
          onPriceInputChange={handlePriceInputChange}
          availableCities={availableCities}
          isEditMode={true}
          mapCoords={mapCoords}
          mapCoordsLoading={mapCoordsLoading}
          onMapCoordsChange={(c) => {
            setMapCoords(c);
            handleInputChange('googleMapsLink', buildGoogleMapsLinkFromCoords(c.lat, c.lng));
          }}
          streetViewHeading={streetViewPov.heading}
          streetViewPitch={streetViewPov.pitch}
          streetViewZoom={streetViewPov.zoom}
          onPovChange={(pov) => setStreetViewPov({ heading: pov.heading, pitch: pov.pitch, zoom: pov.zoom })}
        />

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
      </form>
      </div>
    </div>
  );
}
