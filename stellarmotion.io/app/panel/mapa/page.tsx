import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Map as MapIcon, 
  MapPin, 
  Search, 
  Filter,
  Eye,
  Navigation,
  Layers,
  Monitor,
  Zap,
  Users,
  Calendar
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mapa - Panel de Control | StellarMotion',
  description: 'Mapa interactivo de espacios publicitarios'
};

// Mock data para los soportes en el mapa
const soportes = [
  {
    id: '1',
    nombre: 'Valla Zona Sur - A001',
    tipo: 'Valla',
    lat: -16.5400,
    lng: -68.1193,
    estado: 'ocupado',
    cliente: 'Coca Cola Bolivia',
    fechaVence: '2025-02-10',
    ingresos: 8500,
    dimensiones: '10×4 m',
    iluminacion: true
  },
  {
    id: '2',
    nombre: 'Pantalla LED Centro - P005',
    tipo: 'Pantalla LED',
    lat: -16.4897,
    lng: -68.1193,
    estado: 'ocupado',
    cliente: 'Banco Nacional',
    fechaVence: '2025-03-15',
    ingresos: 12000,
    dimensiones: '8×6 m',
    iluminacion: true
  },
  {
    id: '3',
    nombre: 'MUPI Avenida Arce - M012',
    tipo: 'MUPI',
    lat: -16.5000,
    lng: -68.1300,
    estado: 'ocupado',
    cliente: 'Supermercados Ketal',
    fechaVence: '2025-04-08',
    ingresos: 4500,
    dimensiones: '1.2×1.8 m',
    iluminacion: true
  },
  {
    id: '4',
    nombre: 'Valla Carretera Norte - V008',
    tipo: 'Valla',
    lat: -16.4500,
    lng: -68.1000,
    estado: 'disponible',
    cliente: null,
    fechaVence: null,
    ingresos: 0,
    dimensiones: '15×5 m',
    iluminacion: true
  },
  {
    id: '5',
    nombre: 'Totem Centro Comercial - T003',
    tipo: 'Totem',
    lat: -16.5200,
    lng: -68.1100,
    estado: 'mantenimiento',
    cliente: null,
    fechaVence: null,
    ingresos: 0,
    dimensiones: '2×4 m',
    iluminacion: false
  },
  {
    id: '6',
    nombre: 'Pantalla LED Mall - P006',
    tipo: 'Pantalla LED',
    lat: -16.5100,
    lng: -68.1400,
    estado: 'reservado',
    cliente: 'Cervecería Nacional',
    fechaVence: '2025-01-25',
    ingresos: 7500,
    dimensiones: '6×4 m',
    iluminacion: true
  }
];

const estadoColors = {
  disponible: 'bg-green-500',
  ocupado: 'bg-blue-500',
  reservado: 'bg-yellow-500',
  mantenimiento: 'bg-red-500'
};

const tipoIcons = {
  'Valla': Monitor,
  'Pantalla LED': Monitor,
  'MUPI': Monitor,
  'Totem': Monitor
};

export default function MapaPage() {
  const soportesDisponibles = soportes.filter(s => s.estado === 'disponible').length;
  const soportesOcupados = soportes.filter(s => s.estado === 'ocupado').length;
  const soportesReservados = soportes.filter(s => s.estado === 'reservado').length;
  const soportesMantenimiento = soportes.filter(s => s.estado === 'mantenimiento').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Soportes</h1>
          <p className="mt-2 text-gray-600">
            Visualización interactiva de todos tus espacios publicitarios
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Layers className="w-4 h-4 mr-2" />
            Capas
          </Button>
          <Button variant="outline">
            <Navigation className="w-4 h-4 mr-2" />
            Mi ubicación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soportesDisponibles}</div>
            <p className="text-xs text-muted-foreground">
              Listos para alquilar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soportesOcupados}</div>
            <p className="text-xs text-muted-foreground">
              Con campañas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservados</CardTitle>
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soportesReservados}</div>
            <p className="text-xs text-muted-foreground">
              Próximos a activarse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soportesMantenimiento}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map and Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map Container */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapIcon className="w-5 h-5 mr-2" />
              Mapa Interactivo
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Buscar ubicación
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar por estado
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Placeholder para el mapa */}
            <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
              {/* Simulación de mapa con marcadores */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md text-xs">
                  <div className="font-medium">La Paz, Bolivia</div>
                  <div className="text-gray-500">Vista satelital</div>
                </div>
                
                {/* Marcadores simulados */}
                {soportes.map((soporte, index) => (
                  <div
                    key={soporte.id}
                    className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${estadoColors[soporte.estado as keyof typeof estadoColors]}`}
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 3) * 20}%`
                    }}
                    title={soporte.nombre}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
                
                {/* Controles del mapa */}
                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                  <Button size="sm" variant="outline" className="w-8 h-8 p-0">+</Button>
                  <Button size="sm" variant="outline" className="w-8 h-8 p-0">-</Button>
                </div>
                
                {/* Leyenda */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                  <div className="text-xs font-medium mb-2">Leyenda</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span>Ocupado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                      <span>Reservado</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                      <span>Mantenimiento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar con lista de soportes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Soportes</CardTitle>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {soportes.map((soporte) => {
                const IconComponent = tipoIcons[soporte.tipo as keyof typeof tipoIcons];
                return (
                  <div
                    key={soporte.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">{soporte.nombre}</div>
                      </div>
                      <Badge 
                        className={`text-xs ${estadoColors[soporte.estado as keyof typeof estadoColors]} text-white`}
                      >
                        {soporte.estado}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <Monitor className="w-3 h-3 mr-1" />
                        {soporte.dimensiones} - {soporte.tipo}
                      </div>
                      
                      {soporte.iluminacion && (
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          Con iluminación
                        </div>
                      )}
                      
                      {soporte.cliente && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {soporte.cliente}
                        </div>
                      )}
                      
                      {soporte.fechaVence && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Vence: {new Date(soporte.fechaVence).toLocaleDateString('es-ES')}
                        </div>
                      )}
                      
                      {soporte.ingresos > 0 && (
                        <div className="text-green-600 font-medium">
                          Bs. {soporte.ingresos.toLocaleString()}/mes
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        Ubicar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución Geográfica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Zona Sur</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">3 soportes</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Centro</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <span className="text-sm font-medium">2 soportes</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Norte</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-sm font-medium">1 soporte</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                Agregar nuevo soporte al mapa
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="w-4 h-4 mr-2" />
                Calcular rutas de mantenimiento
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Ver soportes por zona
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar por disponibilidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
