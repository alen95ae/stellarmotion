/**
 * MapViewer.js - Reemplazo libre de Google Maps usando MapLibre GL JS
 * 
 * Este archivo reemplaza la dependencia de Google Maps por una implementación
 * 100% libre usando MapLibre GL JS, OpenStreetMap y Esri World Imagery.
 * 
 * API compatible con la implementación anterior de map-viewer.js
 */

class MapViewer {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      lat: -16.5000,
      lng: -68.1500,
      zoom: 13,
      points: [],
      height: '500px',
      width: '100%',
      style: 'streets',
      showControls: true,
      enableClustering: true,
      ...options
    };
    
    this.map = null;
    this.markers = [];
    this.cluster = null;
    this.isLoaded = false;
    this.error = null;
    this.currentStyle = this.options.style;
    
    this.init();
  }

  async init() {
    try {
      // Cargar MapLibre GL JS dinámicamente
      await this.loadMapLibre();
      
      // Crear el mapa
      this.createMap();
      
      // Configurar eventos
      this.setupEvents();
      
      // Añadir marcadores si existen
      if (this.options.points && this.options.points.length > 0) {
        this.addMarkers(this.options.points);
      }
      
    } catch (error) {
      console.error('Error initializing MapViewer:', error);
      this.showError('Error al cargar el mapa');
    }
  }

  async loadMapLibre() {
    return new Promise((resolve, reject) => {
      // Verificar si MapLibre ya está cargado
      if (window.maplibregl) {
        resolve();
        return;
      }

      // Cargar CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(cssLink);

      // Cargar JavaScript
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => {
        // Cargar Supercluster para clustering
        this.loadSupercluster().then(resolve).catch(reject);
      };
      script.onerror = () => reject(new Error('Failed to load MapLibre GL JS'));
      document.head.appendChild(script);
    });
  }

  async loadSupercluster() {
    return new Promise((resolve, reject) => {
      if (window.Supercluster) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/supercluster@8.0.1/dist/supercluster.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Supercluster'));
      document.head.appendChild(script);
    });
  }

  createMap() {
    if (!this.container) {
      throw new Error('Map container not found');
    }

    // Obtener la clave de MapTiler del entorno (si está disponible)
    const maptilerKey = window.MAPTILER_KEY || null;

    // Definir estilos de mapa
    const mapStyles = this.getMapStyles(maptilerKey);

    // Crear el mapa
    this.map = new maplibregl.Map({
      container: this.container,
      style: mapStyles[this.currentStyle],
      center: [this.options.lng, this.options.lat],
      zoom: this.options.zoom,
      attributionControl: true,
      logoPosition: 'bottom-right'
    });

    // Configurar atribuciones
    if (this.map.attributionControl) {
      this.map.attributionControl.addAttribution(
        this.currentStyle === 'satellite' 
          ? 'Imagery © Esri' 
          : 'Map data © OpenStreetMap contributors'
      );
    }

    // Eventos del mapa
    this.map.on('load', () => {
      this.isLoaded = true;
      this.error = null;
      this.hideLoading();
    });

    this.map.on('error', (e) => {
      console.error('Map error:', e);
      this.showError('Error al cargar el mapa');
    });
  }

  getMapStyles(maptilerKey) {
    return {
      streets: maptilerKey 
        ? `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`
        : {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: 'Map data © OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19
              }
            ]
          },
      satellite: {
        version: 8,
        sources: {
          'esri-imagery': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Imagery © Esri'
          }
        },
        layers: [
          {
            id: 'esri-imagery',
            type: 'raster',
            source: 'esri-imagery',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      hybrid: maptilerKey
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerKey}`
        : {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: 'Map data © OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19
              }
            ]
          }
    };
  }

  setupEvents() {
    if (!this.map) return;

    // Click en el mapa
    this.map.on('click', (e) => {
      if (this.options.onMapClick) {
        this.options.onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    });
  }

  addMarkers(points) {
    if (!this.map || !this.isLoaded) return;

    // Limpiar marcadores existentes
    this.clearMarkers();

    if (!points || points.length === 0) return;

    try {
      if (this.options.enableClustering && points.length > 10) {
        this.addClusteredMarkers(points);
      } else {
        this.addIndividualMarkers(points);
      }
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }

  addIndividualMarkers(points) {
    points.forEach(point => {
      const marker = new maplibregl.Marker({
        element: this.createMarkerElement(point)
      })
        .setLngLat([point.lng, point.lat])
        .addTo(this.map);

      if (this.options.onMarkerClick) {
        marker.getElement().addEventListener('click', () => {
          this.options.onMarkerClick(point);
        });
      }

      this.markers.push(marker);
    });
  }

  addClusteredMarkers(points) {
    // Inicializar clustering
    this.cluster = new Supercluster({
      radius: 40,
      maxZoom: 16,
      minZoom: 0
    });

    const clusterPoints = points.map(point => ({
      type: 'Feature',
      properties: { ...point },
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      }
    }));

    this.cluster.load(clusterPoints);
    const clusters = this.cluster.getClusters([-180, -85, 180, 85], this.map.getZoom());

    clusters.forEach(cluster => {
      if (cluster.properties.cluster) {
        // Crear marcador de cluster
        const marker = new maplibregl.Marker({
          element: this.createClusterElement(cluster.properties.point_count)
        })
          .setLngLat(cluster.geometry.coordinates)
          .addTo(this.map);

        marker.getElement().addEventListener('click', () => {
          const expansionZoom = this.cluster.getClusterExpansionZoom(cluster.id);
          this.map.easeTo({
            center: cluster.geometry.coordinates,
            zoom: expansionZoom
          });
        });

        this.markers.push(marker);
      } else {
        // Crear marcador individual
        const point = cluster.properties;
        const marker = new maplibregl.Marker({
          element: this.createMarkerElement(point)
        })
          .setLngLat([point.lng, point.lat])
          .addTo(this.map);

        if (this.options.onMarkerClick) {
          marker.getElement().addEventListener('click', () => {
            this.options.onMarkerClick(point);
          });
        }

        this.markers.push(marker);
      }
    });
  }

  createMarkerElement(point) {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      transition: transform 0.2s;
    `;

    el.innerHTML = '📍';
    el.title = point.title || 'Marcador';

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });

    return el;
  }

  createClusterElement(count) {
    const el = document.createElement('div');
    el.className = 'map-cluster';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      transition: transform 0.2s;
    `;

    el.textContent = count.toString();
    el.title = `${count} marcadores`;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });

    return el;
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  // Métodos públicos para compatibilidad con API anterior
  setCenter(lat, lng) {
    if (this.map) {
      this.map.setCenter([lng, lat]);
    }
  }

  setZoom(zoom) {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  setPoints(points) {
    this.options.points = points;
    this.addMarkers(points);
  }

  changeStyle(style) {
    if (!this.map) return;
    
    this.currentStyle = style;
    const mapStyles = this.getMapStyles(window.MAPTILER_KEY || null);
    this.map.setStyle(mapStyles[style]);
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  locateUser() {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.map) {
          this.map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener la ubicación');
      }
    );
  }

  toggleFullscreen() {
    if (!this.container) return;

    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  showError(message) {
    this.error = message;
    if (this.container) {
      this.container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f3f4f6;
          color: #dc2626;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <p style="margin-bottom: 8px; font-weight: 600;">Error al cargar el mapa</p>
            <p style="font-size: 14px; color: #6b7280;">${message}</p>
          </div>
        </div>
      `;
    }
  }

  hideLoading() {
    const loadingEl = this.container.querySelector('.map-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.clearMarkers();
  }
}

// Función de inicialización global para compatibilidad
window.initMapViewer = function(container, options) {
  return new MapViewer(container, options);
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapViewer;
}

// Auto-inicialización si se encuentra un elemento con data-map-viewer
document.addEventListener('DOMContentLoaded', function() {
  const mapElements = document.querySelectorAll('[data-map-viewer]');
  mapElements.forEach(element => {
    const options = {
      lat: parseFloat(element.dataset.lat) || -16.5000,
      lng: parseFloat(element.dataset.lng) || -68.1500,
      zoom: parseInt(element.dataset.zoom) || 13,
      style: element.dataset.style || 'streets',
      showControls: element.dataset.showControls !== 'false',
      enableClustering: element.dataset.enableClustering !== 'false'
    };

    // Parsear puntos si están en data-points
    if (element.dataset.points) {
      try {
        options.points = JSON.parse(element.dataset.points);
      } catch (e) {
        console.error('Error parsing points:', e);
      }
    }

    new MapViewer(element, options);
  });
});
