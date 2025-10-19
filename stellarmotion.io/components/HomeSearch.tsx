"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import { MapPin, Crosshair } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import SearchBarGooglePlaces from "./SearchBarGooglePlaces"

type Place = { label: string; placeId?: string; lat: number; lng: number }

export default function HomeSearch() {
  const router = useRouter()
  const [keywords, setKeywords] = useState("")
  const [locText, setLocText] = useState("")
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })

  const handleLocationSelect = (result: any) => {
    if (result.lat && result.lon) {
      setCoords({ lat: result.lat, lng: result.lon })
    }
  }

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está disponible en tu navegador")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          // Usar Google Maps para reverse geocoding
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=es`)
          const data = await res.json()
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            setLocText(result.formatted_address)
            setCoords({ lat: latitude, lng: longitude })
          } else {
            setLocText("Mi ubicación")
            setCoords({ lat: latitude, lng: longitude })
          }
        } catch (error) {
          setLocText("Mi ubicación")
          setCoords({ lat: latitude, lng: longitude })
        }
      },
      () => alert("No se pudo obtener tu ubicación"),
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = keywords.trim()
    const loc = locText.trim()
    const qs = new URLSearchParams()
    if (q) qs.set("q", q)
    if (loc) qs.set("loc", loc)
    if (coords.lat && coords.lng) {
      qs.set("lat", String(coords.lat))
      qs.set("lng", String(coords.lng))
    }
    router.push(`/buscar-un-espacio?${qs.toString()}#resultados`)
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto relative"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Palabras clave"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="h-12"
        />
        <div className="relative flex-1">
          <div className="relative">
            <SearchBarGooglePlaces
              placeholder="Ubicación (ciudad o país)"
              value={locText}
              onChange={setLocText}
              onSelect={handleLocationSelect}
              className="w-full"
            />
            <button
              type="button"
              onClick={useMyLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors z-20"
              aria-label="Usar mi ubicación"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Button type="submit" className="h-12 rounded-full bg-[#D54644] hover:bg-[#c13e3c] px-8">
          Buscar
        </Button>
      </div>
    </form>
  )
}
