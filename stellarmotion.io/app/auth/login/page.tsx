'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

type UserRole = 'admin' | 'owner' | 'seller' | 'client'

// Función para obtener la ruta de redirección según el rol
function getRedirectPath(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return '/panel/inicio'
    case 'owner':
      return '/panel/inicio'
    case 'seller':
      return '/panel/inicio'
    case 'client':
      return '/'
    default:
      return '/'
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validación básica
      if (!email.trim() || !password.trim()) {
        setError('Por favor, completa todos los campos')
        setLoading(false)
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Por favor, ingresa un email válido')
        setLoading(false)
        return
      }

      // Intentar iniciar sesión
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // Manejar errores específicos
        let errorMessage = 'Error al iniciar sesión'
        
        if (signInError.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos'
        } else if (signInError.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirma tu email antes de iniciar sesión'
        } else if (signInError.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Por favor, espera un momento'
        } else {
          errorMessage = signInError.message
        }

        setError(errorMessage)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('No se pudo obtener la información del usuario')
        setLoading(false)
        return
      }

      // Obtener el rol del usuario desde user_metadata
      const userRole = data.user.user_metadata?.role as UserRole | undefined

      // Redirigir según el rol
      const redirectPath = getRedirectPath(userRole)
      router.push(redirectPath)
      
      // No necesitamos setLoading(false) aquí porque la página se redirigirá
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Error de conexión. Por favor, intenta nuevamente')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Iniciar sesión</CardTitle>
          <CardDescription className="text-gray-600">
            Ingresa tus credenciales para acceder a tu cuenta
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
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 border-gray-300 focus:border-[#e94446] focus:ring-[#e94446]"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-[#e94446] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 border-gray-300 focus:border-[#e94446] focus:ring-[#e94446]"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#e94446] hover:bg-[#d63a3a] text-white font-semibold py-6 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">¿No tienes una cuenta? </span>
            <Link href="/auth/register" className="text-[#e94446] hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
