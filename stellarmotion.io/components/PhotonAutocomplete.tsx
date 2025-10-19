'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PhotonResult {
  name: string
  country: string
  state?: string
  postcode?: string
  city?: string
  lat?: number
  lon?: number
}

interface PhotonAutocompleteProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect?: (result: PhotonResult) => void
  type?: 'city' | 'country'
  className?: string
}

// Mapeo de países a español
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
  'Cameroon': 'Camerún',
  'Democratic Republic of the Congo': 'República Democrática del Congo',
  'Congo': 'Congo',
  'Angola': 'Angola',
  'Mozambique': 'Mozambique',
  'Madagascar': 'Madagascar',
  'Tanzania': 'Tanzania',
  'Uganda': 'Uganda',
  'Rwanda': 'Ruanda',
  'Burundi': 'Burundi',
  'Zambia': 'Zambia',
  'Zimbabwe': 'Zimbabue',
  'Botswana': 'Botsuana',
  'Namibia': 'Namibia',
  'Lesotho': 'Lesoto',
  'Swaziland': 'Suazilandia',
  'Malawi': 'Malaui',
  'Mauritius': 'Mauricio',
  'Seychelles': 'Seychelles',
  'Comoros': 'Comoras',
  'Djibouti': 'Yibuti',
  'Somalia': 'Somalia',
  'Eritrea': 'Eritrea',
  'South Sudan': 'Sudán del Sur',
  'Central African Republic': 'República Centroafricana',
  'Chad': 'Chad',
  'Niger': 'Níger',
  'Mali': 'Malí',
  'Burkina Faso': 'Burkina Faso',
  'Guinea': 'Guinea',
  'Guinea-Bissau': 'Guinea-Bisáu',
  'Sierra Leone': 'Sierra Leona',
  'Liberia': 'Liberia',
  'Gambia': 'Gambia',
  'Mauritania': 'Mauritania',
  'Western Sahara': 'Sahara Occidental',
  'Israel': 'Israel',
  'Palestine': 'Palestina',
  'Jordan': 'Jordania',
  'Lebanon': 'Líbano',
  'Syria': 'Siria',
  'Iraq': 'Irak',
  'Iran': 'Irán',
  'Kuwait': 'Kuwait',
  'Saudi Arabia': 'Arabia Saudí',
  'United Arab Emirates': 'Emiratos Árabes Unidos',
  'Qatar': 'Catar',
  'Bahrain': 'Baréin',
  'Oman': 'Omán',
  'Yemen': 'Yemen',
  'Afghanistan': 'Afganistán',
  'Pakistan': 'Pakistán',
  'Bangladesh': 'Bangladesh',
  'Sri Lanka': 'Sri Lanka',
  'Maldives': 'Maldivas',
  'Nepal': 'Nepal',
  'Bhutan': 'Bután',
  'Myanmar': 'Myanmar',
  'Laos': 'Laos',
  'Cambodia': 'Camboya',
  'Brunei': 'Brunéi',
  'East Timor': 'Timor Oriental',
  'Papua New Guinea': 'Papúa Nueva Guinea',
  'Fiji': 'Fiyi',
  'Samoa': 'Samoa',
  'Tonga': 'Tonga',
  'Vanuatu': 'Vanuatu',
  'Solomon Islands': 'Islas Salomón',
  'Palau': 'Palau',
  'Micronesia': 'Micronesia',
  'Marshall Islands': 'Islas Marshall',
  'Kiribati': 'Kiribati',
  'Tuvalu': 'Tuvalu',
  'Nauru': 'Nauru'
}

