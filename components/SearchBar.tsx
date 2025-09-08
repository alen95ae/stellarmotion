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
};

export default function SearchBar({ defaultKeywords = "", defaultLocation = "", className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [keywords, setKeywords] = useState(defaultKeywords);
  const [location, setLocation] = useState(defaultLocation);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

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
    try {
      console.log("🔍 Fetching suggestions for:", query);
      const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      console.log("📡 Response status:", response.status, "ok:", response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Suggestions received:", data);
        console.log("📊 Data type:", typeof data, "Array?", Array.isArray(data), "Length:", data?.length);
        setSuggestions(data);
        setShowSuggestions(true);
        console.log("🎯 State updated - suggestions:", data, "showSuggestions: true");
      } else {
        console.error("❌ Error fetching suggestions:", response.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("💥 Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
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

      const url = `/api/places?lat=${position.coords.latitude}&lng=${position.coords.longitude}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.label) {
          setLocation(data.label);
          setShowSuggestions(false);
          setSuggestions([]);
          
          // Store coordinates for the map to use
          sessionStorage.setItem('selectedLocation', JSON.stringify({
            label: data.label,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          
          // If we're already on the search page, trigger a search
          if (pathname === '/buscar-un-espacio') {
            const qs = new URLSearchParams();
            if (keywords.trim()) qs.set("keywords", keywords.trim());
            qs.set("location", data.label);
            
            const queryString = qs.toString();
            const searchUrl = queryString ? `/buscar-un-espacio?${queryString}` : "/buscar-un-espacio";
            
            console.log("Updating search page with location:", searchUrl);
            router.replace(searchUrl);
          } else {
            // Navigate to search page with the location
            const qs = new URLSearchParams();
            if (keywords.trim()) qs.set("keywords", keywords.trim());
            qs.set("location", data.label);
            
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
    setLocation(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Store coordinates for the map to use
    if (suggestion.lat && suggestion.lng) {
      sessionStorage.setItem('selectedLocation', JSON.stringify({
        label: suggestion.label,
        lat: suggestion.lat,
        lng: suggestion.lng
      }));
    }
    
    // If we're already on the search page, trigger a search
    if (pathname === '/buscar-un-espacio') {
      const qs = new URLSearchParams();
      if (keywords.trim()) qs.set("keywords", keywords.trim());
      qs.set("location", suggestion.label);
      
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
            />
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
                    {s.label}
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
