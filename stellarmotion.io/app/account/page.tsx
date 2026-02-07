'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Upload, Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function getInitials(name: string): string {
  const n = (name || '').trim()
  if (!n) return 'U'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return n.slice(0, 2).toUpperCase()
}

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    passwordActual: '',
    passwordNueva: '',
    passwordNuevaConfirmar: '',
  })

  const [showPasswordActual, setShowPasswordActual] = useState(false)
  const [showPasswordNueva, setShowPasswordNueva] = useState(false)
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) {
          router.push('/auth/login')
          return
        }
        const data = await response.json()
        if (!data.success || !data.user) {
          router.push('/auth/login')
          return
        }
        setUser(data.user)
        setFormData({
          nombre: data.user.name || data.user.nombre || '',
          email: data.user.email || '',
          telefono: data.user.telefono || '',
          passwordActual: '',
          passwordNueva: '',
          passwordNuevaConfirmar: '',
        })
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (formData.passwordNueva || formData.passwordNuevaConfirmar) {
        if (!formData.passwordActual) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Debes ingresar tu contraseña actual',
          })
          setSaving(false)
          return
        }
        if (formData.passwordNueva !== formData.passwordNuevaConfirmar) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Las contraseñas nuevas no coinciden',
          })
          setSaving(false)
          return
        }
        if (formData.passwordNueva.length < 6) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'La contraseña nueva debe tener al menos 6 caracteres',
          })
          setSaving(false)
          return
        }
      }

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          passwordActual: formData.passwordActual || undefined,
          passwordNueva: formData.passwordNueva || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Perfil actualizado',
          description: 'Tus datos se han guardado correctamente',
        })
        setFormData({
          ...formData,
          passwordActual: '',
          passwordNueva: '',
          passwordNuevaConfirmar: '',
        })
        setUser((prev: any) => (prev ? { ...prev, name: formData.nombre, nombre: formData.nombre, telefono: formData.telefono } : null))
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al actualizar perfil',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al actualizar perfil',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e94446]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = getInitials(formData.nombre || user.email || 'U')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Información de tu cuenta</p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Información Personal</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Tus datos de usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar con botón de subir (estilo ERP) */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-2 ring-gray-200 dark:ring-gray-700">
                  <AvatarImage
                    src={user?.avatar_url || user?.image_url || user?.picture}
                    alt={formData.nombre || user.email}
                  />
                  <AvatarFallback className="bg-[#e94446] text-white text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-[#e94446] hover:bg-[#d63a3a] text-white rounded-full p-2 cursor-pointer transition-colors"
                  title="Cambiar imagen"
                >
                  <Upload className="h-4 w-4" />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => {
                    toast({
                      title: 'Próximamente',
                      description: 'La subida de imagen de perfil estará disponible pronto.',
                    })
                  }}
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formData.nombre || user.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                  className="mt-1.5 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El email no se puede modificar
                </p>
              </div>

              <div>
                <Label htmlFor="telefono" className="text-gray-700 dark:text-gray-300">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: +34 600 000 000"
                  className="mt-1.5 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Cambiar Contraseña
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="passwordActual" className="text-gray-700 dark:text-gray-300">
                      Contraseña Actual
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="passwordActual"
                        type={showPasswordActual ? 'text' : 'password'}
                        value={formData.passwordActual}
                        onChange={(e) =>
                          setFormData({ ...formData, passwordActual: e.target.value })
                        }
                        placeholder="Ingresa tu contraseña actual"
                        className="pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500"
                        onClick={() => setShowPasswordActual(!showPasswordActual)}
                      >
                        {showPasswordActual ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="passwordNueva" className="text-gray-700 dark:text-gray-300">
                      Nueva Contraseña
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="passwordNueva"
                        type={showPasswordNueva ? 'text' : 'password'}
                        value={formData.passwordNueva}
                        onChange={(e) =>
                          setFormData({ ...formData, passwordNueva: e.target.value })
                        }
                        placeholder="Ingresa tu nueva contraseña"
                        className="pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500"
                        onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                      >
                        {showPasswordNueva ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="passwordNuevaConfirmar"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="passwordNuevaConfirmar"
                        type={showPasswordConfirmar ? 'text' : 'password'}
                        value={formData.passwordNuevaConfirmar}
                        onChange={(e) =>
                          setFormData({ ...formData, passwordNuevaConfirmar: e.target.value })
                        }
                        placeholder="Confirma tu nueva contraseña"
                        className="pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500"
                        onClick={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                      >
                        {showPasswordConfirmar ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#e94446] hover:bg-[#d63a3a] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
