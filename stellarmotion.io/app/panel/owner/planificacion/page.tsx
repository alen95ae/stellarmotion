"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "sonner"
import { AlquilerWithRelations } from "@/types/alquileres"

const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

// Estados válidos para alquileres con colores (adaptados a stellarmotion)
const ESTADOS_ALQUILER = {
  'activa': { label: 'Activa', className: 'bg-green-100 text-green-800' },
  'reservada': { label: 'Reservada', className: 'bg-yellow-100 text-yellow-800' },
  'pendiente': { label: 'Pendiente', className: 'bg-purple-100 text-purple-800' },
  'completada': { label: 'Completada', className: 'bg-gray-100 text-gray-800' },
  'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
} as const

const getMesIndex = (mes: string) => meses.indexOf(mes)

/**
 * Helper para parsear fechas en UTC
 */
function parseUTC(dateString: string): Date | null {
  if (!dateString) return null
  const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`
  return new Date(utcString)
}

/**
 * Función para obtener el mes de inicio de un alquiler en un año específico
 */
const getMesInicioAlquiler = (inicio: string, fin: string, año: number): string => {
  try {
    const inicioDate = parseUTC(inicio)
    const finDate = parseUTC(fin)
    
    if (!inicioDate || !finDate) {
      return meses[0]
    }
    
    const añoInicioUTC = parseUTC(`${año}-01-01T00:00:00`)
    const añoFinUTC = parseUTC(`${año}-12-31T23:59:59`)
    
    if (!añoInicioUTC || !añoFinUTC) {
      return meses[0]
    }
    
    if (inicioDate < añoInicioUTC) {
      return meses[0]
    }
    
    const fechaAño = inicioDate.getUTCFullYear()
    const fechaMes = inicioDate.getUTCMonth()
    
    if (fechaAño === año) {
      return meses[fechaMes]
    }
    
    if (finDate >= añoInicioUTC) {
      return meses[0]
    }
    
    return meses[0]
  } catch {
    return meses[0]
  }
}

// Función para calcular duración en meses entre dos fechas (en UTC)
const calcularDuracionMeses = (inicio: string, fin: string): number => {
  try {
    const inicioDate = parseUTC(inicio)
    const finDate = parseUTC(fin)
    
    if (!inicioDate || !finDate) {
      return 1
    }
    
    const yearDiff = finDate.getUTCFullYear() - inicioDate.getUTCFullYear()
    const monthDiff = finDate.getUTCMonth() - inicioDate.getUTCMonth()
    
    return yearDiff * 12 + monthDiff + 1
  } catch {
    return 1
  }
}

// Función para calcular la duración de un alquiler dentro de un año específico (en UTC)
const calcularDuracionEnAño = (inicio: string, fin: string, año: number): number => {
  try {
    const inicioDate = parseUTC(inicio)
    const finDate = parseUTC(fin)
    
    if (!inicioDate || !finDate) {
      return 1
    }
    
    const añoInicioUTC = parseUTC(`${año}-01-01T00:00:00`)
    const añoFinUTC = parseUTC(`${año}-12-31T23:59:59`)
    
    if (!añoInicioUTC || !añoFinUTC) {
      return 1
    }
    
    const inicioEfectivo = inicioDate < añoInicioUTC ? añoInicioUTC : inicioDate
    const finEfectivo = finDate > añoFinUTC ? añoFinUTC : finDate
    
    const yearDiff = finEfectivo.getUTCFullYear() - inicioEfectivo.getUTCFullYear()
    const monthDiff = finEfectivo.getUTCMonth() - inicioEfectivo.getUTCMonth()
    
    return Math.max(1, yearDiff * 12 + monthDiff + 1)
  } catch {
    return 1
  }
}

interface AlquilerPlanificacion {
  id: string
  numero: string
  cliente: string | null
  soporte_id: string
  soporte_codigo?: string | null
  soporte_nombre?: string | null
  inicio: string
  fin: string
  meses: number
  total: number | null
  estado: string | null
  mes: string
  duracion: number
}

interface SoportePlanificacion {
  id: string
  codigo: string
  nombre: string
  alquileres: AlquilerPlanificacion[]
}

export default function PlanificacionPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const getCurrentYearUTC = () => {
    const now = new Date()
    return now.getUTCFullYear()
  }
  
  const [año, setAño] = useState(getCurrentYearUTC())
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [agrupador, setAgrupador] = useState<"ninguno" | "cliente" | "estado">("ninguno")
  const [soportesPlanificacion, setSoportesPlanificacion] = useState<SoportePlanificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Cargar alquileres desde la API
  const loadAlquileres = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/alquileres', {
        credentials: 'include',
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar alquileres')
      }
      
      const data = await response.json()
      
      if (data.success && data.alquileres) {
        const alquileres: AlquilerWithRelations[] = data.alquileres
        
        // Filtrar alquileres que se solapan con el año seleccionado
        const añoInicioUTC = parseUTC(`${año}-01-01T00:00:00`)
        const añoFinUTC = parseUTC(`${año}-12-31T23:59:59`)
        
        if (!añoInicioUTC || !añoFinUTC) {
          setSoportesPlanificacion([])
          return
        }
        
        const alquileresFiltrados = alquileres.filter(alq => {
          const inicioDate = parseUTC(alq.fecha_inicio)
          const finDate = parseUTC(alq.fecha_fin)
          
          if (!inicioDate || !finDate) return false
          
          // El alquiler se solapa con el año si:
          // - Empieza antes del fin del año Y termina después del inicio del año
          return inicioDate <= añoFinUTC && finDate >= añoInicioUTC
        })
        
        // Aplicar filtro de estado si está activo
        const alquileresFiltradosPorEstado = filtroEstado !== 'all' 
          ? alquileresFiltrados.filter(alq => alq.estado === filtroEstado)
          : alquileresFiltrados
        
        // Agrupar alquileres por soporte
        const soportesMap = new Map<string, SoportePlanificacion>()
        
        alquileresFiltradosPorEstado.forEach((alquiler) => {
          if (!alquiler.soporte) return
          
          const soporteId = alquiler.soporte.id
          const mesInicio = getMesInicioAlquiler(alquiler.fecha_inicio, alquiler.fecha_fin, año)
          
          if (!soportesMap.has(soporteId)) {
            soportesMap.set(soporteId, {
              id: soporteId,
              codigo: alquiler.soporte.codigo_cliente || alquiler.soporte.codigo_interno || `SOP-${soporteId}`,
              nombre: alquiler.soporte.nombre || 'Sin nombre',
              alquileres: []
            })
          }
          
          const soporte = soportesMap.get(soporteId)!
          const duracion = calcularDuracionEnAño(alquiler.fecha_inicio, alquiler.fecha_fin, año)
          
          // Obtener nombre del cliente
          const clienteNombre = alquiler.usuario?.empresa || alquiler.usuario?.nombre || null
          
          soporte.alquileres.push({
            id: alquiler.id,
            numero: alquiler.numero,
            cliente: clienteNombre,
            soporte_id: soporteId,
            soporte_codigo: alquiler.soporte.codigo_cliente || alquiler.soporte.codigo_interno || null,
            soporte_nombre: alquiler.soporte.nombre || null,
            inicio: alquiler.fecha_inicio,
            fin: alquiler.fecha_fin,
            meses: alquiler.meses,
            total: alquiler.precio_total,
            estado: alquiler.estado,
            mes: mesInicio,
            duracion: duracion
          })
        })
        
        const soportesArray = Array.from(soportesMap.values())
        
        // Ordenar soportes alfabéticamente por código
        soportesArray.sort((a, b) => {
          const codigoA = (a.codigo || '').toLowerCase()
          const codigoB = (b.codigo || '').toLowerCase()
          return codigoA.localeCompare(codigoB)
        })
        
        setSoportesPlanificacion(soportesArray)
      } else {
        setSoportesPlanificacion([])
      }
    } catch (error) {
      console.error('Error loading alquileres:', error)
      toast.error('Error al cargar los alquileres')
      setSoportesPlanificacion([])
    } finally {
      setLoading(false)
    }
  }, [año, filtroEstado])

  useEffect(() => {
    setCurrentPage(1)
  }, [año, searchTerm, filtroEstado, agrupador])

  useEffect(() => {
    loadAlquileres()
  }, [loadAlquileres])

  // Función para filtrar alquileres según el agrupador
  const filtrarAlquileresPorGrupo = (alquileres: SoportePlanificacion['alquileres'], grupoKey: string) => {
    if (agrupador === "ninguno") {
      return alquileres
    }

    return alquileres.filter(alq => {
      switch (agrupador) {
        case "cliente":
          return (alq.cliente || "Sin cliente") === grupoKey
        case "estado":
          return (alq.estado || "Sin estado") === grupoKey
        default:
          return true
      }
    })
  }

  // Función para agrupar soportes
  const agruparSoportes = (soportes: SoportePlanificacion[]) => {
    if (agrupador === "ninguno") {
      const soportesOrdenados = [...soportes].sort((a, b) => {
        const codigoA = (a.codigo || '').toLowerCase()
        const codigoB = (b.codigo || '').toLowerCase()
        return codigoA.localeCompare(codigoB)
      })
      return [{ grupo: null, soportes: soportesOrdenados }]
    }

    const gruposMap = new Map<string, SoportePlanificacion[]>()
    
    soportes.forEach(soporte => {
      const valoresUnicos = new Set<string>()
      
      switch (agrupador) {
        case "cliente":
          soporte.alquileres.forEach(a => {
            valoresUnicos.add(a.cliente || "Sin cliente")
          })
          break
        case "estado":
          soporte.alquileres.forEach(a => {
            valoresUnicos.add(a.estado || "Sin estado")
          })
          break
      }
      
      valoresUnicos.forEach(grupoKey => {
        if (!gruposMap.has(grupoKey)) {
          gruposMap.set(grupoKey, [])
        }
        
        const soporteFiltrado: SoportePlanificacion = {
          ...soporte,
          alquileres: filtrarAlquileresPorGrupo(soporte.alquileres, grupoKey)
        }
        
        if (soporteFiltrado.alquileres.length > 0) {
          gruposMap.get(grupoKey)!.push(soporteFiltrado)
        }
      })
    })
    
    const grupos = Array.from(gruposMap.entries()).map(([grupo, soportes]) => ({
      grupo,
      soportes: soportes.sort((a, b) => {
        const codigoA = (a.codigo || '').toLowerCase()
        const codigoB = (b.codigo || '').toLowerCase()
        return codigoA.localeCompare(codigoB)
      })
    }))
    
    grupos.sort((a, b) => a.grupo.localeCompare(b.grupo))
    
    return grupos
  }

  const todosLosGrupos = useMemo(() => {
    return agruparSoportes(soportesPlanificacion)
  }, [soportesPlanificacion, agrupador])
  
  const todosLosSoportesAplanados = useMemo(() => {
    const aplanados: Array<{ grupo: string | null, soporte: SoportePlanificacion }> = []
    todosLosGrupos.forEach(grupoData => {
      grupoData.soportes.forEach(soporte => {
        aplanados.push({ grupo: grupoData.grupo, soporte })
      })
    })
    return aplanados
  }, [todosLosGrupos])
  
  const soportesFiltradosAplanados = useMemo(() => {
    return todosLosSoportesAplanados.filter(({ soporte }) => {
      const searchLower = searchTerm.toLowerCase()
      return soporte.codigo.toLowerCase().includes(searchLower) ||
        soporte.nombre.toLowerCase().includes(searchLower) ||
        soporte.alquileres.some(a => 
          (a.cliente && a.cliente.toLowerCase().includes(searchLower)) ||
          (a.numero && a.numero.toLowerCase().includes(searchLower)) ||
          (a.soporte_codigo && a.soporte_codigo.toLowerCase().includes(searchLower))
        )
    })
  }, [todosLosSoportesAplanados, searchTerm])
  
  const { total, totalPages, soportesPaginados, gruposSoportes } = useMemo(() => {
    const soportesUnicosFiltrados = new Set(
      soportesFiltradosAplanados.map(({ soporte }) => soporte.id)
    )
    const totalCalculado = soportesUnicosFiltrados.size
    const totalPagesCalculado = Math.ceil(totalCalculado / 100)
    const from = (currentPage - 1) * 100
    const to = from + 100
    const soportesPaginadosCalculados = soportesFiltradosAplanados.slice(from, to)
    
    const gruposMapPaginados = new Map<string | null, SoportePlanificacion[]>()
    soportesPaginadosCalculados.forEach(({ grupo, soporte }) => {
      if (!gruposMapPaginados.has(grupo)) {
        gruposMapPaginados.set(grupo, [])
      }
      gruposMapPaginados.get(grupo)!.push(soporte)
    })
    
    const gruposSoportesCalculados = Array.from(gruposMapPaginados.entries()).map(([grupo, soportes]) => ({
      grupo,
      soportes: soportes.sort((a, b) => {
        const codigoA = (a.codigo || '').toLowerCase()
        const codigoB = (b.codigo || '').toLowerCase()
        return codigoA.localeCompare(codigoB)
      })
    })).sort((a, b) => {
      if (a.grupo === null && b.grupo === null) return 0
      if (a.grupo === null) return 1
      if (b.grupo === null) return -1
      return a.grupo.localeCompare(b.grupo)
    })
    
    return {
      total: totalCalculado,
      totalPages: totalPagesCalculado,
      soportesPaginados: soportesPaginadosCalculados,
      gruposSoportes: gruposSoportesCalculados
    }
  }, [soportesFiltradosAplanados, currentPage])
  
  const pagination = useMemo(() => ({
    page: currentPage,
    limit: 100,
    total,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }), [currentPage, total, totalPages])

  // Función para detectar si dos alquileres se solapan
  const seSolapan = (alq1: { mes: string; duracion: number }, alq2: { mes: string; duracion: number }): boolean => {
    const inicio1 = getMesIndex(alq1.mes)
    const fin1 = inicio1 + alq1.duracion - 1
    const inicio2 = getMesIndex(alq2.mes)
    const fin2 = inicio2 + alq2.duracion - 1
    
    return inicio1 <= fin2 && inicio2 <= fin1
  }

  // Función para agrupar alquileres en filas según solapamientos
  const agruparEnFilas = (alquileres: SoportePlanificacion['alquileres']) => {
    const filas: Array<Array<SoportePlanificacion['alquileres'][0] & { fila: number }>> = []
    
    alquileres.forEach((alq) => {
      let filaEncontrada = false
      for (let i = 0; i < filas.length; i++) {
        const noSeSolapaConNinguno = filas[i].every((alqExistente) => !seSolapan(alq, alqExistente))
        if (noSeSolapaConNinguno) {
          filas[i].push({ ...alq, fila: i })
          filaEncontrada = true
          break
        }
      }
      
      if (!filaEncontrada) {
        filas.push([{ ...alq, fila: filas.length }])
      }
    })
    
    return filas.flat()
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = parseUTC(dateString)
    if (!date) return dateString
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC' })
  }

  // Función para formatear precio
  const formatPrice = (price: number | null) => {
    if (price === null) return '0.00 Bs'
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' Bs'
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNext) {
      handlePageChange(currentPage + 1)
    }
  }

  return (
    <div className="p-2 sm:p-3 lg:p-4">
      <Toaster />
      <main className="w-full max-w-full py-4 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Planificación Anual</h1>
          <p className="text-gray-600">Visualiza la ocupación de soportes publicitarios a lo largo del año</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente, código o soporte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filtro por Estado */}
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-52 [&>span]:text-black !pl-9 !pr-3 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(ESTADOS_ALQUILER).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${meta.className}`}></span>
                        {meta.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Agrupador */}
              <Select value={agrupador} onValueChange={(value) => setAgrupador(value as typeof agrupador)}>
                <SelectTrigger className="w-48 [&>span]:text-black !pl-9 !pr-3 relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
                  <SelectValue placeholder="Agrupar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Sin agrupar</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="estado">Estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAño(año - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[80px] text-center">{año}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAño(año + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo - {año} ({total})</CardTitle>
            <CardDescription>
              Ocupación de soportes publicitarios por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D54644] mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando planificación...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-0 w-full">
                  {/* Header con meses */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <div className="flex-shrink-0 w-48 p-3 font-medium text-gray-900 border-r border-gray-200">
                      Soporte
                    </div>
                    <div className="flex-1 flex">
                      {meses.map((mes) => (
                        <div key={mes} className="flex-1 p-2 text-center font-medium text-gray-900 border-r border-gray-200 text-xs">
                          {mes.charAt(0).toUpperCase() + mes.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filas de soportes */}
                  {total === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No se encontraron soportes con ese criterio de búsqueda' : 'No hay alquileres para este año'}
                    </div>
                  ) : (
                    gruposSoportes.map((grupoData, grupoIndex) => (
                      <div key={grupoIndex}>
                        {grupoData.grupo && (
                          <div className="bg-gray-100 border-b-2 border-gray-300 py-2 px-3 font-semibold text-gray-700 sticky top-0 z-10">
                            {agrupador === "estado" && grupoData.grupo !== "Sin estado" ? (
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${ESTADOS_ALQUILER[grupoData.grupo as keyof typeof ESTADOS_ALQUILER]?.className || 'bg-gray-100'}`}></span>
                                {ESTADOS_ALQUILER[grupoData.grupo as keyof typeof ESTADOS_ALQUILER]?.label || grupoData.grupo}
                                <span className="text-sm font-normal text-gray-500">({grupoData.soportes.length})</span>
                              </div>
                            ) : (
                              <span>
                                {grupoData.grupo}
                                <span className="text-sm font-normal text-gray-500 ml-2">({grupoData.soportes.length})</span>
                              </span>
                            )}
                          </div>
                        )}
                        {grupoData.soportes.map((soporte) => (
                      <div key={soporte.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                        {/* Información del soporte */}
                        <div className="flex-shrink-0 w-48 p-3 border-r border-gray-200">
                          <div className="space-y-1">
                            <div>
                              {soporte.nombre ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="text-left">
                                      <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-gray-800 border border-neutral-200">
                                        {soporte.codigo}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">{soporte.nombre}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-gray-800 border border-neutral-200">
                                  {soporte.codigo}
                                </span>
                              )}
                            </div>
                            <div>
                              {soporte.nombre && soporte.nombre.length > 15 ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="text-left">
                                      <span className="text-sm text-gray-600">{soporte.nombre.slice(0, 15) + '…'}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">{soporte.nombre}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-sm text-gray-600">{soporte.nombre || 'Sin nombre'}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reservas por mes */}
                        {(() => {
                          const alquileresConFila = agruparEnFilas(soporte.alquileres)
                          const numFilas = Math.max(...alquileresConFila.map(a => a.fila), -1) + 1
                          const alturaFila = 56
                          const alturaTotal = Math.max(60, numFilas * alturaFila + 8)
                          
                          return (
                            <div className="flex-1 relative" style={{ minHeight: `${alturaTotal}px` }}>
                              <div className="absolute inset-0 flex">
                                {meses.map((mes) => (
                                  <div key={mes} className="flex-shrink-0 flex-1 border-r border-gray-200"></div>
                                ))}
                              </div>
                              
                              <div className="relative h-full p-1">
                                {alquileresConFila.map((reserva) => {
                                  const mesInicioIndex = getMesIndex(reserva.mes)
                                  const anchoMes = 100 / 12
                                  const left = mesInicioIndex * anchoMes
                                  const width = reserva.duracion * anchoMes
                                  
                                  return (
                                    <TooltipProvider key={reserva.id}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className="absolute bg-blue-500 text-white text-xs p-2 rounded cursor-pointer hover:bg-blue-600 transition-colors"
                                            style={{
                                              left: `${left}%`,
                                              width: `${width}%`,
                                              top: `${reserva.fila * alturaFila + 4}px`,
                                              height: `${alturaFila - 8}px`,
                                              zIndex: 10
                                            }}
                                          >
                                            <div className="font-medium truncate leading-tight">
                                              {reserva.cliente && reserva.cliente.length > 8 ? reserva.cliente.substring(0, 8) + '...' : (reserva.cliente || 'Sin cliente')}
                                            </div>
                                            <div className="text-xs opacity-75 leading-tight mt-0.5">
                                              {reserva.meses || reserva.duracion} mes{(reserva.meses || reserva.duracion) > 1 ? 'es' : ''}
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="w-80 bg-white p-4 shadow-lg" side="top" align="start">
                                          <div className="space-y-2">
                                            <div className="font-semibold text-sm border-b pb-2 text-gray-900">Detalles del Alquiler</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              <div>
                                                <span className="font-medium text-gray-600">Número:</span>
                                                <div className="text-gray-900">{reserva.numero}</div>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-600">Estado:</span>
                                                <div className="text-gray-900">{reserva.estado || '-'}</div>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-600">Inicio:</span>
                                                <div className="text-gray-900">{formatDate(reserva.inicio)}</div>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-600">Fin:</span>
                                                <div className="text-gray-900">{formatDate(reserva.fin)}</div>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-600">Meses:</span>
                                                <div className="text-gray-900">{reserva.meses || reserva.duracion}</div>
                                              </div>
                                              <div>
                                                <span className="font-medium text-gray-600">Soporte:</span>
                                                <div className="text-gray-900">{reserva.soporte_codigo || '-'}</div>
                                              </div>
                                              <div className="col-span-2">
                                                <span className="font-medium text-gray-600">Cliente:</span>
                                                <div className="text-gray-900">{reserva.cliente || '-'}</div>
                                              </div>
                                              <div className="col-span-2">
                                                <span className="font-medium text-gray-600">Total:</span>
                                                <div className="text-gray-900 font-semibold">{formatPrice(reserva.total)}</div>
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPrev || loading}
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={currentPage === pageNum ? "bg-[#D54644] text-white hover:bg-[#B73E3A]" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage}
                    disabled={!pagination.hasNext || loading}
                  >
                    Siguiente
                  </Button>
                </div>
                
                <div className="ml-4 text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * 100) + 1} - {Math.min(currentPage * 100, pagination.total)} de {pagination.total} items
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
