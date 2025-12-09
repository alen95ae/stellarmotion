'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2, FileText, MapPin, CheckCircle2, User } from 'lucide-react';

type TipoOwner = 'persona' | 'empresa' | 'gobierno' | 'agencia';

export default function InfoOwnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step1Data, setStep1Data] = useState<any>(null);
  
  const [tipoOwner, setTipoOwner] = useState<TipoOwner>('persona');
  const [formData, setFormData] = useState({
    // Persona
    direccion: '',
    ciudad: '',
    // Empresa/Compania/Agencia/Gobierno
    razon_social: '',
    ein: '',
    direccion_fiscal: '',
    // Validación UI (no se envía al backend)
    tiene_permisos: false
  });

  useEffect(() => {
    // Cargar datos del paso 1 desde localStorage
    const stored = localStorage.getItem('ownerRegistration');
    if (!stored) {
      router.push('/owners/registrarse');
      return;
    }

    try {
      const data = JSON.parse(stored);
      if (data.step !== 1) {
        router.push('/owners/registrarse');
        return;
      }
      setStep1Data(data);
    } catch (error) {
      console.error('Error loading step 1 data:', error);
      router.push('/owners/registrarse');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    // Validaciones según tipo_contacto (según esquema de tabla owners)
    if (tipoOwner === 'persona') {
      // Para persona: nombre_contacto, email, telefono, pais son obligatorios
      // direccion y ciudad son opcionales pero recomendados
      if (!formData.direccion?.trim() || !formData.ciudad?.trim()) {
        setError('Por favor, completa la dirección y ciudad');
        return false;
      }
    } else if (tipoOwner === 'empresa' || tipoOwner === 'agencia' || tipoOwner === 'gobierno') {
      // Para compania/agencia/gobierno: empresa, nit, email, telefono, pais son obligatorios
      if (!formData.razon_social?.trim() || !formData.ein?.trim() || 
          !formData.direccion_fiscal?.trim()) {
        setError('Por favor, completa razón social, EIN/NIT y dirección fiscal');
        return false;
      }
    }

    // Validación de permisos (solo UI, no se envía al backend)
    if (!formData.tiene_permisos) {
      setError('Debes confirmar que tienes los permisos necesarios');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Obtener nombre completo del localStorage
      const nombreCompleto = localStorage.getItem('owner_nombre_completo') || step1Data.nombre || '';

      // Mapear tipo_owner a tipo_contacto según la tabla owners
      // persona -> persona, empresa -> compania, gobierno -> gobierno, agencia -> agencia
      const tipo_contacto = tipoOwner === 'empresa' ? 'compania' : tipoOwner;

      // Preparar datos para enviar - SOLO campos válidos de la tabla owners
      const registrationData: any = {
        nombre_contacto: nombreCompleto,
        email: step1Data.email,
        telefono: step1Data.telefono,
        pais: step1Data.pais,
        password: step1Data.contraseña,
        tipo_contacto: tipo_contacto
      };

      // Campos específicos según tipo de owner
      if (tipo_contacto === 'persona') {
        registrationData.direccion = formData.direccion?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
      } else if (tipo_contacto === 'compania' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
        // Mapear razon_social -> empresa, ein -> nit
        registrationData.empresa = formData.razon_social?.trim() || null;
        registrationData.nit = formData.ein?.trim() || null;
        registrationData.direccion = formData.direccion_fiscal?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
        registrationData.sitio_web = null; // Campo disponible pero no se captura en el formulario
      }

      // Enviar al API
      const response = await fetch('/api/owners/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el owner');
      }

      // Limpiar localStorage
      localStorage.removeItem('ownerRegistration');

      // Redirigir al dashboard
      router.push('/owners/dashboard?registered=true');
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  if (!step1Data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Información del Owner</h1>
          <p className="mt-2 text-gray-600">Paso 2 de 2: Completa tu perfil</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos del Owner</CardTitle>
            <CardDescription>
              Proporciona información adicional sobre tu tipo de owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Tipo de Owner */}
              <div className="space-y-2">
                <Label htmlFor="tipo_owner">Tipo de Owner *</Label>
                <Select value={tipoOwner} onValueChange={(value) => setTipoOwner(value as TipoOwner)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persona">Persona</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="gobierno">Gobierno</SelectItem>
                    <SelectItem value="agencia">Agencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos para Persona */}
              {tipoOwner === 'persona' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="direccion"
                        name="direccion"
                        type="text"
                        required
                        value={formData.direccion}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Calle, número"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <Input
                        id="ciudad"
                        name="ciudad"
                        type="text"
                        required
                        value={formData.ciudad}
                        onChange={handleChange}
                        placeholder="Madrid"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ciudad_pais">País</Label>
                      <Input
                        id="ciudad_pais"
                        name="ciudad_pais"
                        type="text"
                        disabled
                        value={step1Data.pais || ''}
                        placeholder="España"
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">País del paso 1</p>
                    </div>
                  </div>
                </>
              )}

              {/* Campos para Empresa */}
              {tipoOwner === 'empresa' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="razon_social"
                        name="razon_social"
                        type="text"
                        required
                        value={formData.razon_social}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ein">EIN / NIT *</Label>
                    <Input
                      id="ein"
                      name="ein"
                      type="text"
                      required
                      value={formData.ein}
                      onChange={handleChange}
                      placeholder="A12345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion_fiscal">Dirección Fiscal *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="direccion_fiscal"
                        name="direccion_fiscal"
                        type="text"
                        required
                        value={formData.direccion_fiscal}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>

                </>
              )}

              {/* Campos comunes - Solo validación de permisos (no se envía al backend) */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="tiene_permisos"
                    checked={formData.tiene_permisos}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, tiene_permisos: checked === true }))
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="tiene_permisos" className="cursor-pointer">
                      Tengo los permisos necesarios para publicar soportes publicitarios *
                    </Label>
                    <p className="text-sm text-gray-500">
                      Debes tener autorización legal para gestionar estos espacios
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#e94446] hover:bg-[#d63a3a]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completar Registro
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

