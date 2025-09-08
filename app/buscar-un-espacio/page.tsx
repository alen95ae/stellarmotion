"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, MapPin, Heart, Eye, Ruler, Building, Globe, Lightbulb, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GoogleMapWrapper from "@/components/GoogleMapWrapper";
import SearchBar from "@/components/SearchBar";

type Place = { label: string; placeId?: string; lat: number; lng: number }

// Distance calculation using Haversine formula
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const A = s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2
  return 2 * R * Math.asin(Math.sqrt(A))
}

// Mock data for advertising spaces with coordinates
const mockSpaces = [
  {
    id: 1,
    image: "/placeholder.svg?height=200&width=300",
    type: "VALLA",
    name: "Valla premium zona céntrica",
    location: "Av. 16 de Julio, La Paz",
    dimensions: "10×4 m",
    dailyImpacts: "44.000",
    city: "La Paz",
    country: "Bolivia",
    adType: "Bipolar",
    illumination: "Sí",
    price: 850,
    rating: 4.8,
    reviews: 12,
    lat: -16.5,
    lng: -68.1193,
  },
  {
    id: 2,
    image: "/placeholder.svg?height=200&width=300",
    type: "LED",
    name: "Pantalla LED alta definición",
    location: "Av. Cristo Redentor, Santa Cruz",
    dimensions: "8×6 m",
    dailyImpacts: "65.000",
    city: "Santa Cruz",
    country: "Bolivia",
    adType: "Digital",
    illumination: "Sí",
    price: 1200,
    rating: 4.9,
    reviews: 8,
    lat: -17.7833,
    lng: -63.1821,
  },
  {
    id: 3,
    image: "/placeholder.svg?height=200&width=300",
    type: "MUPI",
    name: "MUPI avenida principal",
    location: "Av. Heroínas, Cochabamba",
    dimensions: "1.2×1.8 m",
    dailyImpacts: "28.000",
    city: "Cochabamba",
    country: "Bolivia",
    adType: "Unipolar",
    illumination: "Sí",
    price: 450,
    rating: 4.6,
    reviews: 15,
    lat: -16.4833,
    lng: -68.1333,
  },
  {
    id: 4,
    image: "/placeholder.svg?height=200&width=300",
    type: "PANTALLA DIGITAL",
    name: "Pantalla autopista norte",
    location: "Autopista La Paz - El Alto",
    dimensions: "12×8 m",
    dailyImpacts: "95.000",
    city: "La Paz",
    country: "Bolivia",
    adType: "Digital",
    illumination: "Sí",
    price: 1800,
    rating: 5.0,
    reviews: 6,
    lat: -16.5,
    lng: -68.1193,
  },
  {
    id: 5,
    image: "/placeholder.svg?height=200&width=300",
    type: "TOTEM",
    name: "Totem centro comercial",
    location: "Mall Ventura, Santa Cruz",
    dimensions: "2×4 m",
    dailyImpacts: "35.000",
    city: "Santa Cruz",
    country: "Bolivia",
    adType: "Unipolar",
    illumination: "No",
    price: 650,
    rating: 4.7,
    reviews: 9,
    lat: -17.7833,
    lng: -63.1821,
  },
  {
    id: 6,
    image: "/placeholder.svg?height=200&width=300",
    type: "MUPI",
    name: "MUPI avenida principal",
    location: "Av. Heroínas, Cochabamba",
    dimensions: "1.2×1.8 m",
    dailyImpacts: "28.000",
    city: "Cochabamba",
    country: "Bolivia",
    adType: "Unipolar",
    illumination: "Sí",
    price: 450,
    rating: 4.6,
    reviews: 15,
    lat: -16.4833,
    lng: -68.1333,
  },
]

