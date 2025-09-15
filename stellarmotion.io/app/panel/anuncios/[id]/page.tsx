'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  Pause,
  Play,
  Square,
  Copy,
  Trash2,
  Plus,
  Upload,
  Eye,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  MapPin,
  Image as ImageIcon,
  FileText
} from 'lucide-react'

// Mock data
const mockCampaign = {
  id: '1',
  title: 'Campaña Verano 2024',
  status: 'ACTIVO',
  objective: 'Awareness',
  startDate: '2024-06-01',
  endDate: '2024-08-31',
  budget: 5000,
  currency: 'EUR',
  placements: [
    {
      id: 'p1',
      supportId: 'VALL001',
      supportName: 'Valla Centro Comercial',
      location: 'Centro Comercial Plaza',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      priceMonth: 1200,
      estimatedImpressions: 45000
    },
    {
      id: 'p2',
      supportId: 'LED002',
      supportName: 'Pantalla LED Calle Principal',
      location: 'Calle Principal 123',
      startDate: '2024-06-15',
      endDate: '2024-08-15',
      priceMonth: 800,
      estimatedImpressions: 60000
    }
  ],
  creatives: [
    {
      id: 'c1',
      type: 'image',
      url: '/placeholder.jpg',
      name: 'Banner Verano 1.jpg',
      uploadedAt: '2024-05-28'
    },
    {
      id: 'c2',
      type: 'video',
      url: '/placeholder-video.mp4',
      name: 'Video Promocional.mp4',
      uploadedAt: '2024-05-30'
    }
  ],
  metrics: [
    { date: '2024-06-01', impressions: 1200, clicks: 24, ctr: 2.0 },
    { date: '2024-06-02', impressions: 1350, clicks: 27, ctr: 2.0 },
    { date: '2024-06-03', impressions: 1100, clicks: 22, ctr: 2.0 }
  ]
}

export default function CampaignDetailPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState(mockCampaign)
  const [isEditing, setIsEditing] = useState(false)

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

  const handleStatusChange = (newStatus: string) => {
    setCampaign(prev => ({ ...prev, status: newStatus }))
  }

  const handleDuplicate = () => {
    // Lógica para duplicar campaña
    console.log('Duplicar campaña')
  }

  const handleDelete = () => {
    // Lógica para eliminar campaña
    console.log('Eliminar campaña')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {campaign.title}
              {getStatusBadge(campaign.status)}
            </h1>
            <p className="text-gray-600">ID: {campaign.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
          {campaign.status === 'ACTIVO' ? (
            <Button variant="outline" onClick={() => handleStatusChange('PAUSADO')}>
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          ) : campaign.status === 'PAUSADO' ? (
            <Button variant="outline" onClick={() => handleStatusChange('ACTIVO')}>
              <Play className="w-4 h-4 mr-2" />
              Reanudar
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{campaign.budget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soportes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.placements.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impresiones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.metrics.reduce((sum, m) => sum + m.impressions, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(campaign.metrics.reduce((sum, m) => sum + m.ctr, 0) / campaign.metrics.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="placements">Soportes</TabsTrigger>
          <TabsTrigger value="creatives">Creatividades</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Campaña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={campaign.title}
                    onChange={(e) => setCampaign(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="objective">Objetivo</Label>
                  <Input
                    id="objective"
                    value={campaign.objective}
                    onChange={(e) => setCampaign(prev => ({ ...prev, objective: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={campaign.startDate}
                      onChange={(e) => setCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={campaign.endDate}
                      onChange={(e) => setCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Presupuesto</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={campaign.budget}
                      onChange={(e) => setCampaign(prev => ({ ...prev, budget: Number(e.target.value) }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Input
                      id="currency"
                      value={campaign.currency}
                      onChange={(e) => setCampaign(prev => ({ ...prev, currency: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <Button className="w-full">
                    Guardar Cambios
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Campaña activada</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Creatividad actualizada</p>
                      <p className="text-xs text-gray-500">Hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Soporte añadido</p>
                      <p className="text-xs text-gray-500">Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="placements" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Soportes Asignados</CardTitle>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Añadir Soporte
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.placements.map((placement) => (
                  <div key={placement.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{placement.supportName}</h3>
                        <p className="text-sm text-gray-600">{placement.location}</p>
                        <p className="text-sm text-gray-500">ID: {placement.supportId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{placement.priceMonth}/mes</p>
                        <p className="text-sm text-gray-600">{placement.estimatedImpressions.toLocaleString()} imp/día</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(placement.startDate).toLocaleDateString()} - {new Date(placement.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creatives" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Creatividades</CardTitle>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaign.creatives.map((creative) => (
                  <div key={creative.id} className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {creative.type === 'image' ? (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      ) : creative.type === 'video' ? (
                        <FileText className="w-8 h-8 text-gray-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm truncate">{creative.name}</h3>
                    <p className="text-xs text-gray-500">
                      Subido el {new Date(creative.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(metric.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div>
                        <p className="text-gray-500">Impresiones</p>
                        <p className="font-medium">{metric.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Clicks</p>
                        <p className="font-medium">{metric.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">CTR</p>
                        <p className="font-medium">{metric.ctr}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
