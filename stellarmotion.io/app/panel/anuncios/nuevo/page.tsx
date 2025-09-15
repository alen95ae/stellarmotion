'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Plus } from 'lucide-react'

export default function NuevaCampanaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    description: '',
    budget: '',
    currency: 'EUR',
    startDate: '',
    endDate: '',
    targetAudience: '',
    keywords: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirigir a la lista de campañas
    router.push('/panel/anuncios')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Campaña</h1>
          <p className="text-gray-600">Crea una nueva campaña publicitaria</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título de la Campaña *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Campaña Verano 2024"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="objective">Objetivo de la Campaña *</Label>
                  <Select value={formData.objective} onValueChange={(value) => handleInputChange('objective', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness (Conocimiento de marca)</SelectItem>
                      <SelectItem value="traffic">Tráfico (Visitas al sitio web)</SelectItem>
                      <SelectItem value="leads">Leads (Captación de clientes potenciales)</SelectItem>
                      <SelectItem value="conversion">Conversión (Ventas directas)</SelectItem>
                      <SelectItem value="engagement">Engagement (Interacción con la marca)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe los objetivos específicos y el mensaje de tu campaña..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Presupuesto y Fechas */}
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto y Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Presupuesto Total *</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="USD">USD (Dólar)</SelectItem>
                        <SelectItem value="GBP">GBP (Libra)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de Fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audiencia Objetivo */}
            <Card>
              <CardHeader>
                <CardTitle>Audiencia Objetivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="targetAudience">Audiencia Objetivo</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Ej: Adultos 25-45 años, interesados en tecnología"
                  />
                </div>
                
                <div>
                  <Label htmlFor="keywords">Palabras Clave</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    placeholder="Ej: tecnología, innovación, verano, ofertas"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Título:</span>
                  <span className="font-medium">{formData.title || 'Sin título'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium">{formData.objective || 'No seleccionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Presupuesto:</span>
                  <span className="font-medium">
                    {formData.budget ? `${formData.budget} ${formData.currency}` : 'No definido'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">
                    {formData.startDate && formData.endDate ? 
                      `${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} días` : 
                      'No definida'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Pasos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <span>Seleccionar soportes publicitarios</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <span>Subir creatividades (imágenes, videos)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <span>Revisar y aprobar la campaña</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <span>Activar la campaña</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-[#D54644] hover:bg-[#B03A38] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Creando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Campaña
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
