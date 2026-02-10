'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, Globe, Lock, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    pais: '',
    contraseña: '',
    confirmarContraseña: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Registrar cliente usando /api/auth/register-client
      const response = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.contraseña,
          nombre_contacto: `${formData.nombre.trim()} ${formData.apellidos.trim()}`,
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          telefono: formData.telefono.trim(),
          pais: formData.pais.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Si el email ya existe
        if (result.error === 'EMAIL_EXISTS' || response.status === 409) {
          setError('Este email ya está registrado. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        setError(result.message || result.error || 'Error al registrar. Por favor, intenta nuevamente.');
        setLoading(false);
        return;
      }

      // El registro crea la sesión automáticamente (cookie JWT)
      // Los datos se guardan en la tabla usuarios
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirigir al home
      window.location.href = '/';
    } catch (err) {
      setError('Ocurrió un error. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido a Stellamotion</h1>
          <p className="text-lg text-gray-600 mb-4">Información básica</p>

          {/* Indicadores de pasos */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-3 h-3 rounded-full bg-[#e94446]" />
            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription>{error}</AlertDescription>
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
                'Continuar'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-8">
          <p>¿Ya tienes cuenta? <Link prefetch={false} href="/auth/login" className="text-[#e94446] hover:underline font-medium">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
