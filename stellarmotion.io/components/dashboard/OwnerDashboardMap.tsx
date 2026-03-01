'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Activity } from 'lucide-react';

export type MapFilter = 'all' | 'disponibles' | 'ocupados' | 'alto-rendimiento';

export interface SoporteMapItem {
  id: string;
  title?: string;
  city?: string;
  lat: number | null;
  lng: number | null;
  status?: string;
  pricePerMonth?: number | null;
  nextAvailability?: string | null;
}

interface OwnerDashboardMapProps {
  soportes: SoporteMapItem[];
  /** Soportes activos = ocupados + reservados */
  activosCount: number;
  /** 0-100 */
  ocupacionPercent: number;
  ingresosMes: number;
  solicitudesNuevas: number;
  className?: string;
}

const STATUS_PIN_COLOR: Record<string, string> = {
  OCUPADO: '#e94446',
  RESERVADO: '#e94446',
  DISPONIBLE: '#22c55e',
  MANTENIMIENTO: '#eab308',
};

function getPinColor(status: string | undefined): string {
  if (!status) return STATUS_PIN_COLOR.DISPONIBLE;
  const u = status.toUpperCase();
  return STATUS_PIN_COLOR[u] ?? '#94a3b8';
}

function createPinSvgUrl(fillHex: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <path fill="${fillHex}" stroke="#fff" stroke-width="2" d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"/>
      <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export default function OwnerDashboardMap({
  soportes,
  activosCount,
  ocupacionPercent,
  ingresosMes,
  solicitudesNuevas,
  className = '',
}: OwnerDashboardMapProps) {
  const { isLoaded: googleMapsLoaded } = useGoogleMaps();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [filter, setFilter] = useState<MapFilter>('all');

  const pointsWithCoords = useMemo(
    () => soportes.filter((s): s is SoporteMapItem & { lat: number; lng: number } => 
      s.lat != null && s.lng != null && Number.isFinite(s.lat) && Number.isFinite(s.lng)
    ),
    [soportes]
  );

  const filteredPoints = useMemo(() => {
    if (filter === 'all') return pointsWithCoords;
    if (filter === 'disponibles') return pointsWithCoords.filter((p) => (p.status || '').toUpperCase() === 'DISPONIBLE');
    if (filter === 'ocupados') return pointsWithCoords.filter((p) => ['OCUPADO', 'RESERVADO'].includes((p.status || '').toUpperCase()));
    if (filter === 'alto-rendimiento') {
      // Alto rendimiento: ocupados con precio > mediana (o top 50% por precio)
      const ocupados = pointsWithCoords.filter((p) => ['OCUPADO', 'RESERVADO'].includes((p.status || '').toUpperCase()));
      if (ocupados.length === 0) return [];
      const precios = ocupados.map((p) => p.pricePerMonth ?? 0).filter(Boolean);
      const mediana = precios.length ? [...precios].sort((a, b) => b - a)[Math.floor(precios.length / 2)] : 0;
      return ocupados.filter((p) => (p.pricePerMonth ?? 0) >= mediana);
    }
    return pointsWithCoords;
  }, [pointsWithCoords, filter]);

  // Init map and markers
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainer.current || typeof window === 'undefined' || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapContainer.current, {
      center: { lat: 40.4168, lng: -3.7038 },
      zoom: 6,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      ],
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [googleMapsLoaded]);

  // Update markers when filtered points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (filteredPoints.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    filteredPoints.forEach((point) => {
      const color = getPinColor(point.status);
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map,
        title: point.title || 'Soporte',
        icon: {
          url: createPinSvgUrl(color),
          scaledSize: new window.google.maps.Size(28, 38),
          anchor: new window.google.maps.Point(14, 38),
        },
      });

      const priceStr = point.pricePerMonth != null
        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(point.pricePerMonth)
        : '—';
      const estadoStr = point.status === 'OCUPADO' ? 'Ocupado' : point.status === 'RESERVADO' ? 'Reservado' : point.status === 'DISPONIBLE' ? 'Disponible' : point.status || '—';

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="min-width: 200px; padding: 4px 0; font-family: system-ui, sans-serif;">
            <div style="font-weight: 600; color: #111; margin-bottom: 6px;">${(point.title || 'Soporte').replace(/</g, '&lt;')}</div>
            <div style="font-size: 13px; color: #555;">${(point.city || '—').replace(/</g, '&lt;')}</div>
            <div style="font-size: 13px; color: #555; margin-top: 4px;">Precio: ${priceStr}/mes</div>
            <div style="font-size: 13px; margin-top: 4px;"><span style="font-weight: 500;">Estado:</span> ${estadoStr}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Próx. disponibilidad: ${(point.nextAvailability || '—').replace(/</g, '&lt;')}</div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: point.lat, lng: point.lng });
    });

    if (filteredPoints.length > 1) {
      map.fitBounds(bounds, { top: 24, right: 24, bottom: 24, left: 24 });
    } else if (filteredPoints.length === 1) {
      map.setCenter({ lat: filteredPoints[0].lat, lng: filteredPoints[0].lng });
      map.setZoom(14);
    }
  }, [filteredPoints]);

  const chips: { id: MapFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'disponibles', label: 'Disponibles' },
    { id: 'ocupados', label: 'Ocupados' },
    { id: 'alto-rendimiento', label: 'Alto rendimiento' },
  ];

  const formatEur = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <section className={className} aria-labelledby="dashboard-map-heading">
      <h2 id="dashboard-map-heading" className="sr-only">
        Mapa de soportes
      </h2>
      <div className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        {/* Filter chips - top left of map */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${filter === c.id
                  ? 'bg-[#e94446] text-white shadow-md'
                  : 'bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'}
              `}
              aria-pressed={filter === c.id}
              aria-label={`Filtrar: ${c.label}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div
          ref={mapContainer}
          className="w-full h-[380px] min-h-[320px]"
          aria-hidden="true"
        />

        {!googleMapsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94446] border-t-transparent" aria-hidden="true" />
          </div>
        )}

        {googleMapsLoaded && pointsWithCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <div className="text-center px-4 py-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm max-w-sm">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sin soportes en el mapa</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Añade ubicación a tus soportes para verlos aquí</p>
            </div>
          </div>
        )}

        {/* Live Status overlay - left side */}
        <div className="absolute left-3 bottom-3 top-auto z-10 w-full max-w-[240px]">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Activity className="h-4 w-4 text-[#e94446]" aria-hidden="true" />
              Live Status
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Soportes activos</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-white">{activosCount}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Ocupación</dt>
                <dd className="font-semibold tabular-nums text-[#e94446]">{ocupacionPercent}%</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Ingresos (mes)</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-white">{formatEur(ingresosMes)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Solicitudes nuevas</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-white">{solicitudesNuevas}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