export function PhotonAutocomplete({ 
  label,
  placeholder = "Buscar ubicación...", 
  value, 
  onChange, 
  onSelect,
  type,
  className 
}: PhotonAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PhotonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(value)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value])

  const searchPlaces = async (query: string) => {
    if (query.length < 2) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=20&lang=es`
      )
      const data = await response.json()
      
      let results: PhotonResult[] = []
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!data || !data.features || !Array.isArray(data.features)) {
        console.warn('Invalid response structure from Photon API:', data)
        setSuggestions([])
        return
      }
      
      if (type === 'city') {
        // Filtrar solo ciudades
        results = data.features
          .filter((feature: any) => 
            feature && 
            feature.properties && 
            (feature.properties.type === 'city' || 
             feature.properties.type === 'town' ||
             feature.properties.type === 'village')
          )
          .map((feature: any) => ({
            name: feature.properties.name || '',
            country: COUNTRY_TRANSLATIONS[feature.properties.country] || feature.properties.country || '',
            state: feature.properties.state || '',
            postcode: feature.properties.postcode || '',
            city: feature.properties.city || '',
            lat: feature.geometry?.coordinates?.[1],
            lon: feature.geometry?.coordinates?.[0]
          }))
          .filter(result => result.name) // Solo incluir resultados con nombre
      } else if (type === 'country') {
        // Filtrar solo países
        results = data.features
          .filter((feature: any) => 
            feature && 
            feature.properties && 
            feature.properties.type === 'country'
          )
          .map((feature: any) => ({
            name: COUNTRY_TRANSLATIONS[feature.properties.name] || feature.properties.name || '',
            country: COUNTRY_TRANSLATIONS[feature.properties.country] || feature.properties.country || '',
            lat: feature.geometry?.coordinates?.[1],
            lon: feature.geometry?.coordinates?.[0]
          }))
          .filter(result => result.name) // Solo incluir resultados con nombre
      } else {
        // Sin filtro de tipo - mostrar todo
        results = data.features
          .filter((feature: any) => 
            feature && 
            feature.properties && 
            (feature.properties.type === 'city' || 
             feature.properties.type === 'town' ||
             feature.properties.type === 'village' ||
             feature.properties.type === 'country' ||
             feature.properties.type === 'state' ||
             feature.properties.type === 'county' ||
             feature.properties.type === 'district' ||
             feature.properties.type === 'municipality' ||
             feature.properties.type === 'locality' ||
             feature.properties.type === 'suburb' ||
             feature.properties.type === 'neighbourhood')
          )
          .map((feature: any) => ({
            name: feature.properties.name || '',
            country: COUNTRY_TRANSLATIONS[feature.properties.country] || feature.properties.country || '',
            state: feature.properties.state || '',
            postcode: feature.properties.postcode || '',
            city: feature.properties.city || '',
            lat: feature.geometry?.coordinates?.[1],
            lon: feature.geometry?.coordinates?.[0]
          }))
          .filter(result => result.name) // Solo incluir resultados con nombre
      }

      // Eliminar duplicados y priorizar resultados más relevantes
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.name === result.name && r.country === result.country)
      )

      // Priorizar ciudades y países sobre otros tipos
      const sortedResults = uniqueResults.sort((a, b) => {
        const aIsCity = a.name && a.country
        const bIsCity = b.name && b.country
        if (aIsCity && !bIsCity) return -1
        if (!aIsCity && bIsCity) return 1
        return 0
      })

      setSuggestions(sortedResults.slice(0, 15))
    } catch (error) {
      console.error('Error searching places:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (suggestion: PhotonResult) => {
    let displayName = suggestion.name
    
    // Construir nombre más descriptivo
    if (suggestion.state && suggestion.country) {
      displayName = `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
    } else if (suggestion.country) {
      displayName = `${suggestion.name}, ${suggestion.country}`
    } else if (suggestion.state) {
      displayName = `${suggestion.name}, ${suggestion.state}`
    }
    
    setInputValue(displayName)
    onChange(displayName)
    if (onSelect) {
      onSelect(suggestion)
    }
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={label.toLowerCase()}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 px-3"
          >
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className={inputValue ? "text-foreground" : "text-muted-foreground"}>
                {inputValue || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                autoFocus
              />
            </div>
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm">
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    Buscando...
                  </div>
                </div>
              )}
              {!loading && suggestions.length === 0 && inputValue.length >= 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No se encontraron resultados.
                </div>
              )}
              {!loading && inputValue.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar.
                </div>
              )}
              {suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      value={suggestion.name}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer px-3 py-2"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          inputValue === suggestion.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.state && suggestion.country 
                            ? `${suggestion.state}, ${suggestion.country}`
                            : suggestion.country || suggestion.state || ''
                          }
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
