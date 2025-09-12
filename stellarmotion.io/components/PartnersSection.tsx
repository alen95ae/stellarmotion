"use client"

import { useRef } from "react"
import { Star, CheckCircle2, MapPin, Wrench, Layers, ChevronLeft, ChevronRight } from "lucide-react"

type Partner = {
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

const partners: Partner[] = [
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
    id: "andes",
    name: "Andes Display",
    color: "#1E293B",
    since: "2018",
    coverage: ["La Paz", "Cochabamba"],
    services: ["Instalación", "Mantenimiento"],
    formats: ["MUPI", "Digital"],
    rating: 4.6,
    reviews: 21,
    listings: 18,
  },
  {
    id: "urbanspot",
    name: "UrbanSpot Media",
    color: "#0EA5E9",
    since: "2020",
    coverage: ["Santa Cruz"],
    services: ["Instalación", "Impresión"],
    formats: ["LED", "Digital"],
    rating: 4.5,
    reviews: 19,
    listings: 15,
  },
  {
    id: "vialmedia",
    name: "VialMedia",
    color: "#22C55E",
    since: "2017",
    coverage: ["La Paz", "El Alto"],
    services: ["Mantenimiento", "Instalación"],
    formats: ["Valla", "Unipolar"],
    rating: 4.8,
    reviews: 40,
    listings: 27,
  },
  {
    id: "cityview",
    name: "CityView OOH",
    color: "#F59E0B",
    since: "2021",
    coverage: ["Cochabamba"],
    services: ["Instalación"],
    formats: ["MUPI", "LED"],
    rating: 4.3,
    reviews: 12,
    listings: 9,
  },
  {
    id: "redsign",
    name: "RedSign",
    color: "#EF4444",
    since: "2016",
    coverage: ["Santa Cruz", "La Paz"],
    services: ["Impresión", "Instalación"],
    formats: ["Valla", "Digital"],
    rating: 4.9,
    reviews: 55,
    listings: 33,
  },
]

function PartnerLogo({ color, name }: { color: string; name: string }) {
  // Logo geométrico simple con iniciales
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="mx-auto h-28 w-28 rounded-full grid place-items-center" style={{ backgroundColor: `${color}1A` }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <rect x="6" y="6" width="44" height="44" rx="10" fill={color} opacity={0.85} />
        <circle cx="28" cy="28" r="10" fill="white" opacity={0.9} />
      </svg>
      <span className="sr-only">{initials}</span>
    </div>
  )
}

export { PartnersSection }
export default function PartnersSection() {
  const railRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (dir: "left" | "right") => {
    if (railRef.current) {
      const amount = railRef.current.clientWidth * 0.9
      railRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900">Nuestros partners</h2>
        <p className="mt-2 text-slate-600">Operadores verificados de soportes publicitarios.</p>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scrollCarousel("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Partners anteriores"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Partners Carousel */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 [-webkit-scrollbar:hidden]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-roledescription="carrusel"
          aria-label="Nuestros partners"
        >
          {partners.map((p) => (
            <article
              key={p.id}
              className="flex-shrink-0 snap-start lg:w-1/3 md:w-1/2 w-[85%] relative rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-[#e94446] focus:ring-2 focus:ring-[#e94446] focus:outline-none"
              aria-label={`Abrir partner ${p.name}`}
              tabIndex={0}
            >
              {/* Top badges */}
              <div className="absolute left-4 top-4 flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 stroke-amber-500" />
                <span className="font-medium">{p.rating.toFixed(1)}</span>
                <span className="text-slate-400">({p.reviews})</span>
              </div>
              <div className="absolute right-4 top-4 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" aria-label="Verificado" />
              </div>

              <div className="px-8 pt-10 pb-6">
                <PartnerLogo color={p.color} name={p.name} />

                <h3 className="text-center mt-5 text-xl font-semibold text-slate-900">{p.name}</h3>
                <p className="text-center text-xs text-slate-500 mt-1">Operando desde {p.since}</p>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p>
                      <span className="font-semibold text-slate-700">Cobertura:</span>{" "}
                      <span className="text-slate-600">{p.coverage.join(", ")}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p>
                      <span className="font-semibold text-slate-700">Servicios:</span>{" "}
                      <span className="text-slate-600">{p.services.join(", ")}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Layers className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p>
                      <span className="font-semibold text-slate-700">Formatos:</span>{" "}
                      <span className="text-slate-600">{p.formats.join(", ")}</span>
                    </p>
                  </div>
                </div>
              </div>

              <footer className="flex items-center justify-between px-8 py-4 border-t bg-slate-50/60 rounded-b-2xl">
                <a href="#" className="text-emerald-600 font-medium hover:underline">
                  {p.listings} listados
                </a>
                <button className="text-slate-400 hover:text-slate-600" aria-label="Mensajes" title="Mensajes">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" />
                  </svg>
                </button>
              </footer>
            </article>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scrollCarousel("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Siguientes partners"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Ver más link */}
      <div className="text-center mt-8">
        <a
          href="/propietarios"
          className="inline-flex items-center text-[#e94446] hover:text-[#d63a3a] font-medium transition-colors"
        >
          Ver más propietarios
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </section>
  )
}
