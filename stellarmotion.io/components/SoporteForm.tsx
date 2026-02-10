'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUp, MapPin, DollarSign, Ruler, Lightbulb, Pencil, Eye, Link as LinkIcon, Hash } from 'lucide-react';
import { CATEGORIES, getCategoryIconPath } from '@/lib/categories';
import Image from 'next/image';
import { PhotonAutocomplete } from '@/components/PhotonAutocomplete';
import EditableGoogleMap from '@/components/EditableGoogleMap';
import StreetViewGoogleMaps from '@/components/StreetViewGoogleMaps';

export interface SoporteFormData {
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
  status?: string;
}

interface SoporteFormProps {
  formData: SoporteFormData;
  onInputChange: (field: keyof SoporteFormData, value: string | boolean | File[]) => void;
  onCountryChange: (country: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onDimensionInputChange: (field: 'width' | 'height', inputValue: string) => void;
  onPriceInputChange: (inputValue: string) => void;
  /** Opcional: el precio se muestra y edita como número normal */
  formatPriceInput?: (value: string) => string;
  /** Opcional: si no se pasa, ancho/alto se muestran y editan como texto numérico normal */
  formatDimensionInput?: (value: string) => string;
  availableCities: string[];
  isEditMode?: boolean;
  /** Coordenadas del mapa (del enlace o arrastrando la chincheta) */
  mapCoords?: { lat: number; lng: number } | null;
  /** True mientras se resuelve un enlace corto (goo.gl, maps.app.goo.gl) */
  mapCoordsLoading?: boolean;
  /** Se llama cuando el usuario arrastra la chincheta o hace clic en el mapa */
  onMapCoordsChange?: (coords: { lat: number; lng: number }) => void;
  /** Orientación de Street View guardada (heading, pitch, zoom) */
  streetViewHeading?: number;
  streetViewPitch?: number;
  streetViewZoom?: number;
  /** Se llama cuando el usuario gira o hace zoom en Street View */
  onPovChange?: (pov: { heading: number; pitch: number; zoom: number }) => void;
}

const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 }; // Madrid

// Mapeo de tipos de soporte a categorías
const TYPE_TO_CATEGORY: Record<string, string> = {
  'Parada de bus': 'paradas',
  'Mupi': 'mupis',
  'Valla': 'vallas',
  'Pantalla': 'pantallas',
  'Display': 'displays',
  'Cartelera': 'carteleras',
  'Mural': 'murales',
  'Letrero': 'letreros',
};

// Mapeo inverso: categoría a tipo de soporte
const CATEGORY_TO_TYPE: Record<string, string> = {
  'paradas': 'Parada de bus',
  'mupis': 'Mupi',
  'vallas': 'Valla',
  'pantallas': 'Pantalla',
  'displays': 'Display',
  'carteleras': 'Cartelera',
  'murales': 'Mural',
  'letreros': 'Letrero',
};

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

