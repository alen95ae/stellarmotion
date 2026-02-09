"use client";

import { MapPin, Zap, BarChart3 } from "lucide-react";

// Mapa estilizado: grid de “zonas” con opacidad/color según impacto (fake). No es Google Maps.
function StylizedHeatMap() {
  // Intensidades fake: 0 = frío, 1 = caliente (más impacto)
  const cells = [
    [0.2, 0.3, 0.5, 0.4, 0.2, 0.3],
    [0.3, 0.6, 0.8, 0.7, 0.5, 0.3],
    [0.4, 0.7, 1, 0.9, 0.6, 0.4],
    [0.3, 0.5, 0.8, 0.8, 0.7, 0.5],
    [0.2, 0.4, 0.6, 0.6, 0.5, 0.3],
    [0.2, 0.3, 0.4, 0.5, 0.4, 0.2],
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100/80 p-2 shadow-sm">
      <div className="aspect-[4/3] max-h-[340px] grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cells[0].length}, 1fr)`, gridTemplateRows: `repeat(${cells.length}, 1fr)` }}>
        {cells.map((row, i) =>
          row.map((intensity, j) => (
            <div
              key={`${i}-${j}`}
              className="rounded-sm transition-opacity"
              style={{
                backgroundColor: `rgba(233, 68, 70, ${0.15 + intensity * 0.75})`,
              }}
            />
          ))
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-300" /> Menos impacto
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#e94446]" /> Más impacto
        </span>
      </div>
    </div>
  );
}

export default function HeatMapSection() {
  return (
    <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Izquierda: copy y por qué es potente */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="w-12 h-1 bg-[#e94446] mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Visualiza dónde impacta realmente tu marca en la ciudad.
            </h2>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Zonas más calientes = más impacto. Filtra por hora, tipo de soporte o campaña y descubre el rendimiento real de tu inventario OOH/DOOH.
            </p>

            <div className="mt-10">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Por qué es potente</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10">
                    <MapPin className="h-4 w-4 text-[#e94446]" />
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Diferencia Stellarmotion de cualquier marketplace</p>
                    <p className="text-sm text-gray-600 mt-0.5">No solo listamos soportes: mostramos dónde y cuánto impactan.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10">
                    <Zap className="h-4 w-4 text-[#e94446]" />
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Refuerza DOOH + data + IA</p>
                    <p className="text-sm text-gray-600 mt-0.5">Capas de datos e inteligencia sobre el mapa para decisiones más inteligentes.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e94446]/10">
                    <BarChart3 className="h-4 w-4 text-[#e94446]" />
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Impacto real, no suposiciones</p>
                    <p className="text-sm text-gray-600 mt-0.5">Visualiza rendimiento por zona para optimizar campañas y soportes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Derecha: filtros fake + mapa estilizado */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 shadow-sm">
              {/* Filtros fake */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm">
                  <span className="text-gray-500 font-medium">Hora</span>
                  <span className="text-gray-400">|</span>
                  <span>14:00 - 18:00</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm">
                  <span className="text-gray-500 font-medium">Tipo de soporte</span>
                  <span className="text-gray-400">|</span>
                  <span>Todos</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm">
                  <span className="text-gray-500 font-medium">Campaña</span>
                  <span className="text-gray-400">|</span>
                  <span>Q2 2025</span>
                </div>
              </div>

              <StylizedHeatMap />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
