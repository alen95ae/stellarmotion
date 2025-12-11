'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { getNextFromSearchParams } from '@/lib/auth/next'
import { getRoleFromPayload } from '@/lib/auth/role'
import { ROUTES } from '@/lib/routes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

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

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // CRÍTICO: Permite que el navegador acepte cookies HttpOnly
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        const errorMessage = errorData.error || 'Error al iniciar sesión'
        
        // Mensajes más amigables
        if (errorMessage.includes('Credenciales inválidas') || errorMessage.includes('Invalid')) {
          setError('Email o contraseña incorrectos')
        } else {
          setError(errorMessage)
        }
        setLoading(false)
        return
      }

      const data = await response.json()

      if (!data.success || !data.user) {
        setError('No se pudo obtener la información del usuario')
        setLoading(false)
        return
      }

      // Obtener parámetro next de la URL
      const nextParam = getNextFromSearchParams(searchParams)
      
      // Obtener rol del usuario
      const userRole = getRoleFromPayload(data.user.role)

      // Determinar redirección - siempre a HOME excepto si hay parámetro next
      let redirectPath = ROUTES.HOME

      if (nextParam) {
        redirectPath = nextParam
      }

      console.log('🔄 [LOGIN] Redirigiendo a:', redirectPath, 'para rol:', userRole)
      console.log('🔄 [LOGIN] Data recibida:', { success: data.success, user: data.user?.email, role: data.user?.role })

      // Pequeño delay para estabilidad de cookies
      await new Promise((r) => setTimeout(r, 300))
      
      // Usar window.location para forzar recarga completa y asegurar que la cookie se lea
      window.location.href = redirectPath
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

          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-[#e94446] focus:ring-[#e94446] border-gray-300 rounded"
            />
            <Label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              Mantener sesión iniciada
            </Label>
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
