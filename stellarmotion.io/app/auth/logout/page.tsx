'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function LogoutPage() {
  const { signOut } = useAuth()

  useEffect(() => {
    signOut()
  }, [signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#e94446]" />
        <p className="mt-4 text-gray-600">Cerrando sesión...</p>
      </div>
    </div>
  )
}





