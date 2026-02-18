'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, Eye, Ruler, Building, Globe, Lightbulb, Star, Calendar, Send, MessageSquare, Edit, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconBox } from '@/components/ui/IconBox';
import { FEATURE_ICONS } from '@/lib/icons';
import { useSoporte } from '@/hooks/useSoporte';
import dynamic from 'next/dynamic';
import MapViewerGoogleMaps from '@/components/MapViewerGoogleMaps';
import StreetViewGoogleMaps from '@/components/StreetViewGoogleMaps';
import { getSoporteCoordinates } from '@/lib/google-maps-utils';

interface Product {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  dimensions: string;
  dailyImpressions: number;
  type: string;
  lighting: boolean;
  tags: string[];
  images: string[];
  lat: number;
  lng: number;
  pricePerMonth: number;
  printingCost: number;
  rating: number;
  reviewsCount: number;
  shortDescription: string;
  description: string;
  featured: boolean;
  category: {
    slug: string;
    label: string;
    iconKey: string;
  };
}

interface ProductClientProps {
  productId: string;
}

export default function ProductClient({ productId }: ProductClientProps) {
  const { soporte, loading, error } = useSoporte(productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{start?: Date, end?: Date, months?: number}>({});
  const [selectedServices, setSelectedServices] = useState<{
    printing: boolean;
    installation: boolean;
    graphicDesign: boolean;
  }>({
    printing: false,
    installation: false,
    graphicDesign: false
  });
  const [soporteCoords, setSoporteCoords] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successNumber, setSuccessNumber] = useState<string | null>(null);
  const [brandMessage, setBrandMessage] = useState('');


  // Estado para searchLocation
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number, label: string} | null>(null);

  // Procesar coordenadas cuando el soporte se cargue
  useEffect(() => {
    // Limpiar coordenadas cuando cambie el soporte
    setSoporteCoords(null);
    
    if (soporte) {
      const processCoords = async () => {
        try {
          const coords = await getSoporteCoordinates(soporte);
          if (coords) {
            setSoporteCoords(coords);
          } else {
            // Usar coordenadas por defecto si no se pueden extraer
            setSoporteCoords({ lat: 40.4637, lng: -3.7492 });
          }
        } catch (error) {
          setSoporteCoords({ lat: 40.4637, lng: -3.7492 });
        }
      };
      processCoords();
    }
  }, [soporte]);

  // Efecto para calcular searchLocation cuando cambie el soporte
  useEffect(() => {
    if (!soporte) {
      setSearchLocation(null);
      return;
    }
    
    
    // Usar coordenadas específicas por ID de soporte (las que ya se están extrayendo en el backend)
    const soporteCoordinates: Record<string, {lat: number, lng: number}> = {
      'recRXZ6QiugaX7HMO': { lat: 37.390193, lng: -5.974056 }, // Lona Edificio Plaza Mayor - Sevilla
      'recRhlu5E74BIgnxx': { lat: 43.262665, lng: -2.935307 }, // Vehículo Publicitario Ruta 1 - Bilbao
      'recV3r1s4CjVPMCOQ': { lat: 40.439402, lng: -3.690855 }, // Valla Gran Vía 120 - Madrid
      'recbzAqCey0loWDJt': { lat: 39.470178, lng: -0.370803 }, // Mupi Av. América - Valencia
      'receu2qOYz5JBaT7g': { lat: 41.393682, lng: 2.166639 }  // Pantalla LED Circunvalación - Barcelona
    };
    
    const coords = soporteCoordinates[soporte.id];
    if (coords) {
      setSearchLocation({
        lat: coords.lat,
        lng: coords.lng,
        label: soporte.nombre || 'Ubicación del soporte'
      });
    } else {
      // Fallback a coordenadas por defecto
      setSearchLocation({
        lat: 40.4168,
        lng: -3.7038,
        label: `${soporte.nombre} - Madrid`
      });
    }
  }, [soporte]);



  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e94446] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando soporte...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !soporte) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Soporte no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El soporte solicitado no existe'}</p>
          <Button onClick={() => router.back()} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Asegurar que images sean array
  const safeImages = Array.isArray(soporte.imagenes) ? soporte.imagenes : [];
  const displayedImages = safeImages.length > 0
    ? safeImages
    : ['/placeholder.svg?height=400&width=600'];
  const clampedSelectedIndex = Math.min(selectedImage, Math.max(displayedImages.length - 1, 0));
  const mainImage = displayedImages[clampedSelectedIndex] || '/placeholder.svg?height=400&width=600';

  const handlePrevImage = () => {
    if (displayedImages.length <= 1) return;
    setSelectedImage(clampedSelectedIndex === 0 ? displayedImages.length - 1 : clampedSelectedIndex - 1);
  };

  const handleNextImage = () => {
    if (displayedImages.length <= 1) return;
    setSelectedImage(clampedSelectedIndex === displayedImages.length - 1 ? 0 : clampedSelectedIndex + 1);
  };
  
  // Crear tags basados en las características del soporte
  const safeTags = [
    soporte.tipo,
    soporte.iluminacion ? 'Iluminado' : 'Sin iluminación',
    soporte.destacado ? 'Destacado' : null,
    soporte.ciudad || soporte.ubicacion
  ].filter(Boolean);

  const formatPrice = (price: number) => {
    const validPrice = isNaN(price) || price <= 0 ? 350 : price;
    return `$${validPrice.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatImpressions = (impressions: number) => {
    return new Intl.NumberFormat('es-BO').format(impressions);
  };

  // Función para obtener el estado de disponibilidad
  const getAvailabilityStatus = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return {
          text: 'Disponible',
          className: 'bg-green-500 text-white'
        };
      case 'ocupado':
        return {
          text: 'Ocupado',
          className: 'bg-red-500 text-white'
        };
      case 'reservado':
        return {
          text: 'Reservado',
          className: 'bg-yellow-500 text-white'
        };
      case 'mantenimiento':
        return {
          text: 'En mantenimiento',
          className: 'bg-orange-500 text-white'
        };
      case 'RESERVADO':
        return {
          text: 'Reservado',
          className: 'bg-yellow-500 text-white'
        };
      case 'OCUPADO':
        return {
          text: 'Ocupado',
          className: 'bg-red-500 text-white'
        };
      default:
        return {
          text: 'Disponible',
          className: 'bg-green-500 text-white'
        };
    }
  };

  const availabilityStatus = getAvailabilityStatus(soporte?.estado || 'disponible');

  // Precios de servicios adicionales
  const servicePrices = {
    printing: 150,
    installation: 200,
    graphicDesign: 100
  };

  // Calcular total
  const calculateTotal = () => {
    const basePrice = isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio;
    const months = selectedDates.months || 0;
    const rentalTotal = basePrice * months;
    
    let servicesTotal = 0;
    if (selectedServices.printing) servicesTotal += servicePrices.printing;
    if (selectedServices.installation) servicesTotal += servicePrices.installation;
    if (selectedServices.graphicDesign) servicesTotal += servicePrices.graphicDesign;
    
    // La comisión es 3% del precio_alquiler (no del subtotal)
    const platformCommission = rentalTotal * 0.03; // 3% de comisión sobre el alquiler
    
    return rentalTotal + platformCommission + servicesTotal;
  };

  // Calcular subtotal (sin comisión)
  const calculateSubtotal = () => {
    const basePrice = isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio;
    const months = selectedDates.months || 0;
    const rentalTotal = basePrice * months;
    
    let servicesTotal = 0;
    if (selectedServices.printing) servicesTotal += servicePrices.printing;
    if (selectedServices.installation) servicesTotal += servicePrices.installation;
    if (selectedServices.graphicDesign) servicesTotal += servicePrices.graphicDesign;
    
    return rentalTotal + servicesTotal;
  };

  // Calcular comisión (3% del precio_alquiler)
  const calculateCommission = () => {
    const basePrice = isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio;
    const months = selectedDates.months || 0;
    const rentalTotal = basePrice * months;
    return rentalTotal * 0.03; // 3% de comisión sobre el alquiler
  };

  // Validar formulario
  const isFormValid = () => {
    return (
      selectedDates.start &&
      selectedDates.months &&
      selectedDates.months > 0 &&
      soporte?.id
    );
  };

  // Mapear servicios seleccionados a IDs del backend
  const getSelectedServiceIds = (): string[] => {
    const services: string[] = [];
    if (selectedServices.printing) services.push('impresion');
    if (selectedServices.installation) services.push('instalacion');
    if (selectedServices.graphicDesign) services.push('diseno');
    return services;
  };

  // Manejar creación de alquiler
  const handleCreateAlquiler = async () => {
    if (!isFormValid() || !soporte?.id) {
      setSubmitError('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Calcular fecha_fin
      const fechaInicio = new Date(selectedDates.start!);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + selectedDates.months!);

      const basePrice = isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio;
      const subtotal = calculateSubtotal();
      const comisionPlataforma = calculateCommission();
      const totalEstimado = calculateTotal();

      // Crear solicitud (no alquiler). brand_user_id se obtiene del JWT en el backend.
      const solicitudData = {
        soporte_id: soporte.id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        meses: selectedDates.months!,
        servicios_adicionales: getSelectedServiceIds(),
        precio_mes_snapshot: basePrice,
        subtotal,
        comision_plataforma: comisionPlataforma,
        total_estimado: totalEstimado,
        ...(brandMessage.trim() ? { brand_message: brandMessage.trim() } : {}),
      };

      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitudData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        const errorMessage = data?.error || data?.details || data?.message || `Error al crear la solicitud (${response.status})`;
        throw new Error(errorMessage);
      }

      if (data.success) {
        setSubmitSuccess(true);
        setSuccessNumber(data.numero);
        setSubmitError(null);
        // Limpiar formulario pero mantenerlo abierto
        setSelectedDates({});
        setSelectedServices({
          printing: false,
          installation: false,
          graphicDesign: false
        });
        // NO cerrar el formulario - mantenerlo abierto para ver el mensaje
        // setShowCalendar(false); // Comentado para mantener el formulario visible
        
        // Scroll suave hacia el mensaje de éxito
        setTimeout(() => {
          const successElement = document.getElementById('success-message');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        throw new Error(data.message || 'Error al crear la solicitud');
      }
    } catch (error: any) {
      console.error('Error creando solicitud:', error);
      const errorMessage = error?.message || error?.toString() || 'Error al crear la solicitud. Por favor intenta de nuevo.';
      setSubmitError(errorMessage);
      // También mostrar en consola para debugging
      console.error('Detalles del error:', {
        message: error?.message,
        stack: error?.stack,
        error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular pago inicial (primer mes + servicios + comisión)
  const calculateInitialPayment = () => {
    const basePrice = isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio;
    
    let servicesTotal = 0;
    if (selectedServices.printing) servicesTotal += servicePrices.printing;
    if (selectedServices.installation) servicesTotal += servicePrices.installation;
    if (selectedServices.graphicDesign) servicesTotal += servicePrices.graphicDesign;
    
    const firstMonthAndServices = basePrice + servicesTotal;
    const commission = firstMonthAndServices * 0.03;
    
    return firstMonthAndServices + commission;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Inicio</a></li>
            <li>/</li>
            <li><a href="/buscar-un-espacio" className="hover:text-gray-700">Buscar</a></li>
            <li>/</li>
            <li className="text-gray-900">{soporte?.nombre}</li>
          </ol>
        </nav>

        {/* Top Section - Horizontal Scroll Carousel */}
        <div className="mb-8 relative">
          <div
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            ref={(el) => {
              if (el) (window as any).__productCarousel = el;
            }}
          >
            {displayedImages.map((img, index) => (
              <div
                key={index}
                className="flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-gray-200"
                style={{ width: 'calc(50% - 8px)' }}
              >
                <div className="aspect-[4/3] w-full">
                  <img
                    src={img || '/placeholder.svg?height=400&width=600'}
                    alt={`${soporte?.nombre || 'Soporte'} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Arrow buttons */}
          {displayedImages.length > 2 && (
            <>
              <button
                onClick={() => {
                  const el = (window as any).__productCarousel;
                  if (el) el.scrollBy({ left: -(el.offsetWidth / 2), behavior: 'smooth' });
                }}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white hover:scale-105 transition-all z-10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => {
                  const el = (window as any).__productCarousel;
                  if (el) el.scrollBy({ left: el.offsetWidth / 2, behavior: 'smooth' });
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white hover:scale-105 transition-all z-10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`${availabilityStatus.className} text-sm font-medium px-3 py-1 rounded-full`}>
                    {availabilityStatus.text}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/panel/soportes/${soporte?.id}/editar`)}
                    className="border-[#D7514C] text-[#D7514C] hover:bg-[#D7514C] hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite ? 'text-[#D7514C]' : 'text-gray-400'
                    } hover:text-[#D7514C]`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                {soporte?.nombre}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{soporte?.ciudad}, {soporte?.pais}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.5</span>
                  <span>(12 reseñas)</span>
                </div>
              </div>

              {/* Host Info: owner.empresa → nombre+apellidos → email (nunca usuario_id como nombre) */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[#D7514C] rounded-full flex items-center justify-center text-white font-bold">
                  {(() => {
                    const o = soporte?.owner;
                    if (!o) return 'SM';
                    if (o.empresa?.trim()) return o.empresa.slice(0, 2).toUpperCase();
                    const full = [o.nombre, o.apellidos].filter(Boolean).join(' ');
                    if (full) return full.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
                    if (o.email) return o.email.slice(0, 2).toUpperCase();
                    return 'SM';
                  })()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {(() => {
                      const o = soporte?.owner;
                      if (!o) return 'StellarMotion';
                      if (o.empresa?.trim()) return o.empresa.trim();
                      const full = [o.nombre, o.apellidos].filter(Boolean).join(' ').trim();
                      if (full) return full;
                      if (o.email?.trim()) return o.email.trim();
                      return 'StellarMotion';
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Características del espacio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ruler className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dimensión</p>
                    <p className="font-medium">{soporte?.dimensiones?.ancho}m x {soporte?.dimensiones?.alto}m</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Impactos diarios</p>
                    <p className="font-medium">{formatImpressions(soporte?.impactosDiarios || 0)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{soporte?.tipo}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Iluminación</p>
                    <p className="font-medium">{soporte?.iluminacion ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {soporte?.descripcion && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                <p className="text-gray-600 leading-relaxed break-words">
                  {soporte?.descripcion}
                </p>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
              {soporte?.showApproximateLocation && (
                <p className="text-sm text-gray-600 mb-3">
                  Se muestra la ubicación en un área aproximada.
                </p>
              )}
              <MapViewerGoogleMaps
                circle={soporte?.showApproximateLocation && soporteCoords ? {
                  lat: soporteCoords.lat,
                  lng: soporteCoords.lng,
                  radius: soporte?.approximateRadius ?? 500
                } : undefined}
                points={!soporte?.showApproximateLocation && soporteCoords ? [{
                  id: soporte?.id || '',
                  lat: soporteCoords.lat,
                  lng: soporteCoords.lng,
                  title: soporte?.nombre || '',
                  description: `${soporte?.tipo || ''} - ${soporte?.dimensiones?.ancho}m x ${soporte?.dimensiones?.alto}m - $${soporte?.precio?.toLocaleString() || 0}/mes`,
                  type: soporte?.tipo === 'building' ? 'building' : 'billboard'
                }] : []}
                lat={soporteCoords?.lat || 40.4637}
                lng={soporteCoords?.lng || -3.7492}
                zoom={soporte?.showApproximateLocation ? 14 : 16}
                height={400}
                style="streets"
                showControls={true}
                searchLocation={searchLocation}
                onMarkerClick={(point) => {
                  // Marcador clickeado
                }}
                onMapClick={(lat, lng) => {
                  // Mapa clickeado
                }}
              />
              
              {/* Street View */}
              {soporteCoords && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Vista de calle</h4>
                  <StreetViewGoogleMaps
                    lat={soporteCoords.lat}
                    lng={soporteCoords.lng}
                    height={400}
                    heading={soporte?.streetViewHeading ?? 0}
                    pitch={soporte?.streetViewPitch ?? 0}
                    zoom={soporte?.streetViewZoom ?? 1}
                  />
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Reseñas
              </h3>
              <div className="space-y-4">
                {/* Mock Reviews */}
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">Tomás</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">14/09/2024</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Excelente ubicación y muy buena visibilidad. El espacio cumplió con todas nuestras expectativas.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">Brian</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">10/09/2024</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Muy profesional el servicio y el espacio tiene excelente calidad. Lo recomiendo totalmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-3xl font-bold text-[#D7514C]">
                    {formatPrice(soporte?.precio || 0)}
                  </span>
                  <span className="text-gray-600">/ mes</span>
                </div>
                
                {false && (
                  <p className="text-gray-600 mb-4 text-sm">
                    Costo de impresión: {formatPrice(0)}
                  </p>
                )}
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full bg-[#D7514C] hover:bg-[#D7514C]/90 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar ahora
                  </Button>
                  <Button variant="outline" className="w-full border-[#D7514C] text-[#D7514C] hover:bg-[#D7514C] hover:text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Hacer una pregunta
                  </Button>
                </div>
                
                {/* Calendar Section */}
                {showCalendar && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Seleccionar período de alquiler</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de inicio
                        </label>
                        <input
                          type="date"
                          value={selectedDates.start ? selectedDates.start.toISOString().split('T')[0] : ''}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7514C] focus:border-[#D7514C] bg-white shadow-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              const startDate = new Date(e.target.value);
                              setSelectedDates(prev => ({...prev, start: startDate}));
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meses de alquiler
                        </label>
                        <select
                          value={selectedDates.months || ''}
                          className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7514C] focus:border-[#D7514C] bg-white shadow-sm"
                          onChange={(e) => {
                            const months = e.target.value ? parseInt(e.target.value) : undefined;
                            setSelectedDates(prev => ({...prev, months}));
                          }}
                        >
                          <option value="">Seleccionar</option>
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {month} {month === 1 ? 'mes' : 'meses'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(selectedDates.start && selectedDates.months) && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-5 h-5 text-[#D7514C]" />
                          <span className="font-medium text-gray-900">Resumen del período</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Inicio:</span> {selectedDates.start.toLocaleDateString('es-BO')}</p>
                          <p><span className="font-medium">Duración:</span> {selectedDates.months} {selectedDates.months === 1 ? 'mes' : 'meses'}</p>
                          <p><span className="font-medium">Fin:</span> {(() => {
                            const endDate = new Date(selectedDates.start);
                            endDate.setMonth(endDate.getMonth() + selectedDates.months);
                            return endDate.toLocaleDateString('es-BO');
                          })()}</p>
                        </div>
                      </div>
                    )}

                    {/* Servicios Adicionales */}
                    {(selectedDates.start && selectedDates.months) && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                        <h5 className="font-medium text-gray-900 mb-3">Servicios adicionales (se pagan al inicio)</h5>
                        <div className="space-y-3">
                          {/* Impresión del diseño */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="printing"
                                checked={selectedServices.printing}
                                onChange={(e) => setSelectedServices(prev => ({...prev, printing: e.target.checked}))}
                                className="w-4 h-4 text-[#D7514C] border-gray-300 rounded focus:ring-[#D7514C]"
                              />
                              <label htmlFor="printing" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Impresión del diseño
                              </label>
                            </div>
                            <span className="text-sm font-semibold text-[#D7514C]">
                              {formatPrice(servicePrices.printing)}
                            </span>
                          </div>

                          {/* Instalación en soporte */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="installation"
                                checked={selectedServices.installation}
                                onChange={(e) => setSelectedServices(prev => ({...prev, installation: e.target.checked}))}
                                className="w-4 h-4 text-[#D7514C] border-gray-300 rounded focus:ring-[#D7514C]"
                              />
                              <label htmlFor="installation" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Instalación en soporte
                              </label>
                            </div>
                            <span className="text-sm font-semibold text-[#D7514C]">
                              {formatPrice(servicePrices.installation)}
                            </span>
                          </div>

                          {/* Diseño gráfico */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="graphicDesign"
                                checked={selectedServices.graphicDesign}
                                onChange={(e) => setSelectedServices(prev => ({...prev, graphicDesign: e.target.checked}))}
                                className="w-4 h-4 text-[#D7514C] border-gray-300 rounded focus:ring-[#D7514C]"
                              />
                              <label htmlFor="graphicDesign" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Diseño gráfico
                              </label>
                            </div>
                            <span className="text-sm font-semibold text-[#D7514C]">
                              {formatPrice(servicePrices.graphicDesign)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensaje de éxito - Mostrar siempre que haya éxito, incluso si no hay fechas */}
                    {submitSuccess && (
                      <div id="success-message" className="mt-4 p-4 bg-green-500/20 border-2 border-green-300 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              ¡Solicitud de cotización enviada exitosamente!
                            </p>
                            {successNumber && (
                              <p className="text-xs text-gray-700 mb-2">
                                Número de solicitud: <span className="font-mono font-bold text-[#D7514C]">{successNumber}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              El owner recibirá una notificación y se pondrá en contacto contigo.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSubmitSuccess(false);
                              setSuccessNumber(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mensaje de error - Mostrar siempre que haya error */}
                    {submitError && (
                      <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-300 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{submitError}</p>
                          </div>
                          <button
                            onClick={() => setSubmitError(null)}
                            className="text-red-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Total y Botón de Pago */}
                    {(selectedDates.start && selectedDates.months) && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#D7514C] to-red-600 rounded-lg text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">Total a pagar</span>
                          <span className="font-bold text-xl">
                            {formatPrice(calculateTotal())}
                          </span>
                        </div>
                        <div className="text-sm opacity-90 mb-4">
                          <p>Alquiler ({selectedDates.months} {selectedDates.months === 1 ? 'mes' : 'meses'}): {formatPrice((isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio) * selectedDates.months)}</p>
                          {(selectedServices.printing || selectedServices.installation || selectedServices.graphicDesign) && (
                            <p>Servicios: {formatPrice(
                              (selectedServices.printing ? servicePrices.printing : 0) +
                              (selectedServices.installation ? servicePrices.installation : 0) +
                              (selectedServices.graphicDesign ? servicePrices.graphicDesign : 0)
                            )}</p>
                          )}
                          <p>Comisión de la plataforma (3%): {formatPrice(calculateCommission())}</p>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm opacity-90 mb-1">Mensaje para el propietario (opcional)</label>
                          <textarea
                            value={brandMessage}
                            onChange={(e) => setBrandMessage(e.target.value)}
                            placeholder="Escribe un mensaje si lo deseas..."
                            className="w-full px-3 py-2 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/60 text-sm min-h-[80px]"
                            rows={3}
                          />
                        </div>
                        <Button 
                          className="w-full bg-white text-[#D7514C] hover:bg-gray-100 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCreateAlquiler}
                          disabled={isSubmitting || !isFormValid()}
                        >
                          {isSubmitting ? 'Procesando...' : 'Enviar solicitud'}
                        </Button>
                      </div>
                    )}

                    {/* Desglose de Pagos */}
                    {(selectedDates.start && selectedDates.months) && (
                      <div className="mt-4 space-y-3">
                        {/* A pagar ahora */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-700">A pagar ahora</p>
                            <p className="text-xs text-gray-500">Primer mes + servicios + comisión</p>
                          </div>
                          <span className="text-lg font-bold text-[#D7514C]">
                            {formatPrice(calculateInitialPayment())}
                          </span>
                        </div>

                        {/* Mes a mes */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Mes a mes</p>
                            <p className="text-xs text-gray-500">Alquiler mensual</p>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(isNaN(soporte?.precio) || soporte?.precio <= 0 ? 350 : soporte.precio)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Escribe una reseña</span>
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Reportar espacio</span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
