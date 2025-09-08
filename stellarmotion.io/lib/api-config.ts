// Configuración de APIs unificadas
// Ahora usamos las APIs del ERP como fuente única de datos

export const API_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  // Soportes/Productos
  supports: `${API_BASE_URL}/api/soportes`,
  support: (id: string) => `${API_BASE_URL}/api/soportes/${id}`,
  supportBySlug: (slug: string) => `${API_BASE_URL}/api/soportes?slug=${slug}`,
  
  // Categorías
  categories: `${API_BASE_URL}/api/categories`,
  category: (slug: string) => `${API_BASE_URL}/api/categories?slug=${slug}`,
  
  // Reservas
  reservations: `${API_BASE_URL}/api/reservations`,
  reservation: (id: string) => `${API_BASE_URL}/api/reservations/${id}`,
  
  // Clientes
  clients: `${API_BASE_URL}/api/clients`,
  client: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
} as const

// Función helper para hacer requests a las APIs del ERP
export async function fetchFromERP(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching from ERP:', error)
    throw error
  }
}
