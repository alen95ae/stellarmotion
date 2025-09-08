import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Building, 
  FileText, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save,
  Upload,
  Key,
  Mail,
  Phone
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ajustes - Panel de Control | StellarMotion',
  description: 'Configuración del sistema y perfil de propietario'
};

export default function AjustesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">
          Personaliza tu cuenta y configura el sistema según tus necesidades
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 mr-3" />
                Perfil Personal
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                <Building className="w-4 h-4 mr-3" />
                Empresa
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 mr-3" />
                Facturación
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell className="w-4 h-4 mr-3" />
                Notificaciones
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 mr-3" />
                Seguridad
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                <Palette className="w-4 h-4 mr-3" />
                Apariencia
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Perfil Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Perfil Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                    <Upload className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Foto de Perfil</h3>
                  <p className="text-sm text-gray-500">Actualiza tu foto de perfil</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    defaultValue="Juan Carlos Mendoza"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="juan.mendoza@stellarmotion.bo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    defaultValue="+591 2 2345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    defaultValue="Gerente General"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue="PubliMax Bolivia"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    type="text"
                    defaultValue="1023456789012"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    defaultValue="Av. Arce 2612, Edificio Fortaleza Piso 8, La Paz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    defaultValue="La Paz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option value="BO">Bolivia</option>
                    <option value="PE">Perú</option>
                    <option value="AR">Argentina</option>
                    <option value="CL">Chile</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Facturación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Configuración de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option value="BOB">Bolivianos (Bs.)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="13"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de vencimiento por defecto
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numeración de facturas
                  </label>
                  <input
                    type="text"
                    defaultValue="FAC-{YYYY}-{###}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo para facturas
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-gray-400" />
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Nuevas reservas</div>
                    <div className="text-sm text-gray-500">Recibir notificaciones de nuevas reservas</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Facturas vencidas</div>
                    <div className="text-sm text-gray-500">Alertas cuando las facturas están vencidas</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Mantenimiento</div>
                    <div className="text-sm text-gray-500">Notificaciones de tickets de mantenimiento</div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">Reportes semanales</div>
                    <div className="text-sm text-gray-500">Resumen semanal por email</div>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Roles disponibles</h4>
                    <p className="text-sm text-gray-500">Gestiona los permisos de acceso</p>
                  </div>
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Invitar Usuario
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Juan Carlos Mendoza</div>
                        <div className="text-sm text-gray-500">juan.mendoza@stellarmotion.bo</div>
                      </div>
                    </div>
                    <Badge>Administrador</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">María González</div>
                        <div className="text-sm text-gray-500">maria.gonzalez@stellarmotion.bo</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Comercial</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">Carlos Mendoza</div>
                        <div className="text-sm text-gray-500">carlos.mendoza@stellarmotion.bo</div>
                      </div>
                    </div>
                    <Badge variant="outline">Operador</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
