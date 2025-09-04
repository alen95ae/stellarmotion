"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import { MapPin, Crosshair } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Place = { label: string; placeId?: string; lat: number; lng: number }

export default function HomeSearch() {
  const router = useRouter()
  const [keywords, setKeywords] = useState("")
  const [locText, setLocText] = useState("")
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [suggestions, setSuggestions] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timer = useRef<any>(null)

  useEffect(() => {
    if (!locText) {
      setSuggestions([])
      setOpen(false)
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(locText)}`, { signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data)
        setOpen(true)
      } catch (error) {
        // Ignore aborted requests
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search error:", error)
        }
      }
    }, 300)
    return () => clearTimeout(timer.current)
  }, [locText])

  const pick = (p: Place) => {
    setLocText(p.label)
    setCoords({ lat: p.lat, lng: p.lng })
    setOpen(false)
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
          const res = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`)
          const data = await res.json()
          setLocText(data.label || "Mi ubicación")
          setCoords({ lat: data.lat, lng: data.lng })
          setOpen(false)
        } catch (error) {
          console.error("Reverse geocoding error:", error)
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
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Ubicación (ciudad o país)"
            value={locText}
            onChange={(e) => setLocText(e.target.value)}
            onFocus={() => suggestions.length && setOpen(true)}
            className="h-12 pl-10 pr-12"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="loc-listbox"
          />
          <button
            type="button"
            onClick={useMyLocation}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Usar mi ubicación"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {open && suggestions.length > 0 && (
            <ul
              id="loc-listbox"
              role="listbox"
              className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-auto"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.placeId ?? `${s.lat},${s.lng},${i}`}
                  role="option"
                  tabIndex={0}
                  onClick={() => pick(s)}
                  onKeyDown={(e) => e.key === "Enter" && pick(s)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" className="h-12 rounded-full bg-[#D54644] hover:bg-[#c13e3c] px-8">
          Buscar
        </Button>
      </div>
    </form>
  )
}