// Funciones para manejar estados
const getStatusColor = (status: string) => {
  const statusColors = {
    'DISPONIBLE': 'bg-green-100',
    'RESERVADO': 'bg-yellow-100',
    'OCUPADO': 'bg-red-100',
    'MANTENIMIENTO': 'bg-gray-400',
    'INACTIVO': 'bg-gray-500'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-400';
};

const getStatusLabel = (status: string) => {
  const statusLabels = {
    'DISPONIBLE': 'Disponible',
    'RESERVADO': 'Reservado',
    'OCUPADO': 'Ocupado',
    'MANTENIMIENTO': 'Mantenimiento',
    'INACTIVO': 'Inactivo'
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

export function SoporteForm({
  formData,
  onInputChange,
  onCountryChange,
  onImageUpload,
  onRemoveImage,
  onDimensionInputChange,
  onPriceInputChange,
  formatPriceInput,
  availableCities,
  isEditMode = false,
  mapCoords = null,
  mapCoordsLoading = false,
  onMapCoordsChange,
  streetViewHeading = 0,
  streetViewPitch = 0,
  streetViewZoom = 1,
  onPovChange,
}: SoporteFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    formData.type ? TYPE_TO_CATEGORY[formData.type] || null : null
  );

  const handleCategorySelect = (categorySlug: string) => {
    const type = CATEGORY_TO_TYPE[categorySlug];
    if (type) {
      setSelectedCategory(categorySlug);
      onInputChange('type', type);
    }
  };

  return (
    <div className="space-y-8">
      {/* Información Básica */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Información Básica
          </CardTitle>
          <CardDescription>
            Datos principales de tu soporte publicitario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Título del Soporte *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                placeholder="Ej: Valla publicitaria en Av. Corrientes"
                required
                maxLength={200}
                className="rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20 py-3"
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                Código
              </Label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => onInputChange('code', e.target.value)}
                  placeholder="Ej: VLL-001, MUP-A23"
                  maxLength={50}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Tipo de Soporte *
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.slug;
                const iconPath = getCategoryIconPath(category.iconKey);
                
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => handleCategorySelect(category.slug)}
                    className={`
                      relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                      ${isSelected 
                        ? 'border-[#e94446] bg-[#e94446]/10 shadow-md scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-12 h-12 mb-2 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                      <Image
                        src={iconPath}
                        alt={category.label}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <span className={`text-xs font-medium text-center ${isSelected ? 'text-[#e94446]' : 'text-gray-600'}`}>
                      {category.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-[#e94446] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {formData.type && (
              <p className="text-xs text-gray-500 mt-2">
                Seleccionado: <span className="font-medium">{formData.type}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación
          </CardTitle>
          <CardDescription>
            Información sobre la ubicación del espacio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PhotonAutocomplete
              label="País *"
              placeholder="Buscar país..."
              value={formData.country}
              onChange={(value) => onCountryChange(value)}
              type="country"
            />

            <PhotonAutocomplete
              label="Ciudad *"
              placeholder="Buscar ciudad..."
              value={formData.city}
              onChange={(value) => onInputChange('city', value)}
              type="city"
            />
          </div>

          <div>
            <Label htmlFor="googleMapsLink" className="text-sm font-medium text-gray-700 mb-2 block">
              Enlace de Google Maps (opcional)
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                id="googleMapsLink"
                type="url"
                value={formData.googleMapsLink}
                onChange={(e) => onInputChange('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ve a Google Maps, busca tu ubicación, haz clic en "Compartir" y pega el enlace aquí
            </p>
          </div>

          {/* Mapa y Street View: misma vista que se guarda y se muestra en la ficha del soporte */}
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Ubicación del soporte
            </Label>
            {mapCoordsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-300 h-[280px] flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500 text-sm">Obteniendo ubicación del enlace...</span>
                </div>
                <div className="rounded-2xl border border-gray-300 h-[280px] flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500 text-sm">Street View</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
                  <EditableGoogleMap
                    lat={mapCoords?.lat ?? DEFAULT_MAP_CENTER.lat}
                    lng={mapCoords?.lng ?? DEFAULT_MAP_CENTER.lng}
                    onChange={(c) => onMapCoordsChange?.(c)}
                    height={280}
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
                  <StreetViewGoogleMaps
                    lat={mapCoords?.lat ?? DEFAULT_MAP_CENTER.lat}
                    lng={mapCoords?.lng ?? DEFAULT_MAP_CENTER.lng}
                    heading={streetViewHeading}
                    pitch={streetViewPitch}
                    zoom={streetViewZoom}
                    height={280}
                    onPovChange={onPovChange}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Arrastra la chincheta o haz clic en el mapa para fijar la ubicación. Gira el Street View para guardar la vista que verán los clientes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Precios */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Precios
          </CardTitle>
          <CardDescription>
            Información sobre el precio del soporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="pricePerMonth" className="text-sm font-medium text-gray-700 mb-2 block">
              Precio por Mes (USD) *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                id="pricePerMonth"
                type="number"
                step="any"
                min="0"
                value={formData.pricePerMonth}
                onChange={(e) => onPriceInputChange(e.target.value)}
                placeholder="Ej: 350.50"
                className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características Técnicas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Características Técnicas
          </CardTitle>
          <CardDescription>
            Especificaciones técnicas del espacio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="width" className="text-sm font-medium text-gray-700 mb-2 block">
                Ancho (m) *
              </Label>
              <Input
                id="width"
                type="number"
                step="any"
                min="0"
                value={formData.width}
                onChange={(e) => onDimensionInputChange('width', e.target.value)}
                placeholder="Ej: 3.5"
                required
                className="rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20 py-3"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-2 block">
                Alto (m) *
              </Label>
              <Input
                id="height"
                type="number"
                step="any"
                min="0"
                value={formData.height}
                onChange={(e) => onDimensionInputChange('height', e.target.value)}
                placeholder="Ej: 2"
                required
                className="rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="dailyImpressions" className="text-sm font-medium text-gray-700 mb-2 block">
                Impactos Diarios
              </Label>
              <div className="relative">
                <Eye className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="dailyImpressions"
                  type="number"
                  value={formData.dailyImpressions}
                  onChange={(e) => onInputChange('dailyImpressions', e.target.value)}
                  placeholder="65000"
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                Estado del Soporte *
              </Label>
              <Select 
                value={formData.status || 'all'} 
                onValueChange={(value) => {
                  onInputChange('status', value);
                }}
              >
                <SelectTrigger className="rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20 bg-white py-3">
                <SelectValue placeholder="Selecciona el estado">
                  {!formData.status || formData.status === 'all' || formData.status === '' ? (
                    <span>Todos los estados</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(formData.status)}`}></span>
                      <span>{getStatusLabel(formData.status)}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">
                  <span>Todos los estados</span>
                </SelectItem>
                <SelectItem value="DISPONIBLE">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor('DISPONIBLE')}`}></span>
                    <span>{getStatusLabel('DISPONIBLE')}</span>
                  </span>
                </SelectItem>
                <SelectItem value="RESERVADO">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor('RESERVADO')}`}></span>
                    <span>{getStatusLabel('RESERVADO')}</span>
                  </span>
                </SelectItem>
                <SelectItem value="OCUPADO">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor('OCUPADO')}`}></span>
                    <span>{getStatusLabel('OCUPADO')}</span>
                  </span>
                </SelectItem>
                <SelectItem value="MANTENIMIENTO">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor('MANTENIMIENTO')}`}></span>
                    <span>{getStatusLabel('MANTENIMIENTO')}</span>
                  </span>
                </SelectItem>
                <SelectItem value="INACTIVO">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor('INACTIVO')}`}></span>
                    <span>{getStatusLabel('INACTIVO')}</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
            <Lightbulb className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 flex-1">Iluminación</span>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e94446] ${formData.lighting ? 'bg-[#e94446]' : 'bg-gray-300'}`}
              onClick={() => onInputChange('lighting', !formData.lighting)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.lighting ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageUp className="h-5 w-5" />
            Imágenes
          </CardTitle>
          <CardDescription>
            {isEditMode ? 'Sube nuevas imágenes de tu espacio publicitario' : 'Sube imágenes de tu espacio publicitario'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="images" className="text-sm font-medium text-gray-700">
                Seleccionar Imágenes
              </Label>
              <span className="text-sm text-gray-500">
                {formData.images.length}/5 imágenes
              </span>
            </div>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              className="cursor-pointer rounded-2xl border-gray-300 py-3"
              disabled={formData.images.length >= 5}
            />
            <p className="text-sm text-gray-500 mt-2">
              Máximo 5 imágenes, 5MB por imagen. Formatos: JPG, PNG, GIF, WebP
            </p>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-2xl"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    onClick={() => onRemoveImage(index)}
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
          <CardDescription>
            Describe tu soporte publicitario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Descripción (máximo 500 caracteres)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Descripción detallada del soporte, ubicación, características especiales, etc."
              rows={4}
              maxLength={500}
              className="rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.description.length}/500 caracteres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

