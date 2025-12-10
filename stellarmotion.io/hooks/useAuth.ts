'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

export type UserRole = 'admin' | 'owner' | 'agency' | 'client'

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  user: User | null
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
    // Obtener sesión inicial
    checkSession()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.id)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setAuthUser({
          user: null,
          profile: null,
          role: null,
          loading: false
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting session:', error)
        setAuthUser(prev => ({ ...prev, loading: false }))
        return
      }

      if (session?.user) {
        await loadUserProfile(session.user.id)
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
      setAuthUser(prev => ({ ...prev, loading: false }))
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      // Obtener datos del owner desde la tabla owners usando user_id
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (ownerError && ownerError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error loading owner data:', ownerError)
      }

      const { data: { user } } = await supabase.auth.getUser()

      // Determinar rol basado en si existe owner data
      let userRole: UserRole | null = null
      if (ownerData) {
        userRole = 'owner'
      } else {
        // Si no es owner, verificar en user_metadata
        const metadataRole = user?.user_metadata?.rol as UserRole
        if (metadataRole && ['admin', 'agency', 'client'].includes(metadataRole)) {
          userRole = metadataRole
        }
      }

      setAuthUser({
        user: user || null,
        profile: ownerData ? {
          id: ownerData.id,
          user_id: ownerData.user_id,
          role: 'owner',
          created_at: ownerData.created_at || new Date().toISOString(),
          updated_at: ownerData.updated_at || new Date().toISOString()
        } : null,
        role: userRole,
        loading: false
      })
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      setAuthUser(prev => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        return { error: error.message }
      }

      if (data.user) {
        await loadUserProfile(data.user.id)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      return { error: error.message || 'Error al iniciar sesión' }
    }
  }

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('❌ Sign up error:', authError)
        return { error: authError.message }
      }

      if (!authData.user) {
        return { error: 'No se pudo crear el usuario' }
      }

      // Para owners, el perfil se crea en la tabla owners (no en usuarios)
      // Para otros roles (admin, agency, client), solo se guarda en user_metadata
      // No necesitamos crear registro en usuarios ya que usamos auth.users directamente
      
      // Cargar perfil después de crear el usuario
      await loadUserProfile(authData.user.id)

      return { data: authData, error: null }
    } catch (error: any) {
      console.error('❌ Sign up error:', error)
      return { error: error.message || 'Error al registrar usuario' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error)
        return { error: error.message }
      }

      setAuthUser({
        user: null,
        profile: null,
        role: null,
        loading: false
      })

      router.push('/auth/login')
      return { error: null }
    } catch (error: any) {
      console.error('❌ Sign out error:', error)
      return { error: error.message || 'Error al cerrar sesión' }
    }
  }

  const requireAuth = (requiredRole?: UserRole) => {
    if (authUser.loading) {
      return { authorized: false, redirect: null }
    }

    if (!authUser.user) {
      return { authorized: false, redirect: '/auth/login' }
    }

    if (requiredRole && authUser.role !== requiredRole) {
      return { authorized: false, redirect: '/auth/error' }
    }

    return { authorized: true, redirect: null }
  }

  return {
    ...authUser,
    signIn,
    signUp,
    signOut,
    requireAuth,
    refresh: checkSession
  }
}

