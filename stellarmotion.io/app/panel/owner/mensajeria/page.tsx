import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Bell, 
  Search, 
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Calendar,
  FileText,
  Wrench,
  DollarSign,
  AlertTriangle,
  Info
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mensajería - Panel de Control | StellarMotion',
  description: 'Centro de notificaciones y mensajes'
};

// Mock data
const mensajes = [
  {
    id: '1',
    tipo: 'reserva',
    titulo: 'Nueva reserva confirmada',
    contenido: 'La reserva RES-2025-001 de Coca Cola Bolivia ha sido confirmada para la Valla Zona Sur - A001.',
    leido: false,
    fechaCreacion: '2025-01-09T10:30:00',
    prioridad: 'normal'
  },
  {
    id: '2',
    tipo: 'factura',
    titulo: 'Factura vencida',
    contenido: 'La factura FAC-2024-045 de Cervecería Nacional está vencida desde el 31 de diciembre.',
    leido: false,
    fechaCreacion: '2025-01-09T09:15:00',
    prioridad: 'alta'
  },
  {
    id: '3',
    tipo: 'mantenimiento',
    titulo: 'Ticket de mantenimiento asignado',
    contenido: 'El ticket MNT-2025-002 ha sido asignado a María González para la Valla Zona Sur.',
    leido: true,
    fechaCreacion: '2025-01-08T16:45:00',
    prioridad: 'normal'
  },
  {
    id: '4',
    tipo: 'sistema',
    titulo: 'Actualización del sistema',
    contenido: 'El sistema se actualizará esta noche entre las 2:00 AM y 4:00 AM. Puede haber interrupciones temporales.',
    leido: true,
    fechaCreacion: '2025-01-08T14:20:00',
    prioridad: 'baja'
  },
  {
    id: '5',
    tipo: 'reserva',
    titulo: 'Reserva próxima a vencer',
    contenido: 'La reserva de Banco Nacional para la Pantalla LED Centro vence en 7 días.',
    leido: false,
    fechaCreacion: '2025-01-08T11:00:00',
    prioridad: 'normal'
  },
  {
    id: '6',
    tipo: 'factura',
    titulo: 'Pago recibido',
    contenido: 'Se ha recibido el pago de la factura FAC-2025-002 de Banco Nacional por Bs. 13,560.',
    leido: true,
    fechaCreacion: '2025-01-07T15:30:00',
    prioridad: 'normal'
  },
  {
    id: '7',
    tipo: 'mantenimiento',
    titulo: 'Mantenimiento completado',
    contenido: 'El mantenimiento rutinario del MUPI Avenida Arce - M012 ha sido completado exitosamente.',
    leido: true,
    fechaCreacion: '2025-01-06T13:45:00',
    prioridad: 'normal'
  },
  {
    id: '8',
    tipo: 'sistema',
    titulo: 'Nuevo cliente registrado',
    contenido: 'Un nuevo cliente "Telecom Bolivia" se ha registrado en el sistema.',
    leido: false,
    fechaCreacion: '2025-01-05T10:15:00',
    prioridad: 'baja'
  }
];

const tipoIcons = {
  reserva: Calendar,
  factura: FileText,
  mantenimiento: Wrench,
  sistema: Info
};

const tipoColors = {
  reserva: 'bg-blue-100 text-blue-800',
  factura: 'bg-green-100 text-green-800',
  mantenimiento: 'bg-orange-100 text-orange-800',
  sistema: 'bg-gray-100 text-gray-800'
};

const prioridadColors = {
  baja: 'border-l-gray-400',
  normal: 'border-l-blue-400',
  alta: 'border-l-orange-400',
  urgente: 'border-l-red-400'
};

export default function MensajeriaPage() {
  const totalMensajes = mensajes.length;
  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length;
  const mensajesHoy = mensajes.filter(m => {
    const hoy = new Date().toDateString();
    const fechaMensaje = new Date(m.fechaCreacion).toDateString();
    return hoy === fechaMensaje;
  }).length;
  const mensajesAlta = mensajes.filter(m => m.prioridad === 'alta' || m.prioridad === 'urgente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Mensajería</h1>
          <p className="mt-2 text-gray-600">
            Todas tus notificaciones y mensajes del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todo como leído
          </Button>
          <Button variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar leídos
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMensajes}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Leídos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mensajesNoLeidos}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mensajesHoy}</div>
            <p className="text-xs text-muted-foreground">
              Mensajes de hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridad</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mensajesAlta}</div>
            <p className="text-xs text-muted-foreground">
              Urgentes
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
                placeholder="Buscar mensajes..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los tipos</option>
              <option value="alquiler">Alquileres</option>
              <option value="factura">Facturas</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="sistema">Sistema</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todos los estados</option>
              <option value="no_leido">No leídos</option>
              <option value="leido">Leídos</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Mensajes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mensajes.map((mensaje) => {
              const IconComponent = tipoIcons[mensaje.tipo as keyof typeof tipoIcons];
              const fechaFormateada = new Date(mensaje.fechaCreacion).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <div
                  key={mensaje.id}
                  className={`p-4 border-l-4 rounded-lg transition-all hover:shadow-md ${
                    prioridadColors[mensaje.prioridad as keyof typeof prioridadColors]
                  } ${
                    mensaje.leido ? 'bg-gray-50' : 'bg-white border border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${tipoColors[mensaje.tipo as keyof typeof tipoColors]}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-sm font-medium ${mensaje.leido ? 'text-gray-700' : 'text-gray-900'}`}>
                            {mensaje.titulo}
                          </h3>
                          {!mensaje.leido && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Badge 
                            variant="secondary"
                            className={tipoColors[mensaje.tipo as keyof typeof tipoColors]}
                          >
                            {mensaje.tipo.charAt(0).toUpperCase() + mensaje.tipo.slice(1)}
                          </Badge>
                          {mensaje.prioridad === 'alta' && (
                            <Badge variant="destructive" className="text-xs">
                              Alta
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm ${mensaje.leido ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                          {mensaje.contenido}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {fechaFormateada}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" title="Ver detalles">
                        <Eye className="w-3 h-3" />
                      </Button>
                      {!mensaje.leido && (
                        <Button variant="outline" size="sm" title="Marcar como leído" className="text-blue-600">
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" title="Eliminar" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                mensajes.reduce((acc, mensaje) => {
                  acc[mensaje.tipo] = (acc[mensaje.tipo] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([tipo, cantidad]) => {
                const IconComponent = tipoIcons[tipo as keyof typeof tipoIcons];
                return (
                  <div key={tipo} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium capitalize">{tipo}</span>
                    </div>
                    <Badge variant="secondary">{cantidad}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Notificar nuevos alquileres</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Alertas de facturas vencidas</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Tickets de mantenimiento</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Actualizaciones del sistema</span>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              
              <div className="pt-4 border-t">
                <Button className="w-full">
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
