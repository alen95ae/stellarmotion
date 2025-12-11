"use client"

import { useRef } from "react"
import { Star, CheckCircle2, MapPin, Wrench, Layers, ChevronLeft, ChevronRight } from "lucide-react"

type Owner = {
  id: string
  name: string
  color: string
  since: string
  coverage: string[]
  services: string[]
  formats: string[]
  rating: number
  reviews: number
  listings: number
}

const owners: Owner[] = [
  {
    id: "lumina",
    name: "Lumina Outdoor",
    color: "#D54644",
    since: "2019",
    coverage: ["La Paz", "Santa Cruz"],
    services: ["Instalación", "Impresión"],
    formats: ["Valla", "LED"],
    rating: 4.7,
    reviews: 32,
    listings: 24,
  },
  {
    id: "vial",
    name: "Publicidad Vial Imagen",
    color: "#2563EB",
    since: "2015",
    coverage: ["Madrid", "Barcelona", "Valencia"],
    services: ["Instalación", "Mantenimiento", "Diseño"],
    formats: ["Valla", "Mupi", "Pantalla"],
    rating: 4.9,
    reviews: 87,
    listings: 156,
  },
  {
    id: "urban",
    name: "Urban Media Solutions",
    color: "#059669",
    since: "2020",
    coverage: ["Bogotá", "Medellín", "Cali"],
    services: ["Instalación", "Impresión", "Estrategia"],
    formats: ["Valla", "LED", "Digital"],
    rating: 4.6,
    reviews: 45,
    listings: 78,
  },
]

export function OwnersSection() {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return
    const scrollAmount = 400
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className="mb-16 mt-16">
      <div className="text-center mb-12">
        <div className="inline-block">
          <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuestros Owners</h2>
          <p className="text-gray-600">Colabora con los mejores profesionales del sector</p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: owner.color }}
                    >
                      {owner.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{owner.name}</h3>
                      <p className="text-sm text-gray-500">Desde {owner.since}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{owner.rating}</span>
                  <span className="text-sm text-gray-500">
                    ({owner.reviews} {owner.reviews === 1 ? "reseña" : "reseñas"})
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{owner.coverage.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wrench className="w-4 h-4" />
                    <span>{owner.services.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers className="w-4 h-4" />
                    <span>{owner.formats.join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{owner.listings}</span>{" "}
                    {owner.listings === 1 ? "soporte" : "soportes"}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </section>
  )
}


