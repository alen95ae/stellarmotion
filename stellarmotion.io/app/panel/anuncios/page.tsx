'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Pause, 
  Play, 
  Square, 
  Copy,
  Trash2,
  TrendingUp,
  Calendar,
  Target,
  DollarSign
} from 'lucide-react'

// Mock data - en producción vendría de la API
const mockCampaigns = [
  {
    id: '1',
    title: 'Campaña Verano 2024',
    status: 'ACTIVO',
    objective: 'Awareness',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    budget: 5000,
    currency: 'EUR',
    placements: 3,
    impressions: 125000,
    clicks: 2500,
    ctr: 2.0
  },
  {
    id: '2',
    title: 'Black Friday 2024',
    status: 'PAUSADO',
    objective: 'Conversión',
    startDate: '2024-11-20',
    endDate: '2024-11-30',
    budget: 8000,
    currency: 'EUR',
    placements: 5,
    impressions: 89000,
    clicks: 1780,
    ctr: 2.0
  },
  {
    id: '3',
    title: 'Lanzamiento Producto',
    status: 'BORRADOR',
    objective: 'Tráfico',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    budget: 3000,
    currency: 'EUR',
    placements: 2,
    impressions: 0,
    clicks: 0,
    ctr: 0
  }
]

export default function AnunciosPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns)

  useEffect(() => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    const variants = {
      'ACTIVO': 'default',
      'PAUSADO': 'secondary', 
      'BORRADOR': 'outline',
      'FINALIZADO': 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVO': 'text-green-600',
      'PAUSADO': 'text-yellow-600',
      'BORRADOR': 'text-gray-600',
      'FINALIZADO': 'text-red-600'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Anuncios</h1>
          <p className="mt-2 text-gray-600">
            Administra tus campañas publicitarias activas
          </p>
        </div>
        <Button className="bg-[#D54644] hover:bg-[#B03A38] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVO').length}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impresiones Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +0.3% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="PAUSADO">Pausado</SelectItem>
                <SelectItem value="BORRADOR">Borrador</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campañas ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Campaña</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Objetivo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Período</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Presupuesto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Soportes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Métricas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-sm text-gray-500">ID: {campaign.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{campaign.objective}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium">
                        €{campaign.budget.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {campaign.placements} soportes
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">
                          {campaign.impressions.toLocaleString()} impresiones
                        </div>
                        <div className="text-gray-600">
                          {campaign.clicks.toLocaleString()} clicks
                        </div>
                        <div className="text-gray-600">
                          CTR: {campaign.ctr}%
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'ACTIVO' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : campaign.status === 'PAUSADO' ? (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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
    </div>
  )
}
