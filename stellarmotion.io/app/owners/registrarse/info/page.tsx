'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2, FileText, MapPin, CheckCircle2, User, Briefcase, Globe, Key, Home, CheckSquare } from 'lucide-react';

type TipoOwner = 'persona' | 'empresa' | 'gobierno' | 'agencia';

export default function InfoOwnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [tipoOwner, setTipoOwner] = useState<TipoOwner>('persona');
  const [formData, setFormData] = useState({
    // Persona
    direccion: '',
    ciudad: '',
    pais: '',
    // Empresa/Compania/Agencia/Gobierno
    razon_social: '',
    tipo_empresa: '',
    representante_legal: '',
    tax_id: '',
    puesto: '',
    sitio_web: '',
    direccion_fiscal: '',
    // Validación UI
    tiene_permisos: false,
    permite_instalacion: false
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        // Usuario no autenticado
        if (error || !user) {
          console.log('⚠️ [Paso 2] Usuario no autenticado, redirigiendo a login...');
          // Establecer datos mínimos para evitar freeze durante redirección
          setStep1Data({
            nombre: '',
            email: '',
            telefono: '',
            pais: '',
            step: 1
          });
          setInitialLoading(false);
          // Usar router.replace en lugar de window.location.href
          router.replace(`/login?next=${encodeURIComponent('/owners/registrarse/info')}`);
          return;
        }

        if (!isMounted) return;

        // Construir datos mínimos para poblar el formulario
        const stepData = {
          nombre: user.user_metadata?.nombre_contacto || '',
          email: user.email || '',
          telefono: user.user_metadata?.telefono || '',
          pais: user.user_metadata?.pais || '',
          step: 1
        };

        setStep1Data(stepData);

        // Inicializar país del formulario con el país conocido del usuario
        setFormData(prev => ({
          ...prev,
          pais: stepData.pais || prev.pais,
        }));

        setInitialLoading(false);

      } catch (err) {
        console.error('[OWNER STEP 2] Error cargando usuario:', err);

        if (isMounted) {
          // Nunca dejar loading infinito - establecer datos mínimos
          setStep1Data({
            nombre: '',
            email: '',
            telefono: '',
            pais: '',
            step: 1,
          });
          setInitialLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
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
      // Para compania/agencia/gobierno: empresa, email, telefono, pais son obligatorios
      if (!formData.direccion_fiscal?.trim() || !formData.ciudad?.trim()) {
        setError('Por favor, completa la dirección fiscal y ciudad');
        return false;
      }
    }

    // Validación de campos comunes requeridos
    if (!formData.razon_social?.trim() || !formData.tipo_empresa?.trim() || 
        !formData.representante_legal?.trim() || !formData.tax_id?.trim() ||
        !formData.puesto?.trim()) {
      setError('Por favor, completa todos los campos requeridos');
      return false;
    }

    // Validación de permisos
    if (!formData.tiene_permisos) {
      setError('Debes confirmar que tienes los permisos necesarios');
      return false;
    }

    // Validación de instalación
    if (!formData.permite_instalacion) {
      setError('Debes confirmar que permites la instalación de publicidad en tu soporte');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Obtener usuario autenticado (requerido para paso 2)
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Debes estar autenticado para completar el registro. Redirigiendo...');
        router.replace(`/login?next=${encodeURIComponent('/owners/registrarse/info')}`);
        setLoading(false);
        return;
      }

      // Obtener datos del usuario autenticado
      const nombreCompleto = localStorage.getItem('owner_nombre_completo') || 
                            user.user_metadata?.nombre_contacto || 
                            step1Data.nombre || 
                            user.email?.split('@')[0] || '';
      
      const email = user.email || step1Data.email || '';
      const telefono = step1Data.telefono || user.user_metadata?.telefono || '';
      const pais = formData.pais?.trim() || step1Data.pais || user.user_metadata?.pais || '';

      // Validar que tenemos los campos requeridos
      if (!nombreCompleto || !email || !telefono || !pais) {
        setError('Faltan datos requeridos. Por favor, completa todos los campos.');
        setLoading(false);
        return;
      }

      // Mapear tipo_owner a tipo_contacto según la tabla owners
      const tipo_contacto = tipoOwner === 'empresa' ? 'compania' : tipoOwner;

      // Preparar datos para enviar al endpoint /api/owners/complete
      const registrationData: any = {
        user_id: user.id, // REQUERIDO: siempre viene de la sesión
        nombre_contacto: nombreCompleto,
        email,
        telefono,
        pais,
        tipo_contacto,
      };

      // Campos específicos según tipo de owner
      if (tipo_contacto === 'persona') {
        const direccion = formData.direccion?.trim();
        const ciudad = formData.ciudad?.trim();
        if (direccion) registrationData.direccion = direccion;
        if (ciudad) registrationData.ciudad = ciudad;
      } else if (tipo_contacto === 'compania' || tipo_contacto === 'agencia' || tipo_contacto === 'gobierno') {
        // Mapear razon_social -> empresa (REQUERIDO para compania/agencia/gobierno)
        // La validación frontend ya garantiza que razon_social tiene valor
        const razonSocial = formData.razon_social?.trim();
        const direccionFiscal = formData.direccion_fiscal?.trim();
        const ciudad = formData.ciudad?.trim();
        const sitioWeb = formData.sitio_web?.trim();
        const tipoEmpresa = formData.tipo_empresa?.trim();
        const representanteLegal = formData.representante_legal?.trim();
        const taxId = formData.tax_id?.trim();
        const puesto = formData.puesto?.trim();
        const tipoTenencia = formData.tipo_tenencia?.trim();

        // empresa es REQUERIDO según validación del ERP
        // Si llegamos aquí, la validación frontend ya garantizó que razon_social tiene valor
        if (!razonSocial) {
          throw new Error('Razón social es requerida. Por favor, completa todos los campos.');
        }
        registrationData.empresa = razonSocial;
        
        if (direccionFiscal) {
          registrationData.direccion = direccionFiscal;
          registrationData.direccion_fiscal = direccionFiscal;
        }
        if (ciudad) registrationData.ciudad = ciudad;
        if (sitioWeb) registrationData.sitio_web = sitioWeb;
        // Nuevos campos - solo enviar si tienen valor
        if (tipoEmpresa) registrationData.tipo_empresa = tipoEmpresa;
        if (representanteLegal) registrationData.representante_legal = representanteLegal;
        if (taxId) registrationData.tax_id = taxId;
        if (puesto) registrationData.puesto = puesto;
        if (tipoTenencia) registrationData.tipo_tenencia = tipoTenencia;
      }
      
      // Campos booleanos comunes
      registrationData.tiene_permisos = formData.tiene_permisos || false;
      registrationData.permite_instalacion = formData.permite_instalacion || false;

      if (process.env.NODE_ENV === 'development') {
        console.log('[OWNER_STEP2] Payload enviado:', registrationData);
      }

      // Enviar al endpoint /api/owners/complete con timeout de seguridad
      const response = await fetch('/api/owners/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
        signal: controller.signal,
      });

      const result = await response.json();

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[OWNER_STEP2] Error ERP:', result);
        }
        throw new Error(result.error || result.message || 'Error al completar el registro de owner');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[OWNER_STEP2] Respuesta ERP:', result);
      }

      // Limpiar localStorage
      localStorage.removeItem('ownerRegistration');
      localStorage.removeItem('owner_nombre_completo');

      console.log('✅ [OWNER_STEP2] Owner completado correctamente, redirigiendo al dashboard...');
      
      // Usar router.replace para navegación final (no permite volver atrás)
      router.replace('/panel/inicio?registered=true');
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        console.error('[OWNER_STEP2] Request timeout');
        setError('Request timeout, please try again');
      } else {
        console.error('Error en registro:', err);
        setError(err instanceof Error ? err.message : 'Ocurrió un error. Por favor, intenta nuevamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    );
  }

  if (!step1Data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Información del Owner</h1>
          <p className="text-lg text-gray-600 mb-4">Completa tu perfil</p>
          
          {/* Indicadores de pasos */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className={`w-3 h-3 rounded-full transition-colors ${false ? 'bg-[#e94446]' : 'bg-white border-2 border-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${true ? 'bg-[#e94446]' : 'bg-white border-2 border-gray-300'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="max-w-3xl mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Razón Social - Primero */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="razon_social" className="text-sm font-medium text-gray-700">Razón Social (Empresa) *</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="razon_social"
                  name="razon_social"
                  type="text"
                  required
                  value={formData.razon_social}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            {/* Tipo de Owner y Tipo de Empresa */}
            <div className="space-y-2">
              <Label htmlFor="tipo_owner" className="text-sm font-medium text-gray-700">Tipo de Owner *</Label>
              <Select value={tipoOwner} onValueChange={(value) => setTipoOwner(value as TipoOwner)}>
                <SelectTrigger className="w-full rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20 py-3">
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

            <div className="space-y-2">
              <Label htmlFor="tipo_empresa" className="text-sm font-medium text-gray-700">Tipo de Empresa *</Label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="tipo_empresa"
                  name="tipo_empresa"
                  type="text"
                  required
                  value={formData.tipo_empresa}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Ej: Inc, LLC, S.L., S.A., etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="representante_legal" className="text-sm font-medium text-gray-700">Representante Legal *</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="representante_legal"
                  name="representante_legal"
                  type="text"
                  required
                  value={formData.representante_legal}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id" className="text-sm font-medium text-gray-700">Tax ID *</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="tax_id"
                  name="tax_id"
                  type="text"
                  required
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Ej: EIN, CIF, NIF, CUIT, RFC, NIT…"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="puesto" className="text-sm font-medium text-gray-700">Puesto *</Label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="puesto"
                  name="puesto"
                  type="text"
                  required
                  value={formData.puesto}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Ej: CEO, Director, Gerente, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sitio_web" className="text-sm font-medium text-gray-700">Sitio Web</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="sitio_web"
                  name="sitio_web"
                  type="text"
                  value={formData.sitio_web}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="www.ejemplo.com"
                />
              </div>
            </div>

            {/* Campos de Dirección, Ciudad y País - Después de Puesto y Sitio Web */}
            {/* Campos para Persona */}
            {tipoOwner === 'persona' && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">Dirección *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                    <Input
                      id="direccion"
                      name="direccion"
                      type="text"
                      required
                      value={formData.direccion}
                      onChange={handleChange}
                      className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                      placeholder="Calle, número"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                    placeholder="Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad_pais" className="text-sm font-medium text-gray-700">País</Label>
                  <Input
                    id="ciudad_pais"
                    name="ciudad_pais"
                    type="text"
                    disabled
                    value={step1Data.pais || ''}
                    placeholder="España"
                    className="py-3 rounded-2xl border-gray-300 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">País del paso 1</p>
                </div>
              </>
            )}

            {/* Campos para Empresa, Agencia y Gobierno */}
            {(tipoOwner === 'empresa' || tipoOwner === 'agencia' || tipoOwner === 'gobierno') && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion_fiscal" className="text-sm font-medium text-gray-700">Dirección Fiscal *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                    <Input
                      id="direccion_fiscal"
                      name="direccion_fiscal"
                      type="text"
                      required
                      value={formData.direccion_fiscal}
                      onChange={handleChange}
                      className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                    placeholder="Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad_pais" className="text-sm font-medium text-gray-700">País</Label>
                  <Input
                    id="ciudad_pais"
                    name="ciudad_pais"
                    type="text"
                    disabled
                    value={step1Data.pais || ''}
                    placeholder="España"
                    className="py-3 rounded-2xl border-gray-300 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">País del paso 1</p>
                </div>
              </>
            )}

            {/* Campos comunes - Checkboxes */}
            <div className="space-y-4 pt-6 md:col-span-2 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="tiene_permisos"
                  checked={formData.tiene_permisos}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tiene_permisos: checked === true }))
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="tiene_permisos" className="cursor-pointer text-sm font-medium text-gray-700">
                    Tengo los permisos necesarios para publicar soportes publicitarios *
                  </Label>
                  <p className="text-sm text-gray-500">
                    Debes tener autorización legal para gestionar estos espacios
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="permite_instalacion"
                  checked={formData.permite_instalacion}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, permite_instalacion: checked === true }))
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="permite_instalacion" className="cursor-pointer text-sm font-medium text-gray-700">
                    Permito la instalación de publicidad en mi soporte *
                  </Label>
                  <p className="text-sm text-gray-500">
                    Autorizo la instalación de material publicitario en los soportes que publique
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-8 pb-8">
            <Button
              type="button"
              variant="outline"
              className="px-8 py-6 text-lg rounded-2xl border-gray-300 hover:bg-gray-50"
              onClick={() => router.back()}
              disabled={loading}
            >
              Atrás
            </Button>
            <Button
              type="submit"
              className="px-12 py-6 text-lg rounded-2xl bg-[#e94446] hover:bg-[#d63a3a] transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Completar Registro
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

