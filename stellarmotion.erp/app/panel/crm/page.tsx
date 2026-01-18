'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  Filter,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Sidebar from '@/components/dashboard/Sidebar'

interface CRMStats {
  totalLeads: number
  totalAccounts: number
  totalOpportunities: number
  totalWon: number
  totalLost: number
  pipelineValue: number
  wonValue: number
}

interface Lead {
  id: string
  nombre: string
  email: string
  empresa?: string
  status: string
  score: number
  source: string
  created_at: string
}

interface Opportunity {
  id: string
  nombre: string
  importe_estimado: number
  moneda: string
  probabilidad_cierre: number
  fecha_cierre_estimada?: string
  is_won: boolean
  is_lost: boolean
  account?: {
    nombre: string
  }
}

export default function CRMPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CRMStats>({
    totalLeads: 0,
    totalAccounts: 0,
    totalOpportunities: 0,
    totalWon: 0,
    totalLost: 0,
    pipelineValue: 0,
    wonValue: 0
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Datos de ejemplo (mock) - sin conexión a BD
    loadMockData()
  }, [])

  const loadMockData = () => {
    setLoading(true)
    
    // Simular carga
    setTimeout(() => {
      // Datos de ejemplo para leads
      const mockLeads: Lead[] = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          email: 'juan@empresa.com',
          empresa: 'Empresa S.L.',
          status: 'qualified',
          score: 85,
          source: 'web',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'María García',
          email: 'maria@agencia.com',
          empresa: 'Agencia Publicitaria',
          status: 'contacted',
          score: 72,
          source: 'referral',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          nombre: 'Carlos López',
          email: 'carlos@anunciante.com',
          empresa: 'Anunciante Corp',
          status: 'new',
          score: 45,
          source: 'email',
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '4',
          nombre: 'Ana Martínez',
          email: 'ana@partner.com',
          empresa: 'Partner OOH',
          status: 'qualified',
          score: 90,
          source: 'event',
          created_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: '5',
          nombre: 'Pedro Sánchez',
          email: 'pedro@cliente.com',
          empresa: 'Cliente Premium',
          status: 'contacted',
          score: 68,
          source: 'phone',
          created_at: new Date(Date.now() - 345600000).toISOString()
        }
      ]

      // Datos de ejemplo para oportunidades
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          nombre: 'Campaña Q1 2025 - Madrid',
          importe_estimado: 15000,
          moneda: 'EUR',
          probabilidad_cierre: 75,
          fecha_cierre_estimada: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          is_won: false,
          is_lost: false,
          account: { nombre: 'Empresa S.L.' }
        },
        {
          id: '2',
          nombre: 'Campaña Digital Barcelona',
          importe_estimado: 8500,
          moneda: 'EUR',
          probabilidad_cierre: 50,
          fecha_cierre_estimada: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          is_won: false,
          is_lost: false,
          account: { nombre: 'Agencia Publicitaria' }
        },
        {
          id: '3',
          nombre: 'Campaña Verano 2025',
          importe_estimado: 25000,
          moneda: 'EUR',
          probabilidad_cierre: 25,
          fecha_cierre_estimada: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          is_won: false,
          is_lost: false,
          account: { nombre: 'Anunciante Corp' }
        },
        {
          id: '4',
          nombre: 'Campaña Navidad 2024',
          importe_estimado: 12000,
          moneda: 'EUR',
          probabilidad_cierre: 100,
          fecha_cierre_estimada: new Date().toISOString().split('T')[0],
          is_won: true,
          is_lost: false,
          account: { nombre: 'Partner OOH' }
        },
        {
          id: '5',
          nombre: 'Campaña Invierno',
          importe_estimado: 5000,
          moneda: 'EUR',
          probabilidad_cierre: 0,
          fecha_cierre_estimada: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          is_won: false,
          is_lost: true,
          account: { nombre: 'Cliente Premium' }
        }
      ]

      // Calcular estadísticas
      const wonOpps = mockOpportunities.filter((o) => o.is_won)
      const lostOpps = mockOpportunities.filter((o) => o.is_lost)
      const pipelineValue = mockOpportunities
        .filter((o) => !o.is_won && !o.is_lost)
        .reduce((sum, o) => sum + (o.importe_estimado || 0), 0)
      const wonValue = wonOpps.reduce((sum, o) => sum + (o.importe_final || o.importe_estimado || 0), 0)

      setStats({
        totalLeads: mockLeads.length,
        totalAccounts: 5,
        totalOpportunities: mockOpportunities.length,
        totalWon: wonOpps.length,
        totalLost: lostOpps.length,
        pipelineValue,
        wonValue
      })

      // Leads recientes (últimos 5)
      setRecentLeads(mockLeads.slice(0, 5))

      // Oportunidades recientes (últimas 5, no ganadas ni perdidas)
      const activeOpps = mockOpportunities
        .filter((o) => !o.is_won && !o.is_lost)
        .slice(0, 5)
      setRecentOpportunities(activeOpps)

      setLoading(false)
    }, 500) // Simular delay de carga
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'phone':
        return <Phone className="w-4 h-4" />
      case 'web':
        return <Building2 className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
              <p className="text-gray-600 mt-1">Gestión de leads, cuentas y oportunidades</p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
                📊 Modo demo: Mostrando datos de ejemplo (sin conexión a BD)
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/panel/crm/leads')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Ver Leads
              </Button>
              <Button
                onClick={() => router.push('/panel/crm/leads/nuevo')}
                className="bg-[#e94446] hover:bg-[#d63a3a] text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Lead
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">Leads activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuentas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAccounts}</div>
                <p className="text-xs text-muted-foreground">Cuentas registradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(stats.pipelineValue)}
                </div>
                <p className="text-xs text-muted-foreground">{stats.totalOpportunities} oportunidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganadas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(stats.wonValue)}
                </div>
                <p className="text-xs text-muted-foreground">{stats.totalWon} oportunidades ganadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leads Recientes</CardTitle>
                  <CardDescription>Últimos leads agregados al sistema</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/panel/crm/leads')}
                  className="flex items-center gap-2"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : recentLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay leads aún. <Button variant="link" onClick={() => router.push('/panel/crm/leads/nuevo')}>Crear primer lead</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/panel/crm/leads/${lead.id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getSourceIcon(lead.source)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{lead.nombre}</p>
                            {lead.empresa && (
                              <span className="text-sm text-gray-500">- {lead.empresa}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">Score: {lead.score}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(lead.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Opportunities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Oportunidades Activas</CardTitle>
                  <CardDescription>Oportunidades en el pipeline</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/panel/crm/opportunities')}
                  className="flex items-center gap-2"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : recentOpportunities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay oportunidades activas. <Button variant="link" onClick={() => router.push('/panel/crm/opportunities/nuevo')}>Crear oportunidad</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/panel/crm/opportunities/${opp.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{opp.nombre}</p>
                          {opp.account && (
                            <span className="text-sm text-gray-500">- {opp.account.nombre}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: opp.moneda || 'EUR'
                            }).format(opp.importe_estimado)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {opp.probabilidad_cierre}%
                          </span>
                          {opp.fecha_cierre_estimada && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(opp.fecha_cierre_estimada).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  )
}


