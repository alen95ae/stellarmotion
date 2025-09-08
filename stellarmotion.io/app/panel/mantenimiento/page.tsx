import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Monitor
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mantenimiento - Panel de Control | StellarMotion',
  description: 'Gestión de incidencias y mantenimiento técnico'
};

// Mock data
const tickets = [
  {
    id: '1',
    numero: 'MNT-2025-001',
    titulo: 'Pantalla LED no enciende',
    soporte: 'Pantalla LED Centro - P005',
    descripcion: 'La pantalla LED no se enciende desde ayer por la mañana. Posible problema eléctrico.',
    prioridad: 'alta',
    estado: 'pendiente',
    asignadoA: 'Juan Pérez',
    fechaCreacion: '2025-01-08',
    fechaActualizacion: '2025-01-08',
    fechaResolucion: null,
    cliente: 'Banco Nacional'
  },
  {
    id: '2',
    numero: 'MNT-2025-002',
    titulo: 'Valla dañada por viento',
    soporte: 'Valla Zona Sur - A001',
    descripcion: 'La valla presenta daños en la esquina superior derecha debido a vientos fuertes.',
    prioridad: 'media',
    estado: 'en_progreso',
    asignadoA: 'María González',
    fechaCreacion: '2025-01-07',
    fechaActualizacion: '2025-01-08',
    fechaResolucion: null,
    cliente: 'Coca Cola Bolivia'
  },
  {
    id: '3',
    numero: 'MNT-2025-003',
    titulo: 'Limpieza rutinaria MUPI',
    soporte: 'MUPI Avenida Arce - M012',
    descripcion: 'Limpieza rutinaria programada del MUPI. Incluye limpieza de cristal y estructura.',
    prioridad: 'baja',
    estado: 'resuelto',
    asignadoA: 'Carlos Mendoza',
    fechaCreacion: '2025-01-05',
    fechaActualizacion: '2025-01-06',
    fechaResolucion: '2025-01-06',
    cliente: 'Supermercados Ketal'
  },
  {
    id: '4',
    numero: 'MNT-2025-004',
    titulo: 'Iluminación defectuosa',
    soporte: 'Valla Carretera Norte - V008',
    descripcion: 'Dos de las cuatro lámparas de iluminación nocturna no funcionan correctamente.',
    prioridad: 'media',
    estado: 'pendiente',
    asignadoA: null,
    fechaCreacion: '2025-01-09',
    fechaActualizacion: '2025-01-09',
    fechaResolucion: null,
    cliente: 'Cervecería Nacional'
  },
  {
    id: '5',
    numero: 'MNT-2025-005',
    titulo: 'Vandalismo en totem',
    soporte: 'Totem Centro Comercial - T003',
    descripcion: 'El totem presenta grafitis y daños menores por vandalismo. Requiere limpieza y reparación.',
    prioridad: 'urgente',
    estado: 'en_progreso',
    asignadoA: 'Ana Rodríguez',
    fechaCreacion: '2025-01-09',
    fechaActualizacion: '2025-01-09',
    fechaResolucion: null,
    cliente: 'Telecom Bolivia'
  }
];

const prioridadColors = {
  baja: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800'
};

const estadoColors = {
  pendiente: 'bg-gray-100 text-gray-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  resuelto: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800'
};

const estadoIcons = {
  pendiente: Clock,
  en_progreso: Wrench,
  resuelto: CheckCircle,
  cancelado: XCircle
};

export default function MantenimientoPage() {
  const totalTickets = tickets.length;
  const ticketsPendientes = tickets.filter(t => t.estado === 'pendiente').length;
  const ticketsEnProgreso = tickets.filter(t => t.estado === 'en_progreso').length;
  const ticketsResueltos = tickets.filter(t => t.estado === 'resuelto').length;
  const ticketsUrgentes = tickets.filter(t => t.prioridad === 'urgente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="mt-2 text-gray-600">
            Gestión de incidencias técnicas y mantenimiento de soportes
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Incidencia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Sin asignar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsEnProgreso}</div>
            <p className="text-xs text-muted-foreground">
              En curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsResueltos}</div>
            <p className="text-xs text-muted-foreground">
              Completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ticketsUrgentes}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o soporte..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Incidencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => {
                  const IconComponent = estadoIcons[ticket.estado as keyof typeof estadoIcons];
                  const isUrgente = ticket.prioridad === 'urgente';
                  return (
                    <tr key={ticket.id} className={`hover:bg-gray-50 ${isUrgente ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.numero}</div>
                        <div className="text-sm text-gray-500">{ticket.cliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                          <div className="text-sm text-gray-900">{ticket.soporte}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ticket.titulo}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={prioridadColors[ticket.prioridad as keyof typeof prioridadColors]}>
                          {ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex items-center ${estadoColors[ticket.estado as keyof typeof estadoColors]}`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {ticket.estado.replace('_', ' ').charAt(0).toUpperCase() + ticket.estado.replace('_', ' ').slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.asignadoA ? (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">{ticket.asignadoA}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES')}
                        </div>
                        {ticket.fechaResolucion && (
                          <div className="text-sm text-green-600">
                            Resuelto: {new Date(ticket.fechaResolucion).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" title="Ver detalles">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" title="Editar ticket">
                            <Edit className="w-3 h-3" />
                          </Button>
                          {ticket.estado === 'en_progreso' && (
                            <Button variant="outline" size="sm" title="Marcar como resuelto" className="text-green-600">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Crear ticket de mantenimiento rutinario
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Reportar incidencia urgente
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Asignar técnico a ticket
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Programar mantenimiento preventivo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-900">Tickets abiertos hoy</div>
                  <div className="text-xs text-blue-600">Nuevas incidencias</div>
                </div>
                <div className="text-2xl font-bold text-blue-900">2</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-green-900">Tickets resueltos hoy</div>
                  <div className="text-xs text-green-600">Completados</div>
                </div>
                <div className="text-2xl font-bold text-green-900">1</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-yellow-900">Tiempo promedio resolución</div>
                  <div className="text-xs text-yellow-600">Últimos 30 días</div>
                </div>
                <div className="text-2xl font-bold text-yellow-900">2.3 días</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
