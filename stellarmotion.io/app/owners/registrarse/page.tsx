'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, Globe, Lock, User } from 'lucide-react';

export default function RegistroOwnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    pais: '',
    contraseña: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    try {
      // Validar email directamente en Supabase usando API route
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Si existe el email, retornar false (no disponible)
        return !data.exists;
      }
      
      // Si hay error, permitir continuar (no bloquear registro)
      console.warn('Error al validar email (permitiendo continuar):', response.status);
      return true;
    } catch (error: any) {
      // Si hay error, permitir continuar (no bloquear registro)
      console.warn('Error validating email (permitiendo continuar):', error.message);
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.email.trim() || 
          !formData.telefono.trim() || !formData.pais.trim() || !formData.contraseña.trim()) {
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

      // Verificar si el email ya está registrado
      const emailAvailable = await validateEmail(formData.email);
      if (!emailAvailable) {
        setError('Este email ya está registrado. Por favor, usa otro email o inicia sesión.');
        setLoading(false);
        return;
      }

      // Guardar nombre completo en localStorage
      const nombreCompleto = `${formData.nombre} ${formData.apellidos}`;
      localStorage.setItem('owner_nombre_completo', nombreCompleto);

      // Guardar en localStorage temporalmente (sin apellidos por separado)
      const { apellidos, ...formDataSinApellidos } = formData;
      localStorage.setItem('ownerRegistration', JSON.stringify({
        ...formDataSinApellidos,
        step: 1,
        timestamp: Date.now()
      }));

      // Avanzar al paso 2
      router.push('/owners/registrarse/info');
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Ocurrió un error. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Únete como Owner</h1>
          <p className="mt-2 text-gray-600">Paso 1 de 2: Información básica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro inicial</CardTitle>
            <CardDescription>
              Crea tu cuenta para comenzar a gestionar tus soportes publicitarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Tus apellidos"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="pais"
                    name="pais"
                    type="text"
                    required
                    value={formData.pais}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="España"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="contraseña"
                    name="contraseña"
                    type="password"
                    required
                    value={formData.contraseña}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#e94446] hover:bg-[#d63a3a]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>¿Ya tienes cuenta? <a href="/login" className="text-[#e94446] hover:underline">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
}

