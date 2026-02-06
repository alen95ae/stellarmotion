'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Printer,
  Calendar,
  MapPin
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Impresion {
  id: string
  soporte_id: string
  soporte_nombre: string
  cliente_nombre: string
  fecha: string
  tipo: string
  estado: string
  cantidad: number
  ubicacion?: string
}

export default function ImpresionesPage() {
  const [impresiones, setImpresiones] = useState<Impresion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')

  useEffect(() => {
    fetchImpresiones()
  }, [])

  const fetchImpresiones = async () => {
    try {
      setLoading(true)
      // TODO: Implementar API endpoint para impresiones
      // const response = await fetch('/api/impresiones')
      // const data = await response.json()
      // setImpresiones(data)
      
      // Datos de ejemplo por ahora
      setImpresiones([])
    } catch (error) {
      console.error('Error fetching impresiones:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredImpresiones = impresiones.filter(imp => {
    const matchesSearch = 
      imp.soporte_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'all' || imp.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const getEstadoBadge = (estado: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      'PENDIENTE': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'EN_PROCESO': { label: 'En Proceso', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'COMPLETADA': { label: 'Completada', className: 'bg-green-100 text-green-800 border-green-200' },
      'CANCELADA': { label: 'Cancelada', className: 'bg-red-100 text-red-800 border-red-200' },
    }
    const config = configs[estado] || { label: estado, className: 'bg-gray-100 text-gray-800 border-gray-200' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Impresiones</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Administra todas las impresiones de tus soportes publicitarios
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-[#e94446] hover:bg-[#d63a3a]">
          <Printer className="h-4 w-4" />
          Nueva Impresión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Impresiones</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{impresiones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {impresiones.filter(i => i.estado === 'PENDIENTE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En Proceso</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {impresiones.filter(i => i.estado === 'EN_PROCESO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {impresiones.filter(i => i.estado === 'COMPLETADA').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar impresiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
            <SelectItem value="COMPLETADA">Completada</SelectItem>
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Impresiones Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Cargando impresiones...</p>
          </CardContent>
        </Card>
      ) : filteredImpresiones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay impresiones</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterEstado !== 'all' 
                ? 'No se encontraron impresiones con los filtros aplicados.'
                : 'Comienza registrando tu primera impresión.'
              }
            </p>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Registrar Primera Impresión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Impresiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Soporte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredImpresiones.map((impresion) => (
                    <tr key={impresion.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {impresion.soporte_nombre}
                        </div>
                        {impresion.ubicacion && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {impresion.ubicacion}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {impresion.cliente_nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(impresion.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {impresion.tipo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {impresion.cantidad}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(impresion.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" title="Ver">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Descargar">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
