'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type UserRole = 'admin' | 'owner' | 'seller' | 'client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Prellenar email desde query params si existe
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

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

      // Obtener parámetro next de la URL
      const nextParam = searchParams.get('next')
      console.log('🔍 [LOGIN] nextParam:', nextParam);
      
      // Verificar si el usuario ya tiene registro en la tabla owners
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (ownerError) {
        console.error('❌ [LOGIN] Error verificando owner:', ownerError)
      }

      console.log('🔍 [LOGIN] ownerData:', ownerData ? 'existe' : 'no existe');

      // Obtener rol del usuario
      const userRole = data.user.user_metadata?.role as UserRole | undefined
      console.log('🔍 [LOGIN] userRole:', userRole);

      // Determinar redirección
      let redirectPath = '/'

      // Si no tiene registro en owners, SIEMPRE redirigir al paso 2 para completar el registro
      if (!ownerData) {
        // Priorizar next si viene y es para completar owner
        if (nextParam && (nextParam.includes('owners/registrarse/info') || nextParam === '/owners/registrarse/info')) {
          redirectPath = nextParam
          console.log('✅ [LOGIN] Redirigiendo al paso 2 (next param):', redirectPath);
        } else {
          redirectPath = '/owners/registrarse/info'
          console.log('✅ [LOGIN] Redirigiendo al paso 2 (sin owner):', redirectPath);
        }
      } else {
        // Si ya tiene registro en owners, redirigir según su rol
        switch (userRole) {
          case 'admin':
            redirectPath = '/panel/inicio'
            break
          case 'owner':
            redirectPath = '/panel/inicio'
            break
          case 'seller':
            redirectPath = '/panel/inicio'
            break
          case 'client':
            // Si es client y viene next, usar next; si no, home
            redirectPath = nextParam || '/'
            break
          default:
            redirectPath = nextParam || '/'
        }
        console.log('✅ [LOGIN] Redirigiendo según rol:', redirectPath);
      }

      // Forzar redirección con window.location para evitar problemas de estado
      window.location.href = redirectPath
      
      // No necesitamos setLoading(false) aquí porque la página se redirigirá
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Error de conexión. Por favor, intenta nuevamente')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
          <p className="text-lg text-gray-600">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pl-14 pr-4 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña *</Label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-[#e94446] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-14 pr-14 py-3 rounded-2xl border-gray-300 focus:border-[#e94446] focus:ring-2 focus:ring-[#e94446]/20"
                autoComplete="current-password"
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

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="px-12 py-6 text-lg rounded-2xl bg-[#e94446] hover:bg-[#d63a3a] transition-all shadow-lg hover:shadow-xl"
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
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-8">
          <p>¿No tienes una cuenta? <Link href="/owners/registrarse" className="text-[#e94446] hover:underline font-medium">Regístrate</Link></p>
        </div>
      </div>
    </div>
  )
}

