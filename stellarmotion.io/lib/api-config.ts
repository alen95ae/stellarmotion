// Configuración de APIs unificadas
// IMPORTANTE: Las llamadas desde el cliente deben usar las APIs proxy de Next.js (/api/*)
// para evitar problemas de CORS. Las llamadas directas al ERP solo deben hacerse desde
// el servidor (API routes de Next.js).

// URL base del ERP (solo para uso en servidor)
export const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000'

// Alias para compatibilidad con código existente
export const API_BASE_URL = ERP_BASE_URL

// Validar que la URL del ERP sea válida
function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Verificar configuración en desarrollo
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  if (!validateUrl(ERP_BASE_URL)) {
    console.error('❌ ERROR: ERP_BASE_URL no es una URL válida:', ERP_BASE_URL)
  } else {
    console.log('✅ ERP_BASE_URL configurado:', ERP_BASE_URL)
  }
}

// Endpoints del ERP (solo para uso en servidor - API routes)
export const ERP_ENDPOINTS = {
  // Soportes/Productos
  supports: `${ERP_BASE_URL}/api/soportes`,
  support: (id: string) => `${ERP_BASE_URL}/api/soportes/${id}`,
  supportBySlug: (slug: string) => `${ERP_BASE_URL}/api/soportes?slug=${slug}`,
  
  // Categorías
  categories: `${ERP_BASE_URL}/api/categories`,
  category: (slug: string) => `${ERP_BASE_URL}/api/categories?slug=${slug}`,
  
  // Alquileres
  reservations: `${ERP_BASE_URL}/api/reservations`,
  reservation: (id: string) => `${ERP_BASE_URL}/api/reservations/${id}`,
  
  // Clientes
  clients: `${ERP_BASE_URL}/api/clients`,
  client: (id: string) => `${ERP_BASE_URL}/api/clients/${id}`,
} as const

// Endpoints de API proxy de Next.js (para uso en cliente)
// Estas rutas hacen proxy al ERP desde el servidor, evitando CORS
export const API_ENDPOINTS = {
  // Soportes/Productos - usar API proxy local
  supports: '/api/soportes',
  support: (id: string) => `/api/soportes/${id}`,
  supportBySlug: (slug: string) => `/api/soportes?slug=${slug}`,
  
  // Categorías - usar API proxy local
  categories: '/api/categories',
  category: (slug: string) => `/api/categories?slug=${slug}`,
  
  // Alquileres - usar API proxy local
  reservations: '/api/reservations',
  reservation: (id: string) => `/api/reservations/${id}`,
  
  // Clientes - usar API proxy local
  clients: '/api/clients',
  client: (id: string) => `/api/clients/${id}`,
} as const

// Configuración de reintentos
const FETCH_CONFIG = {
  timeout: 30000, // 30s timeout (aumentado para dar más tiempo al ERP)
  maxRetries: 2,
  retryDelays: [1000, 2000], // Backoff: 1s, 2s
} as const

// Helper para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Valida que una URL sea válida antes de hacer fetch
 */
function validateEndpointUrl(endpoint: string): { valid: boolean; error?: string } {
  if (!endpoint || typeof endpoint !== 'string') {
    return { valid: false, error: 'Endpoint debe ser una cadena de texto no vacía' }
  }
  
  // Si es una ruta relativa (empieza con /), es válida para APIs proxy
  if (endpoint.startsWith('/')) {
    return { valid: true }
  }
  
  // Si es una URL absoluta, validar formato
  try {
    const url = new URL(endpoint)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: `Protocolo no soportado: ${url.protocol}. Solo http: y https:` }
    }
    return { valid: true }
  } catch (e) {
    return { valid: false, error: `URL inválida: ${endpoint}` }
  }
}

/**
 * Detecta el tipo de error de red para proporcionar mensajes más útiles
 */
