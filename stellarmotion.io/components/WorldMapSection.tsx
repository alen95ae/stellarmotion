"use client";

import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

// GeoJSON con nombres en properties (Natural Earth). world-atlas TopoJSON no trae "name".
const GEO_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Mock data: usuarios activos por país (solo presentación)
export const ACTIVE_USERS_BY_COUNTRY: Record<string, number> = {
  Bolivia: 432,
  China: 164,
  Germany: 89,
  Singapore: 68,
  "United States": 39,
  Spain: 36,
  France: 14,
};

// Nombres alternativos en el TopoJSON/Geo para hacer match
const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  Bolivia: ["Bolivia", "Bolivia, Plurinational State of"],
  China: ["China"],
  Germany: ["Germany", "Deutschland"],
  Singapore: ["Singapore"],
  "United States": ["United States of America", "United States"],
  Spain: ["Spain", "España"],
  France: ["France"],
};

function getCountryValue(countryName: string): number {
  const normalized = countryName?.trim() || "";
  for (const [key, aliases] of Object.entries(COUNTRY_NAME_ALIASES)) {
    if (key === normalized || aliases.includes(normalized)) {
      return ACTIVE_USERS_BY_COUNTRY[key] ?? 0;
    }
  }
  return 0;
}

// Crecimiento % fake para el panel
const GROWTH_FAKE: Record<string, number> = {
  Bolivia: 12.5,
  China: 8.2,
  Germany: -2.1,
  Singapore: 15.3,
  "United States": 5.4,
  Spain: 9.0,
  France: 3.1,
};

// Lista ordenada para el panel derecho (por usuarios)
const PANEL_ENTRIES = Object.entries(ACTIVE_USERS_BY_COUNTRY)
  .sort(([, a], [, b]) => b - a)
  .map(([country, count]) => ({
    country,
    count,
    growth: GROWTH_FAKE[country] ?? 0,
  }));

const COLOR_MIN = "#e0f2fe";
const COLOR_MAX = "#0369a1";

export default function WorldMapSection() {
  const [tooltip, setTooltip] = useState<{ name: string; count: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const scale = useMemo(() => {
    const values = Object.values(ACTIVE_USERS_BY_COUNTRY);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    return scaleLinear<string>().domain([min, max]).range([COLOR_MIN, COLOR_MAX]).clamp(true);
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Usuarios activos por país
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vista global de uso de la plataforma. Datos de ejemplo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-8">
            <div
              className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden relative"
              onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            >
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 120, center: [0, 20] }}
                className="w-full aspect-[4/3] max-h-[400px]"
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name = (geo.properties?.NAME ?? geo.properties?.name ?? "") as string;
                      const count = getCountryValue(name);
                      const fill = count > 0 ? scale(count) : "#f1f5f9";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#e2e8f0"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", cursor: "pointer", opacity: 0.9 },
                            pressed: { outline: "none" },
                          }}
                          onMouseEnter={() => {
                            if (count > 0) setTooltip({ name, count });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {tooltip && (
                <div
                  className="fixed z-50 pointer-events-none bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm"
                  style={{
                    left: mousePosition.x + 12,
                    top: mousePosition.y + 8,
                  }}
                >
                  <p className="font-semibold text-gray-900">{tooltip.name}</p>
                  <p className="text-gray-600">{tooltip.count.toLocaleString()} usuarios activos</p>
                </div>
              )}

              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-gray-500 bg-white/90 rounded-lg px-2 py-1.5 shadow border border-gray-100">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR_MIN }} />
                Menos
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR_MAX }} />
                Más
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 h-full">
              <h3 className="font-semibold text-gray-900 mb-4">Por país</h3>
              <div className="space-y-3">
                {PANEL_ENTRIES.map(({ country, count, growth }) => (
                  <div
                    key={country}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{country}</p>
                      <p className="text-xs text-gray-500">
                        {count.toLocaleString()} usuarios
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium shrink-0 ${
                        growth >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {growth >= 0 ? "+" : ""}
                      {growth}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
