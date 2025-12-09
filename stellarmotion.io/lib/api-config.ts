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

// Configuración de reintentos
const FETCH_CONFIG = {
  timeout: 15000, // 15s timeout (reducido de 30s)
  maxRetries: 2,
  retryDelays: [1000, 2000], // Backoff: 1s, 2s
} as const

// Helper para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Función helper para hacer requests a las APIs del ERP
export async function fetchFromERP(endpoint: string, options?: RequestInit) {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= FETCH_CONFIG.maxRetries; attempt++) {
    try {
      const isRetry = attempt > 0
      if (isRetry) {
        const delayMs = FETCH_CONFIG.retryDelays[attempt - 1]
        console.log(`🔄 fetchFromERP: Reintento ${attempt}/${FETCH_CONFIG.maxRetries} después de ${delayMs}ms...`)
        await delay(delayMs)
      }
      
      console.log(`🌐 fetchFromERP [intento ${attempt + 1}]: Iniciando request a:`, endpoint)
      const startTime = Date.now()
      
      // Crear AbortController para control del timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.warn(`⏱️ fetchFromERP: Timeout después de ${FETCH_CONFIG.timeout}ms, abortando...`)
        controller.abort()
      }, FETCH_CONFIG.timeout)
      
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      const duration = Date.now() - startTime
      console.log(`✅ fetchFromERP: Response recibida en ${duration}ms, status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      
      // Verificar que la respuesta sea válida
      if (data === null || data === undefined) {
        throw new Error('Empty response from ERP')
      }
      
      return data
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const isTimeout = lastError.name === 'AbortError'
      const isNetworkError = lastError.message.includes('fetch') || lastError.message.includes('network')
      
      console.error(`❌ fetchFromERP [intento ${attempt + 1}]: Error -`, lastError.message)
      
      // Si es el último intento o no es un error recuperable, lanzar
      const isRecoverableError = isTimeout || isNetworkError
      const isLastAttempt = attempt === FETCH_CONFIG.maxRetries
      
      if (!isRecoverableError || isLastAttempt) {
        console.error('❌ fetchFromERP: Error no recuperable o intentos agotados')
        throw lastError
      }
      
      // Continuar al siguiente intento
    }
  }
  
  // Nunca debería llegar aquí, pero por si acaso
  throw lastError || new Error('fetchFromERP failed after all retries')
}
