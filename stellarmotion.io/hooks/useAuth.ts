'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppRole } from '@/lib/auth/role'
// Using relative API routes instead of direct ERP calls

// Usar AppRole como fuente única de verdad
export type UserRole = AppRole

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  user: {
    id: string
    email: string
    name: string
  } | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
}

export function useAuth() {
  const [authUser, setAuthUser] = useState<AuthUser>({
    user: null,
    profile: null,
    role: null,
    loading: true
  })
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        setAuthUser({
          user: null,
          profile: null,
          role: null,
          loading: false
        })
        return
      }

      const data = await response.json()
      
      if (data.success && data.user) {
        setAuthUser({
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.nombre || ''
          },
          profile: null, // No necesitamos profile separado
          role: data.user.role as UserRole,
          loading: false
        })
      } else {
        setAuthUser({
          user: null,
          profile: null,
          role: null,
          loading: false
        })
      }
    } catch (error) {
      console.error('❌ Error checking session:', error)
      setAuthUser({
        user: null,
        profile: null,
        role: null,
        loading: false
      })
    }
  }

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Error al iniciar sesión' }
      }

      // La nueva API devuelve { ok: true, success, user, redirect } o { ok: true, data: { success, user, redirect } }
      const userData = data.user || data.data?.user;
      const success = data.success || data.data?.success || data.ok;
      const redirect = data.redirect || data.data?.redirect;

      if (success && userData) {
        setAuthUser({
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name || ''
          },
          profile: null,
          role: userData.role as UserRole,
          loading: false
        })

        // Redirigir a HOME excepto si hay redirect específico
        if (redirect) {
          router.push(redirect)
        } else {
          router.push('/')
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      return { error: error.message || 'Error al iniciar sesión' }
    }
  }

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, nombre: email.split('@')[0], role }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Error al registrar usuario' }
      }

      // La nueva API devuelve { ok: true, data: { success, user, redirect } }
      const userData = data.data?.user || data.user;
      const success = data.data?.success || data.success || data.ok;
      const redirect = data.data?.redirect || data.redirect;

      if (success && userData) {
        setAuthUser({
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name || ''
          },
          profile: null,
          role: userData.role as UserRole,
          loading: false
        })

        // Redirigir a HOME excepto si hay redirect específico
        if (redirect) {
          router.push(redirect)
        } else {
          router.push('/')
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Sign up error:', error)
      return { error: error.message || 'Error al registrar usuario' }
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setAuthUser({
        user: null,
        profile: null,
        role: null,
        loading: false
      })

      router.push('/auth/login')
    } catch (error: any) {
      console.error('❌ Sign out error:', error)
    }
  }

  return {
    ...authUser,
    signIn,
    signUp,
    signOut,
    refresh: checkSession,
  }
}
