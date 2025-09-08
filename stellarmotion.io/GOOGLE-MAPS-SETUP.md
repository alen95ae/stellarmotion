# Configuración de Google Maps para StellarMotion

## Problema Actual
El mapa no está funcionando porque falta la clave de API de Google Maps.

## Solución

### 1. Obtener Clave de API de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Maps JavaScript API**:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Maps JavaScript API"
   - Haz clic en "Habilitar"
4. Crea credenciales:
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBYxjsyAYm9bt6gs0k7tGOkHoo9lq8aSVc
GOOGLE_MAPS_API_KEY=AIzaSyAKYSjoCH_H0HktjiBqwkjYIrBAiZUGnBM

# Base URL para la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Reemplaza `tu_clave_de_api_aqui` con la clave real que obtuviste de Google Cloud Console.

### 3. Restringir la Clave de API (Recomendado)

Para mayor seguridad, restringe la clave de API:

1. En Google Cloud Console, ve a "Credenciales"
2. Haz clic en tu clave de API
3. En "Restricciones de aplicación", selecciona "Sitios web HTTP"
4. Agrega tu dominio (ej: `localhost:3000` para desarrollo)
5. En "Restricciones de API", selecciona solo "Maps JavaScript API"

### 4. Reiniciar el Servidor

Después de crear el archivo `.env.local`:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

### 5. Verificar Funcionamiento

1. Ve a cualquier página de producto (ej: `/product/1`)
2. El mapa debería cargarse correctamente
3. Deberías ver un marcador en la ubicación del producto

## Solución Temporal

Si no tienes una clave de API, el mapa usará `DEMO_KEY` (clave de demostración) que tiene limitaciones pero permite que la aplicación funcione para pruebas.

## Archivos Modificados

- `app/layout.tsx` - Script de Google Maps
- `components/product/GoogleMapMarker.tsx` - Componente del mapa
- `app/api/products/[slug]/route.ts` - API de productos (corregido)

## Notas Técnicas

- El mapa usa la API tradicional de Google Maps (no la nueva API de importLibrary)
- Los marcadores se personalizan según la categoría del producto
- Se incluyen estilos personalizados para ocultar elementos innecesarios
- El mapa es responsive y se adapta al tamaño del contenedor
