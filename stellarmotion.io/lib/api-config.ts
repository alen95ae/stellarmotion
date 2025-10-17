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
      // Agregar timeout para evitar requests colgados
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    
    // Verificar que la respuesta sea válida
    if (data === null || data === undefined) {
      throw new Error('Empty response from ERP')
    }
    
    return data
  } catch (error) {
    console.error('Error fetching from ERP:', error)
    
    // Si es un error de timeout o conexión, devolver array vacío en lugar de fallar
    if (error instanceof Error && (
      error.message.includes('timeout') || 
      error.message.includes('fetch') ||
      error.message.includes('network')
    )) {
      console.warn('ERP connection failed, returning empty array');
      return [];
    }
    
    throw error
  }
}
