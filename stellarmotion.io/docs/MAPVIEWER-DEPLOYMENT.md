# 🗺️ MapViewer - Guía de Despliegue en Producción

## ✅ Implementación 100% Libre

Este documento describe cómo desplegar el nuevo MapViewer que reemplaza Google Maps por una solución completamente libre usando MapLibre GL JS, OpenStreetMap y Esri World Imagery.

## 📋 Archivos Modificados

### Nuevos Archivos Creados:
- `components/MapViewer.tsx` - Componente React con MapLibre GL JS
- `public/map-viewer.js` - Reemplazo del map-viewer.js original
- `public/map-viewer-example.html` - Ejemplo de uso
- `docs/MAPVIEWER-DEPLOYMENT.md` - Esta guía

### Dependencias Añadidas:
```json
{
  "maplibre-gl": "^3.6.2",
  "supercluster": "^8.0.1"
}
```

## 🚀 Guía de Despliegue en 5 Pasos

### Paso 1: Instalar Dependencias
```bash
npm install maplibre-gl supercluster
```

### Paso 2: Configurar Variables de Entorno (Opcional)
Añadir a tu archivo `.env.local`:
```env
# Opcional: Clave de MapTiler para mejor calidad de mapas
NEXT_PUBLIC_MAPTILER_KEY=tu_clave_de_maptiler_aqui
```

**Nota:** Sin esta clave, el mapa usará OpenStreetMap por defecto (100% libre).

### Paso 3: Reemplazar el map-viewer.js Original
1. **Backup del archivo original:**
   ```bash
   cp public/map-viewer.js public/map-viewer.js.backup
   ```

2. **El nuevo archivo ya está listo** en `public/map-viewer.js`

### Paso 4: Actualizar Referencias en HTML
Reemplazar cualquier referencia a Google Maps:

**❌ Antes (Google Maps):**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=TU_GOOGLE_KEY"></script>
<script src="map-viewer.js"></script>
```

**✅ Después (MapLibre):**
```html
<script src="map-viewer.js"></script>
```

### Paso 5: Verificar Funcionamiento
1. Abrir `public/map-viewer-example.html` en el navegador
2. Verificar que el mapa carga correctamente
3. Probar los controles (zoom, cambio de estilo, marcadores)
4. Verificar que no hay errores en la consola

## 🔧 Configuración Avanzada

### Usar MapTiler (Opcional)
Para mejor calidad de mapas, puedes obtener una clave gratuita en [MapTiler](https://www.maptiler.com/):

1. Registrarse en MapTiler
2. Obtener clave gratuita (hasta 100,000 cargas/mes)
3. Añadir a variables de entorno:
   ```env
   NEXT_PUBLIC_MAPTILER_KEY=tu_clave_aqui
   ```

### Personalizar Estilos
Puedes modificar los estilos en `components/MapViewer.tsx` o `public/map-viewer.js`:

```javascript
// Estilos personalizados
const customStyle = {
  version: 8,
  sources: {
    'custom-tiles': {
      type: 'raster',
      tiles: ['https://tu-servidor-tiles.com/{z}/{x}/{y}.png'],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'custom-tiles',
      type: 'raster',
      source: 'custom-tiles'
    }
  ]
};
```

## 📊 Comparación: Antes vs Después

| Aspecto | Google Maps (Antes) | MapLibre (Después) |
|---------|-------------------|-------------------|
| **Costo** | 💰 Pago por uso | 🆓 100% Gratuito |
| **Dependencias** | Google Maps API | MapLibre GL JS |
| **Datos** | Google Maps | OpenStreetMap + Esri |
| **Legal** | ⚠️ Términos de Google | ✅ 100% Libre |
| **Rendimiento** | Bueno | Excelente (vectorial) |
| **Personalización** | Limitada | Total |

## 🛠️ API Compatible

El nuevo MapViewer mantiene la misma API que el anterior:

```javascript
// Inicialización
const mapViewer = new MapViewer('map-container', {
    lat: -16.5000,
    lng: -68.1500,
    zoom: 13,
    style: 'streets', // 'streets', 'satellite', 'hybrid'
    points: [
        {
            id: '1',
            lat: -16.5000,
            lng: -68.1500,
            title: 'Mi Marcador',
            description: 'Descripción del marcador'
        }
    ],
    onMarkerClick: (point) => console.log('Marcador clickeado:', point),
    onMapClick: (lat, lng) => console.log('Mapa clickeado:', lat, lng)
});

// Métodos disponibles
mapViewer.setCenter(lat, lng);
mapViewer.setZoom(zoom);
mapViewer.setPoints(points);
mapViewer.changeStyle('satellite');
mapViewer.zoomIn();
mapViewer.zoomOut();
mapViewer.locateUser();
mapViewer.toggleFullscreen();
```

## 🔍 Solución de Problemas

### Error: "MapLibre GL JS not loaded"
- Verificar que el script se carga correctamente
- Comprobar conexión a internet
- Verificar que no hay bloqueadores de scripts

### Error: "Tiles not loading"
- Verificar conexión a internet
- Comprobar que los servidores de tiles están disponibles
- Revisar la consola del navegador para errores CORS

### Mapa no se muestra
- Verificar que el contenedor tiene dimensiones definidas
- Comprobar que no hay errores de JavaScript
- Verificar que el contenedor existe en el DOM

## 📈 Beneficios de la Migración

### ✅ Ventajas:
- **Costo cero** - No más facturas de Google Maps
- **100% libre** - Sin dependencias propietarias
- **Mejor rendimiento** - Mapas vectoriales más rápidos
- **Totalmente personalizable** - Control completo sobre estilos
- **Sin límites de uso** - Sin restricciones de API
- **Datos abiertos** - OpenStreetMap es de la comunidad

### ⚠️ Consideraciones:
- **Calidad de datos** - OpenStreetMap puede tener menos detalle en algunas áreas
- **Imágenes satelitales** - Esri puede tener menor resolución que Google
- **Geocodificación** - Necesitarás un servicio alternativo para búsquedas

## 🎯 Próximos Pasos

1. **Probar en desarrollo** - Verificar que todo funciona correctamente
2. **Configurar MapTiler** - Opcional, para mejor calidad
3. **Personalizar estilos** - Adaptar a tu marca
4. **Implementar geocodificación** - Si necesitas búsquedas de direcciones
5. **Monitorear rendimiento** - Verificar que la experiencia es buena

## 📞 Soporte

Si encuentras problemas:
1. Revisar la consola del navegador
2. Verificar que todas las dependencias están instaladas
3. Comprobar que no hay conflictos con otros scripts
4. Revisar la documentación de MapLibre GL JS

---

**¡Felicidades!** 🎉 Has migrado exitosamente de Google Maps a una solución 100% libre y sin costos.
