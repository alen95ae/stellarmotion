'use server'

import { redirect } from 'next/navigation'

export async function logout() {
  // El logout se maneja en el cliente llamando a /api/auth/logout
  // Esta función solo redirige
  redirect('/')
}