export default function BuscarUnEspacioPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get initial values from URL params
  const initialKeywords = searchParams.get("keywords") || ""
  const initialLocation = searchParams.get("location") || ""
  
  const [keywords, setKeywords] = useState(initialKeywords)
  const [location, setLocation] = useState(initialLocation)
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [showMap, setShowMap] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(2000)
  const [impactsMin, setImpactsMin] = useState(0)
  const [impactsMax, setImpactsMax] = useState(120000)
  const [illumination, setIllumination] = useState("todas")
  const [sortBy, setSortBy] = useState("impactos-desc")

  // Effect to handle URL params changes
  useEffect(() => {
    const newKeywords = searchParams.get("keywords") || ""
    const newLocation = searchParams.get("location") || ""
    
    setKeywords(newKeywords)
    setLocation(newLocation)
    
    // If we have a location, try to get coordinates
    if (newLocation && newLocation !== initialLocation) {
      fetchLocationCoordinates(newLocation)
    }
  }, [searchParams, initialLocation])

  // Effect to check for stored location from SearchBar
  useEffect(() => {
    const checkStoredLocation = () => {
      const storedLocation = sessionStorage.getItem('selectedLocation')
      if (storedLocation) {
        try {
          const locationData = JSON.parse(storedLocation)
          setLocation(locationData.label)
          setCoords({ lat: locationData.lat, lng: locationData.lng })
          // Clear stored location after using it
          sessionStorage.removeItem('selectedLocation')
        } catch (error) {
          console.error('Error parsing stored location:', error)
        }
      }
    }

    // Check immediately
    checkStoredLocation()

    // Also check periodically to catch any new stored locations
    const interval = setInterval(checkStoredLocation, 100)
    return () => clearInterval(interval)
  }, [])

  const fetchLocationCoordinates = async (locationText: string) => {
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(locationText)}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const firstResult = data[0]
          if (firstResult.lat && firstResult.lng) {
            setCoords({ lat: firstResult.lat, lng: firstResult.lng })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching location coordinates:', error)
    }
  }

  const filteredSpaces = useMemo(() => {
    const lat = coords.lat
    const lng = coords.lng
    const hasCoords = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)

    return mockSpaces.filter((space) => {
      // Filter by keywords
      if (
        keywords &&
        !space.name.toLowerCase().includes(keywords.toLowerCase()) &&
        !space.type.toLowerCase().includes(keywords.toLowerCase()) &&
        !space.location.toLowerCase().includes(keywords.toLowerCase())
      ) {
        return false
      }

      // Filter by location - use distance if coordinates available
      if (location) {
        if (hasCoords && space.lat && space.lng) {
          const distance = km({ lat: lat!, lng: lng! }, { lat: space.lat, lng: space.lng })
          if (distance > 50) return false // 50km radius
        } else {
          // Fallback to text-based location filtering
          if (
            !space.location.toLowerCase().includes(location.toLowerCase()) &&
            !space.city.toLowerCase().includes(location.toLowerCase())
          ) {
            return false
          }
        }
      }

      if (selectedCategory !== "todas" && space.type !== selectedCategory.toUpperCase()) return false
      if (space.price < priceMin || space.price > priceMax) return false
      const impacts = Number.parseInt(space.dailyImpacts.replace(/[.,]/g, ""))
      if (impacts < impactsMin || impacts > impactsMax) return false
      if (illumination !== "todas" && space.illumination.toLowerCase() !== illumination) return false
      return true
    })
  }, [keywords, location, coords, selectedCategory, priceMin, priceMax, impactsMin, impactsMax, illumination])

  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    switch (sortBy) {
      case "impactos-desc":
        return (
          Number.parseInt(b.dailyImpacts.replace(/[.,]/g, "")) - Number.parseInt(a.dailyImpacts.replace(/[.,]/g, ""))
        )
      case "precio-asc":
        return a.price - b.price
      case "recientes":
        return b.id - a.id
      default:
        return 0
    }
  })

  // Get map center - prioritize coordinates from location, fallback to default
  const mapCenter = coords.lat && coords.lng 
    ? { lat: coords.lat, lng: coords.lng }
    : { lat: -16.5, lng: -68.15 }

  // Get map zoom - closer zoom when we have specific coordinates
  const mapZoom = coords.lat && coords.lng ? 12 : 6

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            defaultKeywords={keywords}
            defaultLocation={location}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Filtros</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categoría</h4>
                <div className="space-y-2">
                  {[
                    { value: "todas", label: "Todas las categorías" },
                    { value: "valla", label: "VALLA" },
                    { value: "led", label: "LED" },
                    { value: "mupi", label: "MUPI" },
                    { value: "pantalla-digital", label: "PANTALLA DIGITAL" },
                    { value: "totem", label: "TOTEM" },
                  ].map((category) => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={selectedCategory === category.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-[#D7514C] bg-gray-100 border-gray-300 focus:ring-[#D7514C] focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Rango de Precio ($/mes)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                    <Input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Number(e.target.value))}
                      className="h-8 text-sm"
                      min="0"
                      max={priceMax}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                    <Input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="h-8 text-sm"
                      min={priceMin}
                      max="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Daily Impacts Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Impactos Diarios</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                    <Input
                      type="number"
                      value={impactsMin}
                      onChange={(e) => setImpactsMin(Number(e.target.value))}
                      className="h-8 text-sm"
                      min="0"
                      max={impactsMax}
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                    <Input
                      type="number"
                      value={impactsMax}
                      onChange={(e) => setImpactsMax(Number(e.target.value))}
                      className="h-8 text-sm"
                      min={impactsMin}
                      max="200000"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Illumination Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Iluminación</h4>
                <div className="space-y-2">
                  {[
                    { value: "todas", label: "Todas" },
                    { value: "sí", label: "Sí" },
                    { value: "no", label: "No" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="illumination"
                        value={option.value}
                        checked={illumination === option.value}
                        onChange={(e) => setIllumination(e.target.value)}
                        className="w-4 h-4 text-[#D7514C] bg-gray-100 border-gray-300 focus:ring-[#D7514C] focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map Toggle */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Vista</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowMap(true)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      showMap
                        ? "bg-[#D7514C] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Mapa
                  </button>
                  <button
                    onClick={() => setShowMap(false)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      !showMap
                        ? "bg-[#D7514C] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Lista
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Espacios publicitarios
                    {location && (
                      <span className="text-gray-600 font-normal ml-2">
                        en {location}
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {filteredSpaces.length} espacios encontrados
                  </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D7514C] focus:border-[#D7514C]"
                  >
                    <option value="impactos-desc">Más impactos</option>
                    <option value="precio-asc">Menor precio</option>
                    <option value="recientes">Más recientes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map View */}
            {showMap && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mapa de ubicaciones</h2>
                <div className="h-[460px] w-full rounded-xl overflow-hidden border bg-white">
                  <GoogleMapWrapper
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={sortedSpaces
                      .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
                      .map((s) => ({
                        lat: s.lat,
                        lng: s.lng,
                      }))}
                    className="h-full"
                  />
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
              {sortedSpaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="lg:w-48 lg:h-32 flex-shrink-0">
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block bg-[#D7514C] text-white text-xs font-medium px-2 py-1 rounded-full mb-2">
                            {space.type}
                          </span>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.name}</h3>
                          <p className="text-gray-600 flex items-center mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            {space.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">${space.price}</span>
                          <span className="text-gray-600 text-sm"> / mes</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Ruler className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Dimensión:</span>
                          <span className="font-medium">{space.dimensions}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Impactos diarios:</span>
                          <span className="font-medium">{space.dailyImpacts}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Ciudad:</span>
                          <span className="font-medium">{space.city}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">País:</span>
                          <span className="font-medium">{space.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-[#D7514C] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">T</span>
                          </div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">{space.adType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Iluminación:</span>
                          <span className="font-medium">{space.illumination}</span>
                        </div>
                      </div>

                      {/* Rating and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="font-medium">{space.rating}</span>
                            <span className="text-gray-500">({space.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="p-2 text-gray-400 hover:text-[#D7514C] transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                          <Button variant="brand" size="sm">
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {sortedSpaces.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron espacios</h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar los filtros o buscar en otra ubicación.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("todas")
                    setPriceMin(0)
                    setPriceMax(2000)
                    setImpactsMin(0)
                    setImpactsMax(120000)
                    setIllumination("todas")
                  }}
                  variant="brand"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
