// Función optimizada para búsqueda de lugares en la web usando Photon
// Basada en la implementación del ERP pero optimizada para el buscador público

export interface PhotonResult {
  name: string
  country: string
  state?: string
  postcode?: string
  city?: string
  lat?: number
  lon?: number
  displayName: string
}

// Mapeo de países a español (versión reducida para la web)
const COUNTRY_TRANSLATIONS: Record<string, string> = {
  'Spain': 'España',
  'United States': 'Estados Unidos',
  'United Kingdom': 'Reino Unido',
  'France': 'Francia',
  'Germany': 'Alemania',
  'Italy': 'Italia',
  'Portugal': 'Portugal',
  'Netherlands': 'Países Bajos',
  'Belgium': 'Bélgica',
  'Switzerland': 'Suiza',
  'Austria': 'Austria',
  'Sweden': 'Suecia',
  'Norway': 'Noruega',
  'Denmark': 'Dinamarca',
  'Finland': 'Finlandia',
  'Poland': 'Polonia',
  'Czech Republic': 'República Checa',
  'Hungary': 'Hungría',
  'Romania': 'Rumania',
  'Bulgaria': 'Bulgaria',
  'Greece': 'Grecia',
  'Turkey': 'Turquía',
  'Russia': 'Rusia',
  'Ukraine': 'Ucrania',
  'Canada': 'Canadá',
  'Mexico': 'México',
  'Brazil': 'Brasil',
  'Argentina': 'Argentina',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Peru': 'Perú',
  'Venezuela': 'Venezuela',
  'Ecuador': 'Ecuador',
  'Bolivia': 'Bolivia',
  'Paraguay': 'Paraguay',
  'Uruguay': 'Uruguay',
  'Costa Rica': 'Costa Rica',
  'Panama': 'Panamá',
  'Guatemala': 'Guatemala',
  'Honduras': 'Honduras',
  'El Salvador': 'El Salvador',
  'Nicaragua': 'Nicaragua',
  'Cuba': 'Cuba',
  'Dominican Republic': 'República Dominicana',
  'Haiti': 'Haití',
  'Jamaica': 'Jamaica',
  'Puerto Rico': 'Puerto Rico',
  'China': 'China',
  'Japan': 'Japón',
  'South Korea': 'Corea del Sur',
  'North Korea': 'Corea del Norte',
  'India': 'India',
  'Thailand': 'Tailandia',
  'Vietnam': 'Vietnam',
  'Philippines': 'Filipinas',
  'Indonesia': 'Indonesia',
  'Malaysia': 'Malasia',
  'Singapore': 'Singapur',
  'Australia': 'Australia',
  'New Zealand': 'Nueva Zelanda',
  'South Africa': 'Sudáfrica',
  'Egypt': 'Egipto',
  'Morocco': 'Marruecos',
  'Algeria': 'Argelia',
  'Tunisia': 'Túnez',
  'Libya': 'Libia',
  'Sudan': 'Sudán',
  'Ethiopia': 'Etiopía',
  'Kenya': 'Kenia',
  'Nigeria': 'Nigeria',
  'Ghana': 'Ghana',
  'Senegal': 'Senegal',
  'Ivory Coast': 'Costa de Marfil',
  'Cameroon': 'Camerún'
}

/**
 * Función optimizada para búsqueda de lugares en la web usando Photon
 * Prioriza resultados españoles y devuelve más opciones
 */
export async function searchPlacesWeb(query: string): Promise<PhotonResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    // Construir URL con parámetros básicos
    const encodedQuery = encodeURIComponent(query)
    const url = `https://photon.komoot.io/api?q=${encodedQuery}&limit=20`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Verificar estructura de respuesta
    if (!data || !data.features || !Array.isArray(data.features)) {
      console.warn('Invalid response structure from Photon API:', data)
      return []
    }

    // Procesar resultados
    const results: PhotonResult[] = data.features
      .filter((feature: any) => {
        // Filtrar solo lugares relevantes (ciudades, pueblos, países, regiones)
        return feature && 
               feature.properties && 
               (feature.properties.type === 'city' || 
                feature.properties.type === 'town' ||
                feature.properties.type === 'village' ||
                feature.properties.type === 'country' ||
                feature.properties.type === 'state' ||
                feature.properties.type === 'region')
      })
      .map((feature: any) => {
        const props = feature.properties
        const country = COUNTRY_TRANSLATIONS[props.country] || props.country || ''
        
        // Crear displayName más descriptivo
        let displayName = props.name || ''
        if (country && country !== displayName) {
          displayName = `${displayName}, ${country}`
        }
        if (props.state && props.state !== props.name && props.state !== country) {
          displayName = `${props.name}, ${props.state}, ${country}`
        }

        return {
          name: props.name || '',
          country: country,
          state: props.state || '',
          postcode: props.postcode || '',
          city: props.city || '',
          lat: feature.geometry?.coordinates?.[1],
          lon: feature.geometry?.coordinates?.[0],
          displayName: displayName
        }
      })
      .filter(result => result.name && result.displayName) // Solo resultados válidos
      .sort((a, b) => {
        // Priorizar resultados españoles
        if (a.country === 'España' && b.country !== 'España') return -1
        if (b.country === 'España' && a.country !== 'España') return 1
        return 0
      })
      .slice(0, 15) // Limitar a 15 resultados para mejor UX

    return results

  } catch (error) {
    console.error('Error searching places with Photon:', error)
    return []
  }
}

/**
 * Función para búsqueda de lugares por coordenadas (reverse geocoding)
 */
export async function searchPlacesByCoordinates(lat: number, lng: number): Promise<PhotonResult | null> {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data || !data.features || !Array.isArray(data.features) || data.features.length === 0) {
      return null
    }

    const feature = data.features[0]
    const props = feature.properties
    const country = COUNTRY_TRANSLATIONS[props.country] || props.country || ''
    
    // Crear un nombre más descriptivo basado en la información disponible
    let displayName = ''
    
    if (props.street && props.city) {
      displayName = `${props.street}, ${props.city}`
    } else if (props.name && props.city) {
      displayName = `${props.name}, ${props.city}`
    } else if (props.city) {
      displayName = props.city
    } else if (props.name) {
      displayName = props.name
    } else {
      displayName = 'Ubicación'
    }
    
    // Agregar país si es diferente
    if (country && country !== displayName && !displayName.includes(country)) {
      displayName = `${displayName}, ${country}`
    }

    return {
      name: props.name || props.street || props.city || 'Ubicación',
      country: country,
      state: props.state || '',
      postcode: props.postcode || '',
      city: props.city || '',
      lat: lat,
      lon: lng,
      displayName: displayName
    }

  } catch (error) {
    console.error('Error in reverse geocoding with Photon:', error)
    return null
  }
}
