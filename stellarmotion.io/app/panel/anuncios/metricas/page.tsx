'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react'

// Mock data para métricas
const mockMetrics = {
  totalImpressions: 1250000,
  totalClicks: 25000,
  totalCTR: 2.0,
  totalSpent: 15000,
  totalConversions: 1250,
  avgCPC: 0.60,
  avgCPM: 12.00,
  dailyData: [
    { date: '2024-06-01', impressions: 45000, clicks: 900, ctr: 2.0, spent: 540 },
    { date: '2024-06-02', impressions: 52000, clicks: 1040, ctr: 2.0, spent: 624 },
    { date: '2024-06-03', impressions: 48000, clicks: 960, ctr: 2.0, spent: 576 },
    { date: '2024-06-04', impressions: 55000, clicks: 1100, ctr: 2.0, spent: 660 },
    { date: '2024-06-05', impressions: 51000, clicks: 1020, ctr: 2.0, spent: 612 },
    { date: '2024-06-06', impressions: 47000, clicks: 940, ctr: 2.0, spent: 564 },
    { date: '2024-06-07', impressions: 53000, clicks: 1060, ctr: 2.0, spent: 636 }
  ],
  campaignBreakdown: [
    { name: 'Campaña Verano 2024', impressions: 450000, clicks: 9000, ctr: 2.0, spent: 5400 },
    { name: 'Black Friday 2024', impressions: 380000, clicks: 7600, ctr: 2.0, spent: 4560 },
    { name: 'Lanzamiento Producto', impressions: 420000, clicks: 8400, ctr: 2.0, spent: 5040 }
  ],
  deviceBreakdown: [
    { device: 'Desktop', impressions: 500000, clicks: 10000, ctr: 2.0 },
    { device: 'Mobile', impressions: 600000, clicks: 12000, ctr: 2.0 },
    { device: 'Tablet', impressions: 150000, clicks: 3000, ctr: 2.0 }
  ]
}

export default function MetricasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedCampaign, setSelectedCampaign] = useState('all')

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métricas de Anuncios</h1>
          <p className="mt-2 text-gray-600">
            Análisis de rendimiento de tus campañas publicitarias
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las campañas</SelectItem>
              <SelectItem value="verano">Campaña Verano 2024</SelectItem>
              <SelectItem value="blackfriday">Black Friday 2024</SelectItem>
              <SelectItem value="lanzamiento">Lanzamiento Producto</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impresiones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockMetrics.totalImpressions)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +12% desde el período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockMetrics.totalClicks)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +8% desde el período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalCTR}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              -0.2% desde el período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockMetrics.totalSpent)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +15% desde el período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de tendencias</p>
              <p className="text-sm text-gray-400">Integrar con librería de gráficos (Chart.js, Recharts, etc.)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desglose por Campaña */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Campaña</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.campaignBreakdown.map((campaign, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <span className="text-sm text-gray-500">{formatCurrency(campaign.spent)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Impresiones</p>
                      <p className="font-medium">{formatNumber(campaign.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-medium">{formatNumber(campaign.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CTR</p>
                      <p className="font-medium">{campaign.ctr}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Desglose por Dispositivo */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.deviceBreakdown.map((device, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{device.device}</h3>
                    <span className="text-sm text-gray-500">{device.ctr}% CTR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Impresiones</p>
                      <p className="font-medium">{formatNumber(device.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-medium">{formatNumber(device.clicks)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de datos diarios */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Diarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Impresiones</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Clicks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CTR</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Gasto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CPC</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CPM</th>
                </tr>
              </thead>
              <tbody>
                {mockMetrics.dailyData.map((day, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {formatNumber(day.impressions)}
                    </td>
                    <td className="py-3 px-4">
                      {formatNumber(day.clicks)}
                    </td>
                    <td className="py-3 px-4">
                      {day.ctr}%
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(day.spent)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(day.spent / day.clicks)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency((day.spent / day.impressions) * 1000)}
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
