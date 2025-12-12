'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2, MapPin, CheckCircle2, User, Briefcase, Globe, Key } from 'lucide-react';

type TipoOwner = 'persona' | 'empresa' | 'gobierno' | 'agencia';

export default function OwnerPaso2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  const [tipoOwner, setTipoOwner] = useState<TipoOwner>('persona');
  const [formData, setFormData] = useState({
    razon_social: '',
    tipo_empresa: '',
    representante_legal: '',
    tax_id: '',
    puesto: '',
    sitio_web: '',
    direccion: '',
    direccion_fiscal: '',
    ciudad: '',
    tiene_permisos: false,
    permite_instalacion: false
  });

  // Verificar sesión al cargar
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          if (isMounted) {
            window.location.href = `/login?next=${encodeURIComponent('/owner/paso-2')}`;
          }
          return;
        }

        const data = await response.json();
        
        if (!isMounted) return;

        if (!data.success || !data.user) {
          if (isMounted) {
            window.location.href = `/login?next=${encodeURIComponent('/owner/paso-2')}`;
          }
          return;
        }

        if (isMounted) {
          setSessionValid(true);
        }
      } catch (err) {
        if (isMounted) {
          setSessionValid(false);
          setError('Error al verificar sesión. Por favor, recarga la página.');
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

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

    try {
      if (!validateForm()) {
        return;
      }

      // Mapear tipo_owner a tipo_contacto
      const tipo_contacto = tipoOwner === 'empresa' ? 'empresa' : tipoOwner;

      // Preparar payload
      const registrationData: any = {
        tipo_contacto: tipo_contacto,
      };

      // Mapeo de campos según tipo
      if (tipo_contacto === 'persona') {
        registrationData.direccion = formData.direccion?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
      } else if (['empresa', 'agencia', 'gobierno'].includes(tipo_contacto)) {
        registrationData.empresa = formData.razon_social?.trim();
        registrationData.direccion = formData.direccion_fiscal?.trim() || null;
        registrationData.ciudad = formData.ciudad?.trim() || null;
        registrationData.direccion_fiscal = formData.direccion_fiscal?.trim() || null;
        registrationData.sitio_web = formData.sitio_web?.trim() || null;
        registrationData.tipo_empresa = formData.tipo_empresa?.trim() || null;
        registrationData.representante_legal = formData.representante_legal?.trim() || null;
        registrationData.tax_id = formData.tax_id?.trim() || null;
        registrationData.puesto = formData.puesto?.trim() || null;
      }

      // Campos booleanos
      registrationData.tiene_permisos = formData.tiene_permisos;
      registrationData.permite_instalacion = formData.permite_instalacion;

      // Enviar a /api/owner/complete
      const response = await fetch('/api/owner/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.error || result.message || 'Error al completar el registro de owner';
        
        if (response.status === 401) {
          errorMessage = 'Sesión inválida. Por favor, inicia sesión nuevamente.';
        } else if (response.status === 404) {
          errorMessage = 'Usuario no encontrado. Por favor, regístrate primero.';
        }
        
        throw new Error(errorMessage);
      }

      // Redirigir al dashboard
      window.location.href = '/panel/inicio';

    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica sesión
  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    );
  }

  // Si sesión inválida, mostrar error
  if (sessionValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error || 'Sesión inválida. Redirigiendo...'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Información del Owner</h1>
          <p className="text-lg text-gray-600 mb-4">Completa tu perfil</p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
            <div className="w-3 h-3 rounded-full bg-[#e94446]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="max-w-3xl mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Razón Social */}
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

            {/* Tipo de Owner */}
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

            {/* Tipo de Empresa */}
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

            {/* Representante Legal */}
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

            {/* Tax ID */}
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

            {/* Puesto */}
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

            {/* Sitio Web */}
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

            {/* Campos de Dirección según tipo */}
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
              </>
            )}

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
              </>
            )}

            {/* Checkboxes */}
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
