"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// Mock: ejemplo de ocupación por soporte (solo presentación)
const SOPORTES_EJEMPLO = [
  {
    id: "1",
    codigo: "VLL-01",
    nombre: "Valla Av. Principal",
    alquileres: [
      { id: "a1", mes: "enero", duracion: 2, cliente: "Marca A", numero: "ALQ-001" },
      { id: "a2", mes: "abril", duracion: 3, cliente: "Marca B", numero: "ALQ-002" },
      { id: "a3", mes: "septiembre", duracion: 2, cliente: "Marca C", numero: "ALQ-003" },
    ],
  },
  {
    id: "2",
    codigo: "MUP-02",
    nombre: "Mupi Centro",
    alquileres: [
      { id: "b1", mes: "febrero", duracion: 4, cliente: "Marca A", numero: "ALQ-004" },
      { id: "b2", mes: "julio", duracion: 2, cliente: "Agencia X", numero: "ALQ-005" },
      { id: "b3", mes: "octubre", duracion: 3, cliente: "Marca B", numero: "ALQ-006" },
    ],
  },
  {
    id: "3",
    codigo: "LED-03",
    nombre: "Pantalla Digital",
    alquileres: [
      { id: "c1", mes: "enero", duracion: 6, cliente: "Marca B", numero: "ALQ-007" },
      { id: "c2", mes: "agosto", duracion: 2, cliente: "Marca C", numero: "ALQ-008" },
    ],
  },
  {
    id: "4",
    codigo: "VLL-04",
    nombre: "Valla Zona Norte",
    alquileres: [
      { id: "d1", mes: "marzo", duracion: 3, cliente: "Marca C", numero: "ALQ-009" },
      { id: "d2", mes: "julio", duracion: 2, cliente: "Marca A", numero: "ALQ-010" },
      { id: "d3", mes: "noviembre", duracion: 2, cliente: "Agencia X", numero: "ALQ-011" },
    ],
  },
];

const mesesIndex: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function getMesIndex(mes: string) {
  return mesesIndex[mes] ?? 0;
}

function seSolapan(
  a: { mes: string; duracion: number },
  b: { mes: string; duracion: number }
): boolean {
  const iniA = getMesIndex(a.mes);
  const finA = iniA + a.duracion - 1;
  const iniB = getMesIndex(b.mes);
  const finB = iniB + b.duracion - 1;
  return iniA <= finB && iniB <= finA;
}

function agruparEnFilas<T extends { mes: string; duracion: number }>(
  alquileres: T[]
): (T & { fila: number })[] {
  const filas: (T & { fila: number })[][] = [];
  alquileres.forEach((alq) => {
    let colocada = false;
    for (let i = 0; i < filas.length; i++) {
      const noSolapa = filas[i].every((e) => !seSolapan(alq, e));
      if (noSolapa) {
        filas[i].push({ ...alq, fila: i });
        colocada = true;
        break;
      }
    }
    if (!colocada) {
      filas.push([{ ...alq, fila: filas.length }]);
    }
  });
  return filas.flat();
}

export default function OccupationTimelineSection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-12 h-1 bg-[#e94446] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Timeline de ocupación de soportes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ejemplo de cómo en el panel de planificación ves la ocupación de cada soporte a lo largo del año.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">Vista de ejemplo:</strong> cada barra es un alquiler; el color indica ocupación. En tu dashboard verás tus soportes reales.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Cabecera meses */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <div className="flex-shrink-0 w-40 sm:w-48 p-3 font-semibold text-gray-900 border-r border-gray-200 text-sm">
                  Soporte
                </div>
                <div className="flex-1 flex">
                  {MESES.map((mes) => (
                    <div
                      key={mes}
                      className="flex-1 py-2 text-center font-medium text-gray-700 border-r border-gray-200 text-xs"
                    >
                      {mes}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filas por soporte */}
              {SOPORTES_EJEMPLO.map((soporte) => {
                const alquileresConFila = agruparEnFilas(soporte.alquileres);
                const numFilas = Math.max(0, ...alquileresConFila.map((a) => a.fila)) + 1;
                const alturaFila = 44;
                const alturaTotal = Math.max(52, numFilas * alturaFila + 12);
                const anchoMes = 100 / 12;

                return (
                  <div
                    key={soporte.id}
                    className="flex border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-40 sm:w-48 p-3 border-r border-gray-200">
                      <div className="font-mono text-xs font-medium text-gray-800">{soporte.codigo}</div>
                      <div className="text-xs text-gray-600 truncate" title={soporte.nombre}>
                        {soporte.nombre}
                      </div>
                    </div>

                    <div
                      className="flex-1 relative"
                      style={{ minHeight: `${alturaTotal}px` }}
                    >
                      <div className="absolute inset-0 flex">
                        {MESES.map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-gray-100"
                          />
                        ))}
                      </div>

                      <div className="relative h-full p-1.5">
                        <TooltipProvider>
                          {alquileresConFila.map((reserva) => {
                            const left = getMesIndex(reserva.mes) * anchoMes;
                            const width = reserva.duracion * anchoMes;

                            return (
                              <Tooltip key={reserva.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute rounded-md text-white text-xs px-2 py-1.5 cursor-default hover:opacity-90 transition-opacity truncate"
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      top: `${reserva.fila * alturaFila + 6}px`,
                                      height: `${alturaFila - 8}px`,
                                      backgroundColor: "#e94446",
                                      zIndex: 10,
                                    }}
                                  >
                                    <span className="font-medium truncate block">
                                      {reserva.cliente}
                                    </span>
                                    <span className="opacity-90">
                                      {reserva.duracion} mes{reserva.duracion > 1 ? "es" : ""}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="text-sm">
                                    <p className="font-semibold text-gray-900">{reserva.numero}</p>
                                    <p className="text-gray-600">{reserva.cliente}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                      {reserva.duracion} mes{reserva.duracion > 1 ? "es" : ""} · Ejemplo
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
