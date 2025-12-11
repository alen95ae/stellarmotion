'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Removed Supabase Auth - using JWT-based auth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, Globe, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegistroOwnerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Detectar si es registro de owner (con pasos) o registro normal
  const isOwnerRegistration = searchParams.get('type') === 'owner';

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    pais: '',
    contraseña: '',
    confirmarContraseña: ''
  });

  // Verificar si el usuario ya está autenticado al cargar la página
  // Solo para registro de owner (con pasos)
  useEffect(() => {
    if (!isOwnerRegistration) return; // Solo verificar si es registro de owner

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            // Usuario autenticado - verificar si tiene owner
            // Si es owner, redirigir al dashboard
            if (data.user.role === 'owner') {
              router.push('/dashboard/owner');
              return;
            }
            // Si es client, redirigir al paso 2
            if (data.user.role === 'client') {
              router.push('/owners/registrarse/info');
              return;
            }
          }
        }
      } catch (err) {
        // No autenticado, continuar con el formulario
        console.log('Usuario no autenticado, continuando con registro...');
      }
    };

    checkAuth();
  }, [isOwnerRegistration, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.email.trim() ||
        !formData.telefono.trim() || !formData.pais.trim() || !formData.contraseña.trim() ||
        !formData.confirmarContraseña.trim()) {
        setError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor, ingresa un email válido');
        setLoading(false);
        return;
      }

      // Validar contraseña (mínimo 6 caracteres)
      if (formData.contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Validar que las contraseñas coincidan
      if (formData.contraseña !== formData.confirmarContraseña) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Preparar nombre completo
      const nombreCompleto = `${formData.nombre} ${formData.apellidos}`;

      // Registrar cliente en el ERP
      console.log('📡 [OWNER_STEP1] Enviando registro al ERP...');
      const response = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.contraseña,
          nombre_contacto: nombreCompleto.trim(),
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          telefono: formData.telefono.trim(),
          pais: formData.pais.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Si el email ya existe, redirigir automáticamente al login
        if (result.error === 'EMAIL_EXISTS' || response.status === 409 || result.action === 'LOGIN_TO_UPGRADE') {
          console.log('⚠️ [OWNER_STEP1] Email ya existe, redirigiendo al login...');
          // Si es registro de owner, redirigir al paso 2 después del login
          const nextUrl = isOwnerRegistration
            ? `/login?next=${encodeURIComponent('/owners/registrarse/info')}&email=${encodeURIComponent(formData.email)}`
            : `/login?email=${encodeURIComponent(formData.email)}`;
          window.location.href = nextUrl;
          return;
        }

        setError(result.message || result.error || 'Error al registrar. Por favor, intenta nuevamente.');
        setLoading(false);
        return;
      }

      // El registro ya crea la sesión automáticamente (cookie JWT)
      // Los datos del paso 1 ahora se guardan en la BD (tabla usuarios)
      // Ya no necesitamos localStorage - el paso 2 leerá de la BD
      console.log('✅ [OWNER_STEP1] Registro exitoso, cookie de sesión establecida');
      console.log('✅ [OWNER_STEP1] Datos guardados en BD (tabla usuarios):', {
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        telefono: formData.telefono.trim(),
        pais: formData.pais.trim()
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));

      // Si es registro de owner, redirigir al paso 2
      if (isOwnerRegistration) {
        // Redirigir al paso 2 usando router.replace
        router.replace('/owners/registrarse/info');
      } else {
        // Si es registro normal, redirigir al home o dashboard
        await new Promise(resolve => setTimeout(resolve, 300));
        router.replace('/');
      }
    } catch (err) {
      console.error('❌ [OWNER_STEP1] Error en registro:', err);
      setError('Ocurrió un error. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido a Stellamotion</h1>
          <p className="text-lg text-gray-600 mb-4">Información básica</p>

          {/* Indicadores de pasos - Solo mostrar si es registro de owner */}
          {isOwnerRegistration && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className={`w-3 h-3 rounded-full transition-colors ${true ? 'bg-[#e94446]' : 'bg-white border-2 border-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${false ? 'bg-[#e94446]' : 'bg-white border-2 border-gray-300'}`} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription>
                {error}
                {error.includes('ya está registrado') && (
                  <div className="mt-3">
                    <a
                      href={`/login?next=${encodeURIComponent('/owners/registrarse/info')}`}
                      className="text-[#e94446] hover:underline font-medium"
                    >
                      Iniciar sesión →
                    </a>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre *</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos" className="text-sm font-medium text-gray-700">Apellidos *</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Tus apellidos"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais" className="text-sm font-medium text-gray-700">País *</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="pais"
                  name="pais"
                  type="text"
                  required
                  value={formData.pais}
                  onChange={handleChange}
                  className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="España"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraseña" className="text-sm font-medium text-gray-700">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="contraseña"
                  name="contraseña"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.contraseña}
                  onChange={handleChange}
                  className="pl-14 pr-14 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarContraseña" className="text-sm font-medium text-gray-700">Repite tu contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Input
                  id="confirmarContraseña"
                  name="confirmarContraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmarContraseña}
                  onChange={handleChange}
                  className="pl-14 pr-14 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                  placeholder="Confirma tu contraseña"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-8 pb-8">
            <Button
              type="submit"
              className="px-12 py-6 text-lg rounded-2xl bg-[#e94446] hover:bg-[#d63a3a] transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validando...
                </>
              ) : (
                isOwnerRegistration ? 'Continuar' : 'Registro'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-8">
          <p>¿Ya tienes cuenta? <a href="/login" className="text-[#e94446] hover:underline font-medium">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
}

