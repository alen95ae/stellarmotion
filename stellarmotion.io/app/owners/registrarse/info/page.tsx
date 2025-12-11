'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Removed Supabase Auth - using JWT-based auth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2, FileText, MapPin, CheckCircle2, User, Briefcase, Globe, Key, Home, CheckSquare, Phone } from 'lucide-react';

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
    // Empresa/Agencia/Gobierno
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
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          console.log('⚠️ [OWNER_STEP2] No hay sesión, redirigiendo a login...');
          window.location.href = `/login?next=${encodeURIComponent('/owners/registrarse/info')}`;
          return;
        }

        const data = await response.json();
        
        if (!isMounted) return;

        if (!data.success || !data.user) {
          console.log('⚠️ [OWNER_STEP2] Usuario no encontrado, redirigiendo a login...');
          window.location.href = `/login?next=${encodeURIComponent('/owners/registrarse/info')}`;
          return;
        }

        console.log('✅ [OWNER_STEP2] Sesión encontrada:', data.user.email);

        // Intentar obtener datos del owner existente si ya existe
        let ownerProfile = null;
        try {
          const ownerResponse = await fetch('/api/me/owner-profile');
          if (ownerResponse.ok) {
            ownerProfile = await ownerResponse.json();
            console.log('✅ [OWNER_STEP2] Datos del owner existente:', ownerProfile);
          }
        } catch (err) {
          console.log('ℹ️ [OWNER_STEP2] No hay owner existente o error al obtenerlo:', err);
        }

        // Construir datos mínimos para poblar el formulario
        // Prioridad: owner existente > usuario de BD > localStorage (fallback)
        console.log('🔍 [OWNER_STEP2] Cargando datos del paso 1 desde BD:', {
          user_from_bd: {
            nombre: data.user.nombre,
            apellidos: data.user.apellidos,
            telefono: data.user.telefono,
            pais: data.user.pais,
            ciudad: data.user.ciudad,
            tipo_owner: data.user.tipo_owner,
            nombre_empresa: data.user.nombre_empresa,
            tipo_empresa: data.user.tipo_empresa
          },
          ownerProfile: ownerProfile ? {
            nombre_contacto: ownerProfile.nombre_contacto,
            telefono: ownerProfile.telefono,
            pais: ownerProfile.pais
          } : null
        });
        
        const step1DataLoaded = {
          nombre: ownerProfile?.nombre_contacto || 
                  data.user.nombre || 
                  data.user.name || 
                  localStorage.getItem('owner_nombre_completo') ||
                  '',
          apellidos: data.user.apellidos || '',
          email: data.user.email || '',
          telefono: ownerProfile?.telefono || 
                   data.user.telefono || 
                   localStorage.getItem('owner_telefono') || 
                   '',
          pais: ownerProfile?.pais || 
                data.user.pais || 
                localStorage.getItem('owner_pais') || 
                '',
          ciudad: data.user.ciudad || '',
          tipo_owner: data.user.tipo_owner || '',
          nombre_empresa: data.user.nombre_empresa || '',
          tipo_empresa: data.user.tipo_empresa || '',
          step: 1
        };

        setStep1Data(step1DataLoaded);

        // Inicializar campos del formulario con datos disponibles del owner existente
        if (isMounted && ownerProfile) {
          setFormData(prev => ({
            ...prev,
            razon_social: ownerProfile.empresa || prev.razon_social,
            tipo_empresa: ownerProfile.tipo_empresa || prev.tipo_empresa,
          }));
        }

        setInitialLoading(false);
      } catch (err) {
        console.error('🔥 [OWNER_STEP2] Error crítico cargando usuario:', err);

        if (isMounted) {
          setStep1Data({
            nombre: '',
            email: '',
            telefono: '',
            pais: '',
            step: 1
          });
          setInitialLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []); // Dependencias vacías para ejecutar solo al montar

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
    // Validaciones según tipo_contacto
    if (tipoOwner === 'persona') {
      if (!formData.direccion?.trim() || !formData.ciudad?.trim()) {
        setError('Por favor, completa la dirección y ciudad');
        return false;
      }
    } else if (['empresa', 'agencia', 'gobierno'].includes(tipoOwner)) {
      if (!formData.razon_social?.trim()) {
        setError('La Razón Social / Empresa es obligatoria.');
        return false;
      }
      if (!formData.direccion_fiscal?.trim() || !formData.ciudad?.trim()) {
        setError('Por favor, completa la dirección fiscal y ciudad');
        return false;
      }
    }

    // Validación de campos comunes requeridos
    if (['empresa', 'agencia', 'gobierno'].includes(tipoOwner)) {
      if (!formData.tipo_empresa?.trim() || !formData.representante_legal?.trim() ||
        !formData.tax_id?.trim() || !formData.puesto?.trim()) {
        setError('Por favor, completa todos los campos de la empresa');
        return false;
      }
    }

    if (!formData.tiene_permisos) {
      setError('Debes confirmar que tienes los permisos necesarios');
      return false;
    }

    if (!formData.permite_instalacion) {
      setError('Debes confirmar que permites la instalación de publicidad');
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
        // setLoading(false) se maneja en finally
        return;
      }

      console.log('🚀 [OWNER_STEP2] Iniciando envío de formulario...');

      // Obtener usuario autenticado (requerido para paso 2)
      const userResponse = await fetch('/api/auth/me');
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({ error: 'No autorizado' }));
        console.error('❌ [OWNER_STEP2] Error de sesión al enviar:', errorData);
        setError('Debes estar autenticado para completar el registro. Redirigiendo...');
        setTimeout(() => {
          window.location.href = `/login?next=${encodeURIComponent('/owners/registrarse/info')}`;
        }, 2000);
        return;
      }

      const userData = await userResponse.json();
      
      if (!userData.success || !userData.user) {
        throw new Error("No se pudo obtener la información del usuario.");
      }

      const user = userData.user;

      // Validar user_id - el JWT devuelve tanto id como sub (ambos deberían ser iguales)
      const userId = user.id || user.sub;

      if (!userId) {
        console.error('❌ [OWNER_STEP2] No se pudo obtener user_id. User data:', user);
        throw new Error("No se pudo identificar el ID del usuario. Por favor, inicia sesión nuevamente.");
      }

      // Validar que userId existe y tiene formato válido (UUID o string)
      if (typeof userId !== 'string' || userId.trim().length === 0) {
        console.error('❌ [OWNER_STEP2] user_id inválido:', userId, 'Type:', typeof userId);
        throw new Error('ID de usuario inválido. Por favor, inicia sesión nuevamente.');
      }

      console.log('🔍 [OWNER_STEP2] Usuario autenticado:', {
        userId,
        email: user.email,
        name: user.name || user.nombre,
        id: user.id,
        sub: user.sub,
        role: user.role || user.rol
      });

      // Intentar obtener datos del owner existente si ya existe
      let ownerProfile = null;
      try {
        const ownerResponse = await fetch('/api/me/owner-profile');
        if (ownerResponse.ok) {
          ownerProfile = await ownerResponse.json();
          console.log('✅ [OWNER_STEP2] Datos del owner existente al enviar:', ownerProfile);
        }
      } catch (err) {
        console.log('ℹ️ [OWNER_STEP2] No hay owner existente o error al obtenerlo:', err);
      }

      // Obtener datos del usuario autenticado
      // Prioridad: owner existente > localStorage > step1Data > usuario autenticado
      const nombreCompleto = ownerProfile?.nombre_contacto ||
        localStorage.getItem('owner_nombre_completo') ||
        user.name || user.nombre ||
        step1Data?.nombre ||
        user.email?.split('@')[0] || '';

      const email = user.email || step1Data?.email || '';
      
      // Obtener datos del usuario de la BD (prioridad: ownerProfile > user de BD > step1Data > localStorage)
      const telefono = ownerProfile?.telefono || 
                      user.telefono || 
                      step1Data?.telefono || 
                      localStorage.getItem('owner_telefono') || 
                      '';
      
      const pais = ownerProfile?.pais || 
                  user.pais || 
                  step1Data?.pais || 
                  localStorage.getItem('owner_pais') || 
                  '';
      
      console.log('🔍 [OWNER_STEP2] Obteniendo datos para envío desde BD:', {
        ownerProfile: {
          telefono: ownerProfile?.telefono,
          pais: ownerProfile?.pais
        },
        user_from_bd: {
          telefono: user.telefono,
          pais: user.pais
        },
        step1Data: {
          telefono: step1Data?.telefono,
          pais: step1Data?.pais
        },
        final: {
          telefono,
          pais
        }
      });

      // Validar que tenemos los campos base mínimos
      if (!nombreCompleto || !email) {
        throw new Error('Faltan datos base del usuario (nombre o email). Recarga la página.');
      }

      // Si faltan telefono o pais, usar valores por defecto razonables
      const telefonoFinal = telefono || '000000000'; // Valor temporal si no está disponible
      // NO usar 'España' como valor por defecto - si no hay país, debe ser un error
      const paisFinal = pais || '';
      
      if (!paisFinal) {
        console.error('❌ [OWNER_STEP2] País no encontrado. Fuentes:', {
          ownerProfile_pais: ownerProfile?.pais,
          user_bd_pais: user.pais,
          step1Data_pais: step1Data?.pais,
          localStorage_pais: localStorage.getItem('owner_pais')
        });
        throw new Error('No se encontró el país del paso 1 en la base de datos. Por favor, regresa al paso 1 y completa el registro nuevamente.');
      }

      console.log('📋 [OWNER_STEP2] Datos finales preparados:', {
        userId,
        userIdType: typeof userId,
        userIdLength: userId?.length,
        nombreCompleto,
        email,
        telefono: telefonoFinal,
        pais: paisFinal
      });

      // Mapear tipo_owner a tipo_contacto
      const tipo_contacto = tipoOwner === 'empresa' ? 'empresa' : tipoOwner;

      // Preparar datos para enviar
      const registrationData: any = {
        user_id: userId, // CRÍTICO - debe existir en tabla usuarios
        nombre_contacto: nombreCompleto,
        email: email,
        telefono: telefonoFinal,
        pais: paisFinal,
        tipo_contacto: tipo_contacto
      };

      console.log('📤 [OWNER_STEP2] Payload a enviar:', {
        user_id: registrationData.user_id,
        email: registrationData.email,
        tipo_contacto: registrationData.tipo_contacto,
        has_telefono: !!registrationData.telefono,
        has_pais: !!registrationData.pais
      });

      // Mapeo de campos
      if (tipo_contacto === 'persona') {
        registrationData.direccion = formData.direccion?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
      } else if (['empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
        // VALIDACIÓN DEFENSIVA: Asegurar que empresa tenga valor
        const empresaVal = formData.razon_social?.trim();
        if (!empresaVal) {
          throw new Error("El campo Empresa/Razón Social es obligatorio.");
        }
        registrationData.empresa = empresaVal;

        registrationData.direccion = formData.direccion_fiscal?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
        registrationData.direccion_fiscal = formData.direccion_fiscal?.trim() || null;
        registrationData.sitio_web = formData.sitio_web?.trim() || null;

        registrationData.tipo_empresa = formData.tipo_empresa?.trim() || null;
        registrationData.representante_legal = formData.representante_legal?.trim() || null;
        registrationData.tax_id = formData.tax_id?.trim() || null;
        registrationData.puesto = formData.puesto?.trim() || null;
      }

      // Campos booleanos comunes
      registrationData.tiene_permisos = formData.tiene_permisos;
      registrationData.permite_instalacion = formData.permite_instalacion;

      console.log('📡 [OWNER_STEP2] Enviando payload a API:', {
        user_id: registrationData.user_id,
        tipo_contacto,
        empresa: registrationData.empresa
      });

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
        console.error('❌ [OWNER_STEP2] Error API - Status:', response.status);
        console.error('❌ [OWNER_STEP2] Error API - Result:', JSON.stringify(result, null, 2));
        console.error('❌ [OWNER_STEP2] User ID enviado:', userId);
        
        // Mensaje de error más descriptivo
        let errorMessage = result.error || result.message || 'Error al completar el registro de owner';
        
        // Mensajes específicos para errores comunes
        if (result.error?.includes('foreign key constraint') || JSON.stringify(result.details || '').includes('foreign key')) {
          errorMessage = 'El usuario no existe en el sistema. Por favor, inicia sesión nuevamente o regístrate.';
        } else if (result.error?.includes('user_id')) {
          errorMessage = 'Error con el ID de usuario. Por favor, inicia sesión nuevamente.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ [OWNER_STEP2] Registro completado exitosamente');

      // Limpiar localStorage
      localStorage.removeItem('ownerRegistration');
      localStorage.removeItem('owner_nombre_completo');

      // Esperar brevemente
      await new Promise(resolve => setTimeout(resolve, 500));

      // Forzar redirección al dashboard (con hard reload para asegurar roles actualizados)
      window.location.href = '/panel/inicio?registered=true';

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.error('[OWNER_STEP2] Request timeout');
        setError('El servidor tardó demasiado en responder. Intenta de nuevo.');
      } else {
        console.error('🔥 [OWNER_STEP2] Error en proceso:', err);
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false); // SIEMPRE liberar el estado de carga
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
                    value={step1Data?.pais || ''}
                    placeholder={step1Data?.pais ? '' : 'No especificado'}
                    className={`py-3 rounded-2xl border-gray-300 bg-gray-100 ${!step1Data?.pais ? 'border-red-300 bg-red-50' : ''}`}
                  />
                  <p className="text-xs text-gray-500">
                    {step1Data?.pais 
                      ? `País del paso 1: ${step1Data.pais}` 
                      : '⚠️ País no encontrado del paso 1. Por favor, regresa al paso 1.'}
                  </p>
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
                    value={step1Data?.pais || ''}
                    placeholder={step1Data?.pais ? '' : 'No especificado'}
                    className={`py-3 rounded-2xl border-gray-300 bg-gray-100 ${!step1Data?.pais ? 'border-red-300 bg-red-50' : ''}`}
                  />
                  <p className="text-xs text-gray-500">
                    {step1Data?.pais 
                      ? `País del paso 1: ${step1Data.pais}` 
                      : '⚠️ País no encontrado del paso 1. Por favor, regresa al paso 1.'}
                  </p>
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