function diagnoseNetworkError(error: Error, endpoint: string): string {
  const message = error.message.toLowerCase()
  const endpointLower = endpoint.toLowerCase()
  
  // Error de CORS
  if (message.includes('cors') || message.includes('cross-origin')) {
    return `Error de CORS: El endpoint "${endpoint}" no permite peticiones desde este origen. Usa la API proxy local (/api/*) en lugar de llamar directamente al ERP.`
  }
  
  // Error de conexión
  if (message.includes('failed to fetch') || message.includes('networkerror')) {
    if (endpointLower.includes('localhost:3000') || endpointLower.includes('localhost:3001')) {
      return `No se pudo conectar con el servidor. Verifica que el ERP esté corriendo en ${endpointLower.includes('3000') ? 'localhost:3000' : 'localhost:3001'}.`
    }
    return `Error de conexión de red. Verifica que el servidor esté disponible en: ${endpoint}`
  }
  
  // Timeout (si es ruta proxy /api/*, el proxy llama al ERP en localhost:3000)
  if (error.name === 'AbortError' || message.includes('timeout') || message.includes('aborted')) {
    if (endpoint.startsWith('/api/')) {
      return `Timeout: no hubo respuesta a tiempo. Asegúrate de tener el ERP en marcha (localhost:3000) y la web (localhost:3001).`
    }
    return `Timeout: El servidor no respondió en ${FETCH_CONFIG.timeout}ms. Verifica que el ERP esté activo y respondiendo.`
  }
  
  // URL inválida
  if (message.includes('invalid url') || message.includes('url malformed')) {
    return `URL inválida: "${endpoint}". Verifica que la URL esté correctamente formateada.`
  }
  
  return error.message
}

/**
 * Función helper para hacer requests a las APIs del ERP
 * 
 * IMPORTANTE: Desde el cliente, siempre usa rutas relativas (/api/*) que son proxies
 * al ERP. Las URLs absolutas al ERP solo deben usarse desde el servidor (API routes).
 * 
 * @param endpoint - URL del endpoint (relativa para cliente, absoluta para servidor)
 * @param options - Opciones de fetch estándar
 * @returns Datos de la respuesta
 */
export async function fetchFromERP(endpoint: string, options?: RequestInit) {
  // Validar URL antes de intentar fetch
  const urlValidation = validateEndpointUrl(endpoint)
  if (!urlValidation.valid) {
    const error = new Error(urlValidation.error || 'URL inválida')
    console.error('❌ fetchFromERP: URL inválida:', endpoint, error.message)
    throw error
  }
  
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
        // Intentar leer el error como texto primero
        let errorText = 'Unknown error'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json()
            errorText = errorJson.error || errorJson.message || JSON.stringify(errorJson)
          } else {
            errorText = await response.text()
          }
        } catch (e) {
          // Si falla leer el error, usar el status text
          errorText = response.statusText || `HTTP ${response.status}`
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      // Verificar que la respuesta sea JSON antes de parsear
      const contentType = response.headers.get('content-type')
      if (contentType && !contentType.includes('application/json')) {
        const text = await response.text()
        console.warn('⚠️ fetchFromERP: Respuesta no es JSON, tipo:', contentType)
        // Si la respuesta es texto vacío o solo espacios, considerar como éxito vacío
        if (!text.trim()) {
          return {}
        }
        throw new Error(`Respuesta no es JSON. Content-Type: ${contentType}`)
      }
      
      const data = await response.json().catch((e) => {
        console.error('❌ fetchFromERP: Error parseando JSON:', e)
        throw new Error('Respuesta inválida: no se pudo parsear como JSON')
      })
      
      // Verificar que la respuesta sea válida
      if (data === null || data === undefined) {
        throw new Error('Empty response from ERP')
      }
      
      return data
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const isTimeout = lastError.name === 'AbortError'
      const isNetworkError = lastError.message.includes('fetch') || 
                            lastError.message.includes('network') ||
                            lastError.message.includes('Failed to fetch') ||
                            lastError.message.includes('CORS')
      
      // Diagnosticar el error para mensajes más útiles
      const diagnosedMessage = diagnoseNetworkError(lastError, endpoint)
      console.error(`❌ fetchFromERP [intento ${attempt + 1}]: ${diagnosedMessage}`)
      
      // Si es el último intento o no es un error recuperable, lanzar
      const isRecoverableError = isTimeout || isNetworkError
      const isLastAttempt = attempt === FETCH_CONFIG.maxRetries
      
      if (!isRecoverableError || isLastAttempt) {
        console.error('❌ fetchFromERP: Error no recuperable o intentos agotados')
        // Crear un nuevo error con el mensaje diagnosticado
        const finalError = new Error(diagnosedMessage)
        finalError.name = lastError.name
        throw finalError
      }
      
      // Continuar al siguiente intento
    }
  }
  
  // Nunca debería llegar aquí, pero por si acaso
  throw lastError || new Error('fetchFromERP failed after all retries')
}
