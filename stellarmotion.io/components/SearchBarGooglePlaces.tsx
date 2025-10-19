"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, Search, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

type Props = {
  defaultKeywords?: string;
  defaultLocation?: string;
  className?: string;
};

type PlaceSuggestion = {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
  displayName: string;
};

export default function SearchBarGooglePlaces({ 
  defaultKeywords = "", 
  defaultLocation = "", 
  className = "" 
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [location, setLocation] = useState(defaultLocation);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const lastRequestTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Places services
  useEffect(() => {
    if (googleMapsLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, [googleMapsLoaded]);

  // Update local state when props change
  useEffect(() => {
    setKeywords(defaultKeywords);
    setLocation(defaultLocation);
  }, [defaultKeywords, defaultLocation]);

  // Read URL parameters and update state (only when URL changes, not when user types)
  useEffect(() => {
    const urlKeywords = searchParams.get('q') || searchParams.get('keywords') || '';
    const urlLocation = searchParams.get('loc') || searchParams.get('location') || '';
    
    // Only update if we have URL params and they're different from current state
    if (urlKeywords && urlKeywords !== keywords) {
      setKeywords(urlKeywords);
    }
    if (urlLocation && urlLocation !== location) {
      setLocation(urlLocation);
    }
  }, [searchParams]); // Removed keywords and location from dependencies

  // Force focus to stay on input when suggestions are shown
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const interval = setInterval(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [showSuggestions]);

  // Fetch location suggestions when location text changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (location.length > 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(location);
      }, 500); // Increased debounce to 500ms
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location]);

  const fetchSuggestions = async (query: string) => {
    // Rate limiting: ensure at least 500ms between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < 500) {
      const waitTime = 500 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    setIsLoadingSuggestions(true);
    lastRequestTime.current = Date.now();
    
    // Try Google Places first if available
    if (autocompleteService.current) {
      try {
        const request: google.maps.places.AutocompleteRequest = {
          input: query,
          types: ['(cities)'], // Focus on cities
          componentRestrictions: { country: ['es', 'bo', 'ar', 'cl', 'pe', 'co', 'mx', 'us'] }, // Spanish-speaking countries
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions: PlaceSuggestion[] = predictions.map((prediction) => ({
              placeId: prediction.place_id,
              label: prediction.description,
              lat: 0, // Will be filled when selected
              lng: 0, // Will be filled when selected
              displayName: prediction.description
            }));
            
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
            setIsLoadingSuggestions(false);
          } else {
            // Fallback to Photon if Google Places fails
            console.warn('Google Places API failed, using Photon fallback:', status);
            fetchSuggestionsWithPhoton(query);
          }
        });
      } catch (error) {
        console.error('Error fetching Google Places suggestions:', error);
        // Fallback to Photon
        fetchSuggestionsWithPhoton(query);
      }
    } else {
      // Use Photon directly if Google Places is not available
      fetchSuggestionsWithPhoton(query);
    }
  };

  const fetchSuggestionsWithPhoton = async (query: string) => {
    try {
      const response = await fetch(`https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      const suggestions: PlaceSuggestion[] = data.features
        .filter((feature: any) => 
          feature.properties.type === 'city' || 
          feature.properties.type === 'town' || 
          feature.properties.type === 'village' ||
          feature.properties.type === 'municipality'
        )
        .slice(0, 8) // Limit to 8 results
        .map((feature: any) => {
          const name = feature.properties.name;
          const state = feature.properties.state;
          const country = feature.properties.country;
          
          let displayName = name;
          if (state && state !== name) {
            displayName += `, ${state}`;
          }
          if (country && country !== 'ES' && country !== 'BO' && country !== 'AR' && country !== 'CL' && country !== 'PE' && country !== 'CO' && country !== 'MX' && country !== 'US') {
            displayName += `, ${country}`;
          }
          
          return {
            placeId: `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`,
            label: displayName,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            displayName: displayName
          };
        });
      
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching Photon suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getPlaceDetails = (placeId: string): Promise<google.maps.places.PlaceResult> => {
    return new Promise((resolve, reject) => {
      if (!placesService.current) {
        reject(new Error('PlacesService not initialized'));
        return;
      }

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['geometry', 'name', 'formatted_address']
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`PlacesService error: ${status}`));
        }
      });
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qs = new URLSearchParams();
    if (keywords.trim()) qs.set("keywords", keywords.trim());
    if (location.trim()) qs.set("location", location.trim());
    
    // Check if we have stored coordinates from location selection
    const storedLocation = sessionStorage.getItem('selectedLocation');
    if (storedLocation) {
      try {
        const locationData = JSON.parse(storedLocation);
        if (locationData.lat && locationData.lng) {
          qs.set("lat", String(locationData.lat));
          qs.set("lng", String(locationData.lng));
        }
      } catch (error) {
        console.error('Error parsing stored location for URL:', error);
      }
    }
    
    const queryString = qs.toString();
    const url = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
    
    console.log("Navigating to:", url);
    router.push(url);
  };

  const useMyLocation = async () => {
    console.log("useMyLocation called, googleMapsLoaded:", googleMapsLoaded);
    
    if (!navigator.geolocation) {
      alert("Geolocalización no está disponible en tu navegador");
      return;
    }
    
    if (!googleMapsLoaded) {
      alert("Google Maps no está cargado aún. Espera un momento e inténtalo de nuevo.");
      return;
    }
    
    setLoadingLoc(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      // Use Google Geocoding for reverse geocoding
      if (window.google && window.google.maps) {
        console.log("Using Google Geocoding for reverse geocoding");
        const geocoder = new window.google.maps.Geocoder();
        
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode(
            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
            (results, status) => {
              console.log("Geocoding result:", { status, results: results?.length });
              if (status === window.google.maps.GeocoderStatus.OK && results) {
                resolve(results);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            }
          );
        });

        if (result && result.length > 0) {
          const place = result[0];
          const label = place.formatted_address;
          setLocation(label);
          setShowSuggestions(false);
          setSuggestions([]);
          
          // Store coordinates for the map to use
          if (typeof window !== 'undefined') {
            const locationData = {
              label,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            sessionStorage.setItem('selectedLocation', JSON.stringify(locationData));
            
            // Dispatch custom event for immediate update
            console.log('Dispatching locationSelected event (my location):', locationData);
            window.dispatchEvent(new CustomEvent('locationSelected', { 
              detail: locationData 
            }));
          }
          
          // Don't navigate automatically - just set the location in the input
          console.log("Location set in input:", label);
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
      if (error instanceof Error) {
        if (error.message.includes("Geocoding failed")) {
          alert("Error al obtener la dirección. Inténtalo de nuevo.");
        } else if (error.message.includes("timeout")) {
          alert("Tiempo de espera agotado. Inténtalo de nuevo.");
        } else {
          alert("Error al obtener tu ubicación. Verifica que tengas permisos de ubicación.");
        }
      } else {
        alert("Error al obtener tu ubicación. Verifica que tengas permisos de ubicación.");
      }
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setLocation(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    let lat = suggestion.lat;
    let lng = suggestion.lng;
    
    // If coordinates are not available (Google Places), try to get them
    if ((lat === 0 && lng === 0) && suggestion.placeId && !suggestion.placeId.includes(',')) {
      try {
        // Get place details to get coordinates
        const placeDetails = await getPlaceDetails(suggestion.placeId);
        
        if (placeDetails.geometry?.location) {
          lat = placeDetails.geometry.location.lat();
          lng = placeDetails.geometry.location.lng();
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    } else if (suggestion.placeId.includes(',')) {
      // Photon coordinates are in placeId as "lat,lng"
      const coords = suggestion.placeId.split(',');
      lat = parseFloat(coords[0]);
      lng = parseFloat(coords[1]);
    }
    
    // Store coordinates for the map to use
    if (typeof window !== 'undefined' && lat !== 0 && lng !== 0) {
      const locationData = {
        label: suggestion.displayName,
        lat: lat,
        lng: lng
      };
      sessionStorage.setItem('selectedLocation', JSON.stringify(locationData));
      
      // Dispatch custom event for immediate update
      console.log('Dispatching locationSelected event:', locationData);
      window.dispatchEvent(new CustomEvent('locationSelected', { 
        detail: locationData 
      }));
    }
    
    // Don't navigate automatically - just set the location in the input
    console.log("Location set in input:", suggestion.displayName);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    // Clear stored location when user types
    if (typeof window !== 'undefined' && sessionStorage.getItem('selectedLocation')) {
      sessionStorage.removeItem('selectedLocation');
    }
    
    // Force focus to stay on input
    setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleLocationFocus = () => {
    if (location.length > 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleLocationBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  return (
    <form onSubmit={onSubmit} className={`w-full ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Palabras clave */}
          <div className="flex-1">
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Palabras clave"
              className="h-12 text-base border-0 focus:ring-0 bg-gray-50"
            />
          </div>

          {/* Ubicación con Google Places Autocomplete */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              ref={inputRef}
              value={location}
              onChange={handleLocationChange}
              onFocus={handleLocationFocus}
              onBlur={handleLocationBlur}
              placeholder="Ubicación (ciudad o país)"
              className="h-12 text-base border-0 focus:ring-0 bg-gray-50 pl-10 pr-12"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="loc-listbox"
              disabled={isLoadingSuggestions}
              autoComplete="off"
            />
            {isLoadingSuggestions && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e94446]"></div>
              </div>
            )}
            <button
              type="button"
              onClick={useMyLocation}
              disabled={loadingLoc || !googleMapsLoaded}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Usar mi ubicación"
              aria-label="Usar mi ubicación"
            >
              <Crosshair className={`w-5 h-5 ${loadingLoc ? 'animate-spin' : ''}`} />
            </button>

            {/* Google Places Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="loc-listbox"
                role="listbox"
                className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-auto"
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s.placeId}
                    role="option"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectSuggestion(s);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }
                    }}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                    {s.displayName}
                  </li>
                ))}
              </ul>
            )}
            
            {/* No results message */}
            {showSuggestions && suggestions.length === 0 && !isLoadingSuggestions && location.length > 2 && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg p-3 text-sm text-gray-500">
                No se encontraron coincidencias
              </div>
            )}
          </div>

          {/* Botón buscar */}
          <Button
            type="submit"
            variant="brand"
            className="h-12 px-6 rounded-full flex-shrink-0 gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </Button>
        </div>
      </div>
    </form>
  );
}
