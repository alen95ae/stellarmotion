'use client';

import { useState } from 'react';
import { MapPin, Heart, Eye, Ruler, Building, Lightbulb, Star, Calendar, Send, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapViewerGoogleMaps from '@/components/MapViewerGoogleMaps';

// Datos de prueba para publicidad móvil
const mockSoporteMovil = {
  id: 'test-movil-001',
  nombre: 'Vehículo Publicitario - Ruta Centro',
  tipo: 'Vehículo Publicitario',
  ciudad: 'Madrid',
  pais: 'España',
  dimensiones: {
    ancho: 3.5,
    alto: 1.5
  },
  impactosDiarios: 50000,
  iluminacion: true,
  estado: 'disponible',
  precio: 450,
  descripcion: 'Vehículo publicitario que recorre las principales zonas del centro de Madrid. Ideal para campañas de alto impacto visual.',
  imagenes: [] // Sin imágenes
};

// Recorrido de prueba (solo inicio y fin)
const mockRoute = [
  { lat: 40.4168, lng: -3.7038 }, // Inicio - Puerta del Sol (verde)
  { lat: 40.4310, lng: -3.7170 }, // Fin - Final del recorrido (rojo)
];

export default function ProductClientMovil() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{start?: Date, end?: Date, weeks?: number}>({});
  const [selectedServices, setSelectedServices] = useState<{
    printing: boolean;
    installation: boolean;
    graphicDesign: boolean;
  }>({
    printing: false,
    installation: false,
    graphicDesign: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successNumber, setSuccessNumber] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    const validPrice = isNaN(price) || price <= 0 ? 450 : price;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0,
    }).format(validPrice);
  };

  const formatImpressions = (impressions: number) => {
    return new Intl.NumberFormat('es-BO').format(impressions);
  };

  const availabilityStatus = {
    text: 'Disponible',
    className: 'bg-green-500 text-white'
  };

  // Precios de servicios adicionales
  const servicePrices = {
    printing: 150,
    installation: 200,
    graphicDesign: 100
  };

  // Calcular total (basado en semanas)
  const calculateTotal = () => {
    const basePrice = mockSoporteMovil.precio;
    const weeks = selectedDates.weeks || 0;
    // Precio por semana (aproximadamente 1/4 del precio mensual)
    const pricePerWeek = basePrice / 4;
    const rentalTotal = pricePerWeek * weeks;
    
    let servicesTotal = 0;
    if (selectedServices.printing) servicesTotal += servicePrices.printing;
    if (selectedServices.installation) servicesTotal += servicePrices.installation;
    if (selectedServices.graphicDesign) servicesTotal += servicePrices.graphicDesign;
    
    const platformCommission = rentalTotal * 0.03;
    
    return rentalTotal + platformCommission + servicesTotal;
  };

  // Calcular comisión
  const calculateCommission = () => {
    const basePrice = mockSoporteMovil.precio;
    const weeks = selectedDates.weeks || 0;
    const pricePerWeek = basePrice / 4;
    const rentalTotal = pricePerWeek * weeks;
    return rentalTotal * 0.03;
  };

  // Validar formulario
  const isFormValid = () => {
    return (
      selectedDates.start &&
      selectedDates.weeks &&
      selectedDates.weeks > 0
    );
  };

  // Calcular pago inicial
  const calculateInitialPayment = () => {
    const basePrice = mockSoporteMovil.precio;
    const pricePerWeek = basePrice / 4;
    
    let servicesTotal = 0;
    if (selectedServices.printing) servicesTotal += servicePrices.printing;
    if (selectedServices.installation) servicesTotal += servicePrices.installation;
    if (selectedServices.graphicDesign) servicesTotal += servicePrices.graphicDesign;
    
    const firstWeekAndServices = pricePerWeek + servicesTotal;
    const commission = firstWeekAndServices * 0.03;
    
    return firstWeekAndServices + commission;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">Inicio</a></li>
            <li>/</li>
            <li><a href="/test-publi-movil" className="hover:text-gray-700">Test Publi Móvil</a></li>
            <li>/</li>
            <li className="text-gray-900">{mockSoporteMovil.nombre}</li>
          </ol>
        </nav>

        {/* Top Section - Sin imagen */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-8">
              <div className="text-center text-gray-500">
                <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Sin imagen disponible</p>
                <p className="text-sm mt-2">Vehículo publicitario móvil</p>
              </div>
            </div>
          </div>
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
                {mockSoporteMovil.nombre}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{mockSoporteMovil.ciudad}, {mockSoporteMovil.pais}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.5</span>
                  <span>(12 reseñas)</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[#D7514C] rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="font-medium text-gray-900">StellarMotion</p>
                  <p className="text-sm text-gray-500">Miembro desde enero 2024</p>
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
                    <p className="font-medium">{mockSoporteMovil.dimensiones.ancho}m x {mockSoporteMovil.dimensiones.alto}m</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Impactos diarios</p>
                    <p className="font-medium">{formatImpressions(mockSoporteMovil.impactosDiarios)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{mockSoporteMovil.tipo}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Iluminación</p>
                    <p className="font-medium">{mockSoporteMovil.iluminacion ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
              <p className="text-gray-600 leading-relaxed break-words">
                {mockSoporteMovil.descripcion}
              </p>
            </div>

            {/* Map with Route */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recorrido</h3>
              <MapViewerGoogleMaps
                route={mockRoute}
                points={[
                  {
                    id: 'inicio',
                    lat: mockRoute[0].lat,
                    lng: mockRoute[0].lng,
                    title: 'Inicio del recorrido',
                    description: 'Punto de inicio - Puerta del Sol'
                  },
                  {
                    id: 'fin',
                    lat: mockRoute[1].lat,
                    lng: mockRoute[1].lng,
                    title: 'Fin del recorrido',
                    description: 'Punto final del recorrido'
                  }
                ]}
                lat={40.4240}
                lng={-3.7100}
                zoom={13}
                height={400}
                style="streets"
                showControls={true}
              />
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Inicio del recorrido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Fin del recorrido</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                El vehículo recorre esta ruta diariamente, pasando por las principales zonas del centro de Madrid.
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Reseñas
              </h3>
              <div className="space-y-4">
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
                      Excelente cobertura y muy buena visibilidad. El vehículo recorre zonas estratégicas.
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
                    {formatPrice(mockSoporteMovil.precio / 4)}
                  </span>
                  <span className="text-gray-600">/ semana</span>
                </div>
                
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
                          Semanas de alquiler
                        </label>
                        <select
                          value={selectedDates.weeks || ''}
                          className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7514C] focus:border-[#D7514C] bg-white shadow-sm"
                          onChange={(e) => {
                            const weeks = e.target.value ? parseInt(e.target.value) : undefined;
                            setSelectedDates(prev => ({...prev, weeks}));
                          }}
                        >
                          <option value="">Seleccionar</option>
                          {Array.from({length: 16}, (_, i) => i + 1).map(week => (
                            <option key={week} value={week}>
                              {week} {week === 1 ? 'semana' : 'semanas'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(selectedDates.start && selectedDates.weeks) && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-5 h-5 text-[#D7514C]" />
                          <span className="font-medium text-gray-900">Resumen del período</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Inicio:</span> {selectedDates.start.toLocaleDateString('es-BO')}</p>
                          <p><span className="font-medium">Duración:</span> {selectedDates.weeks} {selectedDates.weeks === 1 ? 'semana' : 'semanas'}</p>
                          <p><span className="font-medium">Fin:</span> {(() => {
                            const endDate = new Date(selectedDates.start);
                            endDate.setDate(endDate.getDate() + (selectedDates.weeks! * 7));
                            return endDate.toLocaleDateString('es-BO');
                          })()}</p>
                        </div>
                      </div>
                    )}

                    {/* Servicios Adicionales */}
                    {(selectedDates.start && selectedDates.weeks) && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                        <h5 className="font-medium text-gray-900 mb-3">Servicios adicionales (se pagan al inicio)</h5>
                        <div className="space-y-3">
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

                    {/* Mensaje de éxito */}
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

                    {/* Mensaje de error */}
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
                    {(selectedDates.start && selectedDates.weeks) && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#D7514C] to-red-600 rounded-lg text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">Total a pagar</span>
                          <span className="font-bold text-xl">
                            {formatPrice(calculateTotal())}
                          </span>
                        </div>
                        <div className="text-sm opacity-90 mb-4">
                          <p>Alquiler ({selectedDates.weeks} {selectedDates.weeks === 1 ? 'semana' : 'semanas'}): {formatPrice((mockSoporteMovil.precio / 4) * selectedDates.weeks)}</p>
                          {(selectedServices.printing || selectedServices.installation || selectedServices.graphicDesign) && (
                            <p>Servicios: {formatPrice(
                              (selectedServices.printing ? servicePrices.printing : 0) +
                              (selectedServices.installation ? servicePrices.installation : 0) +
                              (selectedServices.graphicDesign ? servicePrices.graphicDesign : 0)
                            )}</p>
                          )}
                          <p>Comisión de la plataforma (3%): {formatPrice(calculateCommission())}</p>
                        </div>
                        <Button 
                          className="w-full bg-white text-[#D7514C] hover:bg-gray-100 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            setSubmitSuccess(true);
                            setSuccessNumber('TEST-' + Date.now());
                          }}
                          disabled={isSubmitting || !isFormValid()}
                        >
                          {isSubmitting ? 'Procesando...' : 'Solicitud de cotización'}
                        </Button>
                      </div>
                    )}

                    {/* Desglose de Pagos */}
                    {(selectedDates.start && selectedDates.weeks) && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-700">A pagar ahora</p>
                            <p className="text-xs text-gray-500">Primera semana + servicios + comisión</p>
                          </div>
                          <span className="text-lg font-bold text-[#D7514C]">
                            {formatPrice(calculateInitialPayment())}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Semana a semana</p>
                            <p className="text-xs text-gray-500">Alquiler semanal</p>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(mockSoporteMovil.precio / 4)}
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
