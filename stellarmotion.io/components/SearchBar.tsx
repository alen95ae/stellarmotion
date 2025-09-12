"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Search, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultKeywords?: string;
  defaultLocation?: string;
  className?: string;
};

type PlaceSuggestion = {
  placeId?: string;
  label: string;
  lat?: number;
  lng?: number;
  displayName: string;
};

export default function SearchBar({ defaultKeywords = "", defaultLocation = "", className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [location, setLocation] = useState(defaultLocation);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastRequestTime = useRef<number>(0);

  // Update local state when props change
  useEffect(() => {
    setKeywords(defaultKeywords);
    setLocation(defaultLocation);
  }, [defaultKeywords, defaultLocation]);

  // Fetch location suggestions when location text changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (location.length > 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(location);
      }, 300); // Debounce for 300ms
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

  // Debug effect to see suggestions state
  useEffect(() => {
    console.log("Suggestions state changed:", { suggestions, showSuggestions });
  }, [suggestions, showSuggestions]);

  const fetchSuggestions = async (query: string) => {
    // Rate limiting: ensure at least 1 second between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < 1000) {
      // Wait for the remaining time
      const waitTime = 1000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    setIsLoadingSuggestions(true);
    lastRequestTime.current = Date.now();
    
    try {
      console.log("🔍 Fetching OpenStreetMap suggestions for:", query);
      
      // Usar Nominatim API para buscar lugares con rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=bo,ar,cl,co,ec,py,pe,uy,ve`,
        {
          headers: {
            'User-Agent': 'StellarMotion/1.0 (https://stellarmotion.io)',
          },
        }
      );
      
      console.log("📡 Response status:", response.status, "ok:", response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ OpenStreetMap suggestions received:", data);
        
        const suggestions = data.map((item: any) => ({
          placeId: item.place_id,
          label: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name
        }));
        
        console.log("📊 Data type:", typeof suggestions, "Array?", Array.isArray(suggestions), "Length:", suggestions?.length);
        setSuggestions(suggestions);
        setShowSuggestions(true);
        console.log("🎯 State updated - suggestions:", suggestions, "showSuggestions: true");
      } else {
        console.warn("❌ Nominatim API error:", response.status, response.statusText);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("💥 Error fetching OpenStreetMap suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qs = new URLSearchParams();
    if (keywords.trim()) qs.set("keywords", keywords.trim());
    if (location.trim()) qs.set("location", location.trim());
    
    const queryString = qs.toString();
    const url = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
    
    console.log("Navigating to:", url);
    router.push(url);
  };

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no está disponible en tu navegador");
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

      // Rate limiting para reverse geocoding
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      
      if (timeSinceLastRequest < 1000) {
        const waitTime = 1000 - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      lastRequestTime.current = Date.now();

      // Usar Nominatim para obtener el nombre del lugar desde coordenadas
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'StellarMotion/1.0 (https://stellarmotion.io)',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data?.display_name) {
          setLocation(data.display_name);
          setShowSuggestions(false);
          setSuggestions([]);
          
          // Store coordinates for the map to use
          sessionStorage.setItem('selectedLocation', JSON.stringify({
            label: data.display_name,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          
          // If we're already on the search page, trigger a search
          if (pathname === '/buscar-un-espacio') {
            const qs = new URLSearchParams();
            if (keywords.trim()) qs.set("keywords", keywords.trim());
            qs.set("location", data.display_name);
            
            const queryString = qs.toString();
            const searchUrl = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
            
            console.log("Updating search page with location:", searchUrl);
            router.replace(searchUrl);
          } else {
            // Navigate to search page with the location
            const qs = new URLSearchParams();
            if (keywords.trim()) qs.set("keywords", keywords.trim());
            qs.set("location", data.display_name);
            
            const queryString = qs.toString();
            const searchUrl = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
            
            console.log("Navigating to search page with location:", searchUrl);
            router.push(searchUrl);
          }
        }
      } else {
        alert("No se pudo obtener la ubicación. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Error al obtener tu ubicación. Verifica que tengas permisos de ubicación.");
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setLocation(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Store coordinates for the map to use
    if (suggestion.lat && suggestion.lng) {
      sessionStorage.setItem('selectedLocation', JSON.stringify({
        label: suggestion.displayName,
        lat: suggestion.lat,
        lng: suggestion.lng
      }));
    }
    
    // If we're already on the search page, trigger a search
    if (pathname === '/buscar-un-espacio') {
      const qs = new URLSearchParams();
      if (keywords.trim()) qs.set("keywords", keywords.trim());
      qs.set("location", suggestion.displayName);
      
      const queryString = qs.toString();
      const searchUrl = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
      
      console.log("Updating search page with selected location:", searchUrl);
      router.replace(searchUrl);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
  
    
    // Clear stored location when user types
    if (sessionStorage.getItem('selectedLocation')) {
      sessionStorage.removeItem('selectedLocation');
    }
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
    }, 200);
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

          {/* Ubicación con icono + botón usar mi ubicación */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
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
            />
            {isLoadingSuggestions && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e94446]"></div>
              </div>
            )}
            <button
              type="button"
              onClick={useMyLocation}
              disabled={loadingLoc}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Usar mi ubicación"
              aria-label="Usar mi ubicación"
            >
              <Crosshair className={`w-5 h-5 ${loadingLoc ? 'animate-spin' : ''}`} />
            </button>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="loc-listbox"
                role="listbox"
                className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-auto"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s.placeId ?? `${s.lat},${s.lng},${i}`}
                    role="option"
                    tabIndex={0}
                    onClick={() => handleSelectSuggestion(s)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectSuggestion(s)}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                    {s.displayName}
                  </li>
                ))}
              </ul>
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
