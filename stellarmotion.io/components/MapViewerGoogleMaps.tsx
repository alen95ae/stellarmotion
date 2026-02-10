"use client";
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  price?: number; // Precio para mostrar en óvalo rojo
  [key: string]: any;
}

export interface MapViewerGoogleMapsProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  points?: MapPoint[];
  route?: { lat: number; lng: number }[]; // Recorrido para publicidad móvil
  circle?: { lat: number; lng: number; radius: number }; // Círculo con radio (metros)
  polygon?: { lat: number; lng: number }[]; // Polígono de área
  editablePolygon?: boolean; // Permitir editar el polígono
  useCategoryIcons?: boolean; // Usar iconos de categorías en lugar de marcadores estándar
  showPrices?: boolean; // Mostrar precios en óvalos rojos estilo Airbnb
  circuits?: Array<{ id: string; name: string; points: MapPoint[] }>; // Circuitos/lotes de soportes
  height?: string | number;
  width?: string | number;
  className?: string;
  style?: "streets" | "satellite" | "hybrid";
  showControls?: boolean;
  enableClustering?: boolean;
  onMarkerClick?: (point: MapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onPolygonChange?: (path: { lat: number; lng: number }[]) => void;
  searchLocation?: { lat: number; lng: number; label?: string; types?: string[] } | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewerGoogleMaps({
  lat = 40.4637,
  lng = -3.7492,
  zoom = 6,
  points = [],
  route = [],
  circle,
  polygon,
  editablePolygon = false,
  useCategoryIcons = false,
  showPrices = false,
  circuits = [],
  height = "500px",
  width = "100%",
  className = "",
  style = "streets",
  showControls = true,
  enableClustering = false,
  onMarkerClick,
  onMapClick,
  onPolygonChange,
  searchLocation = null,
}: MapViewerGoogleMapsProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polyline = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const drawingManager = useRef<any>(null);
  const markerCluster = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState(style);
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const [isMapReady, setIsMapReady] = useState(false);

  // Function to get zoom level based on Google Places type
  const getZoomFromGooglePlaceType = (placeType: string | null): number => {
    if (!placeType) return 12; // Default zoom for cities
    
    switch (placeType) {
      case 'country':
        return 6; // Countries - very wide view
      case 'administrative_area_level_1':
        return 8; // States/regions - wide view
      case 'locality':
        return 12; // Cities - Madrid, Barcelona, New York
      case 'sublocality':
        return 13; // Neighborhoods/districts
      case 'postal_town':
        return 14; // Small towns - Zamora
      case 'route':
      case 'street_address':
        return 16; // Streets - very close view
      default:
        return 12; // Default for cities
    }
  };

  // Convertir estilo a tipo de mapa de Google
  const getGoogleMapType = (style: string) => {
    switch (style) {
      case 'streets':
        return 'roadmap';
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      default:
        return 'roadmap';
    }
  };

  // Inicializar Google Maps
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current || map.current) return;

    const initializeMap = () => {
      if (!window.google || !mapContainer.current) return;

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat, lng },
        zoom: zoom,
        mapTypeId: getGoogleMapType(mapStyle),
        zoomControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        mapTypeControl: showControls,
        scrollwheel: true, // Habilitar zoom con rueda del mouse
        gestureHandling: 'auto', // Permitir gestos táctiles y mouse
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
      });

      // Eventos
      window.google.maps.event.addListener(map.current, 'click', (event: any) => {
        if (onMapClick) {
          onMapClick(event.latLng.lat(), event.latLng.lng());
        }
      });

      window.google.maps.event.addListener(map.current, 'tilesloaded', () => {
        console.log('MapViewerGoogleMaps - Map tiles loaded, map is ready');
        setIsMapReady(true);
      });
    };

    initializeMap();

    return () => {
      if (map.current) {
        window.google.maps.event.clearInstanceListeners(map.current);
        map.current = null;
      }
    };
  }, [googleMapsLoaded]);

  // Función para obtener icono de categoría
  const getCategoryIcon = (categoryType?: string) => {
    if (!categoryType) return null;
    
    const categoryMap: Record<string, string> = {
      valla: '/icons/vallas.svg',
      vallas: '/icons/vallas.svg',
      pantalla: '/icons/pantallas.svg',
      pantallas: '/icons/pantallas.svg',
      led: '/icons/pantallas.svg',
      mural: '/icons/murales.svg',
      murales: '/icons/murales.svg',
      mupi: '/icons/mupis.svg',
      mupis: '/icons/mupis.svg',
      parada: '/icons/parada-bus.svg',
      paradas: '/icons/parada-bus.svg',
      display: '/icons/displays.svg',
      displays: '/icons/displays.svg',
      letrero: '/icons/letreros.svg',
      letreros: '/icons/letreros.svg',
      cartelera: '/icons/carteleras.svg',
      carteleras: '/icons/carteleras.svg',
    };
    
    const iconPath = categoryMap[categoryType.toLowerCase()] || '/icons/vallas.svg';
    return {
      url: iconPath,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40)
    };
  };

  // Función para crear icono con precio en rectángulo redondeado (estilo Airbnb)
  const createPriceIcon = (price: number) => {
    const formattedPrice = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    // Crear un canvas para el icono
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Tamaño del canvas (más ancho para acomodar el precio)
    const padding = 12;
    ctx.font = 'bold 14px Arial';
    const textMetrics = ctx.measureText(formattedPrice);
    const textWidth = textMetrics.width;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = 28;
    const borderRadius = 20; // Esquinas redondeadas, menos ovalado
    
    canvas.width = rectWidth;
    canvas.height = rectHeight;

    // Sombra sutil para profundidad
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Fondo rojo del rectángulo redondeado (#e94446)
    ctx.fillStyle = '#e94446';
    ctx.beginPath();
    // Dibujar rectángulo redondeado manualmente
    const x = 0;
    const y = 0;
    const w = rectWidth;
    const h = rectHeight;
    const r = borderRadius;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Borde blanco sutil
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Resetear sombra para el texto
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texto del precio en blanco
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formattedPrice, rectWidth / 2, rectHeight / 2);

    return {
      url: canvas.toDataURL(),
      scaledSize: new window.google.maps.Size(rectWidth, rectHeight),
      anchor: new window.google.maps.Point(rectWidth / 2, rectHeight)
    };
  };

  // Actualizar marcadores, recorridos, círculos, polígonos y circuitos
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Limpiar elementos existentes
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    if (markerCluster.current) {
      markerCluster.current.clearMarkers();
      markerCluster.current = null;
    }

    if (polyline.current) {
      polyline.current.setMap(null);
      polyline.current = null;
    }

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Si hay circuitos, dibujarlos
    if (circuits && circuits.length > 0) {
      circuits.forEach((circuit, circuitIndex) => {
        // Dibujar polyline para cada circuito
        if (circuit.points.length > 1) {
          const circuitPath = circuit.points.map(p => ({ lat: p.lat, lng: p.lng }));
          const circuitPolyline = new window.google.maps.Polyline({
            path: circuitPath,
            geodesic: true,
            strokeColor: circuitIndex === 0 ? '#e94446' : circuitIndex === 1 ? '#3b82f6' : '#10b981',
            strokeOpacity: 0.6,
            strokeWeight: 3,
            map: map.current,
          });
        }

        // Añadir marcadores para cada punto del circuito
        circuit.points.forEach((point, pointIndex) => {
          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map.current,
            title: `${circuit.name} - ${point.title || `Punto ${pointIndex + 1}`}`,
            label: {
              text: String(pointIndex + 1),
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: circuitIndex === 0 ? '#e94446' : circuitIndex === 1 ? '#3b82f6' : '#10b981',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${circuit.name}</h3>
                <p class="text-sm text-gray-600 mt-1">${point.title || `Punto ${pointIndex + 1}`}</p>
                ${point.description ? `<p class="text-sm text-gray-600">${point.description}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map.current, marker);
            if (onMarkerClick) {
              onMarkerClick(point);
            }
          });

          markers.current.push(marker);
        });
      });

      // Ajustar bounds para mostrar todos los circuitos
      const bounds = new window.google.maps.LatLngBounds();
      circuits.forEach(circuit => {
        circuit.points.forEach(point => {
          bounds.extend({ lat: point.lat, lng: point.lng });
        });
      });
      map.current.fitBounds(bounds);
    }
    // Si hay una ruta, dibujar el recorrido
    else if (route && route.length > 0) {
      const routePath = route.map(point => ({ lat: point.lat, lng: point.lng }));
      
      polyline.current = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#e94446',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map.current,
      });

      // Ajustar el mapa para mostrar toda la ruta
      const bounds = new window.google.maps.LatLngBounds();
      route.forEach(point => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });
      
      // Si también hay points definidos, usar esos para los marcadores
      if (points.length > 0) {
        // Usar los points para los marcadores (verde y rojo)
        points.forEach((point, index) => {
          let icon;
          if (points.length === 2) {
            // Si son solo 2 puntos, usar verde y rojo
            if (index === 0) {
              icon = {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              };
            } else {
              icon = {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              };
            }
          } else {
            icon = {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            };
          }

          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map.current,
            title: point.title || 'Marcador',
            icon: icon
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-gray-900">${point.title || 'Marcador'}</h3>
                ${point.description ? `<p class="text-sm text-gray-600 mt-1">${point.description}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map.current, marker);
            if (onMarkerClick) {
              onMarkerClick(point);
            }
          });

          markers.current.push(marker);
          bounds.extend({ lat: point.lat, lng: point.lng });
        });
      } else {
        // Si no hay points, usar la ruta para crear marcadores con etiquetas A, B, C, D...
        route.forEach((point, index) => {
          const label = String.fromCharCode(65 + index); // A, B, C, D...
          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map.current,
            title: `Punto ${label}`,
            label: {
              text: label,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: index === 0 ? '#10b981' : index === route.length - 1 ? '#e94446' : '#3b82f6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2
            }
          });
          markers.current.push(marker);
        });
      }
      
      map.current.fitBounds(bounds);
    }
    // Si hay un círculo, dibujarlo
    else if (circle) {
      circleRef.current = new window.google.maps.Circle({
        strokeColor: '#e94446',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#e94446',
        fillOpacity: 0.15,
        map: map.current,
        center: { lat: circle.lat, lng: circle.lng },
        radius: circle.radius, // en metros
      });

      // Ajustar zoom para mostrar el círculo
      const bounds = circleRef.current.getBounds();
      if (bounds) {
        map.current.fitBounds(bounds);
      }
    }
    // Si hay un polígono, dibujarlo
    else if (polygon && polygon.length > 0) {
      const polygonPath = polygon.map(p => ({ lat: p.lat, lng: p.lng }));
      
      polygonRef.current = new window.google.maps.Polygon({
        paths: polygonPath,
        strokeColor: '#e94446',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#e94446',
        fillOpacity: 0.15,
        editable: editablePolygon,
        draggable: editablePolygon,
        map: map.current,
      });

      // Si es editable, añadir listener para cambios
      if (editablePolygon && onPolygonChange) {
        polygonRef.current.addListener('set_at', () => {
          const path = polygonRef.current.getPath();
          const coordinates: { lat: number; lng: number }[] = [];
          path.forEach((latLng: any) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
          });
          onPolygonChange(coordinates);
        });

        polygonRef.current.addListener('insert_at', () => {
          const path = polygonRef.current.getPath();
          const coordinates: { lat: number; lng: number }[] = [];
          path.forEach((latLng: any) => {
            coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
          });
          onPolygonChange(coordinates);
        });
      }

      // Ajustar bounds para mostrar el polígono
      const bounds = new window.google.maps.LatLngBounds();
      polygon.forEach(point => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });
      map.current.fitBounds(bounds);
    }
    // Añadir marcadores normales
    else if (points.length > 0) {
      // Limpiar cluster anterior si existe
      if (markerCluster.current) {
        markerCluster.current.clearMarkers();
        markerCluster.current = null;
      }

      points.forEach((point, index) => {
        let icon;
        
        // Si son solo 2 puntos y no se usan iconos de categoría, usar verde y rojo
        if (points.length === 2 && !useCategoryIcons && !route.length) {
          if (index === 0) {
            // Primer punto: verde (inicio)
            icon = {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            };
          } else {
            // Segundo punto: rojo (fin)
            icon = {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            };
          }
        } else {
          // Comportamiento normal
          if (showPrices && point.price !== undefined) {
            // Mostrar precio en óvalo rojo
            icon = createPriceIcon(point.price);
            if (!icon) {
              // Fallback si no se puede crear el icono
              icon = {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              };
            }
          } else if (useCategoryIcons && point.type) {
            // Usar iconos de categoría
            icon = getCategoryIcon(point.type);
          } else {
            // Marcador estándar rojo
            icon = {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            };
          }
        }

        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: enableClustering ? null : map.current, // Si hay clustering, no añadir directamente al mapa
          title: point.title || 'Marcador',
          icon: icon
        });

        // Popup con información
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${point.title || 'Marcador'}</h3>
              ${point.description ? `<p class="text-sm text-gray-600 mt-1">${point.description}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map.current, marker);
          if (onMarkerClick) {
            onMarkerClick(point);
          }
        });

        markers.current.push(marker);
      });

      // Si está habilitado el clustering, usar MarkerClusterer
      if (enableClustering && markers.current.length > 0) {
        // Intentar cargar MarkerClusterer si no está disponible
        const loadClusterer = () => {
          // Verificar diferentes formas en que puede estar disponible la librería
          let MarkerClusterer: any = null;
          
          if ((window as any).markerClusterer) {
            MarkerClusterer = (window as any).markerClusterer.MarkerClusterer || (window as any).markerClusterer;
          } else if ((window as any).MarkerClusterer) {
            MarkerClusterer = (window as any).MarkerClusterer;
          }

          if (MarkerClusterer && typeof MarkerClusterer === 'function') {
            try {
              // Crear renderer personalizado para círculos rojos con números
              const renderer = {
                render: ({ count, position }: any) => {
                  const size = Math.min(20 + count * 2, 50);
                  return new window.google.maps.Marker({
                    position,
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: size / 2,
                      fillColor: '#e94446',
                      fillOpacity: 0.8,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    },
                    label: {
                      text: String(count),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: count > 9 ? '14px' : '12px'
                    },
                    zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
                  });
                }
              };

              // Usar la API moderna de MarkerClusterer
              markerCluster.current = new MarkerClusterer({
                map: map.current,
                markers: markers.current,
                renderer: renderer
              });
              return true;
            } catch (error) {
              console.error('Error creating MarkerClusterer:', error);
              // Si falla, mostrar marcadores normalmente
              markers.current.forEach(marker => marker.setMap(map.current));
              return false;
            }
          }
          return false;
        };

        // Intentar cargar inmediatamente
        if (!loadClusterer()) {
          // Si no está disponible, esperar un poco y reintentar
          setTimeout(() => {
            if (!loadClusterer()) {
              // Si aún no está disponible, mostrar marcadores normalmente
              markers.current.forEach(marker => marker.setMap(map.current));
            }
          }, 1000);
        }
      }

      // Ajustar bounds para mostrar todos los marcadores
      if (points.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach(point => {
          bounds.extend({ lat: point.lat, lng: point.lng });
        });
        map.current.fitBounds(bounds);
      } else if (points.length === 1) {
        // Un solo punto: centrar y respetar el zoom del prop (no usar fitBounds que sobreescribe el zoom)
        map.current.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.current.setZoom(zoom);
      }
    }
  }, [points, route, circle, polygon, editablePolygon, useCategoryIcons, showPrices, circuits, enableClustering, isMapReady, onMarkerClick, onPolygonChange]);

  // Centrar el mapa y ajustar zoom cuando cambie la ubicación de búsqueda
  useEffect(() => {
    console.log('MapViewerGoogleMaps - searchLocation effect triggered:', { searchLocation, mapReady: !!map.current });
    if (!map.current || !searchLocation) {
      console.log('MapViewerGoogleMaps - Skipping centering:', { hasMap: !!map.current, hasSearchLocation: !!searchLocation });
      return;
    }
    
    console.log('Centering map to search location:', searchLocation);
    map.current.setCenter({ lat: searchLocation.lat, lng: searchLocation.lng });
    
    // Aplicar zoom inteligente basado en el tipo de lugar
    if (searchLocation.types && searchLocation.types.length > 0) {
      const zoomLevel = getZoomFromGooglePlaceType(searchLocation.types[0]);
      console.log('Applying intelligent zoom:', { type: searchLocation.types[0], zoom: zoomLevel });
      map.current.setZoom(zoomLevel);
    } else {
      // Si no hay tipos, usar zoom por defecto para ciudades
      console.log('No types available, using default zoom 12');
      map.current.setZoom(12);
    }
  }, [searchLocation]);

  // Cambiar estilo del mapa
  const handleStyleChange = (newStyle: "streets" | "satellite" | "hybrid") => {
    if (!map.current) return;
    
    setMapStyle(newStyle);
    map.current.setMapTypeId(getGoogleMapType(newStyle));
  };

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer}
        className="w-full h-full rounded-xl overflow-hidden" 
        style={{ minHeight: "300px" }}
      />

      {/* Solo controles nativos de Google Maps */}

      {/* Loading indicator */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Cargando Google Maps...</div>
        </div>
      )}
    </div>
  );
}
