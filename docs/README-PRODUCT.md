# 🚀 Página de Producto - StellarMotion

Implementación completa de la página de detalle de producto para StellarMotion usando Next.js 14, TypeScript y Tailwind CSS.

## ✨ Características Implementadas

### 🖼️ **Carrusel de Imágenes**
- Scroll horizontal con snap automático
- Botones de navegación ◀ ▶ (aparecen al hacer hover)
- Indicadores de imagen en la parte inferior
- Contador de imágenes (X / Y)
- Clase CSS `no-scrollbar` para ocultar scrollbars
- Optimización con `next/image`

### 📊 **Bloque de Características**
- Grilla responsive (2-3 columnas según pantalla)
- Iconos descriptivos para cada característica
- Formateo de números con separadores de miles
- Tags del producto con diseño de chips
- Colores oficiales de StellarMotion

### 🔍 **SEO Completo**
- **Metadatos dinámicos**: `generateMetadata()` con datos reales del producto
- **Open Graph**: title, description e imagen principal
- **Canonical URL**: `/product/[slug]`
- **JSON-LD Schema**: Product, Brand, Offer, AggregateRating
- **Estructura semántica**: HTML5 semántico y accesible

### 🗺️ **Mapa Embebido**
- OpenStreetMap con `<iframe>` (sin API key)
- Marcador en las coordenadas del producto
- Responsive y accesible
- Coordenadas mostradas debajo del mapa

### 💰 **Sistema de Precios**
- Precio por mes destacado
- **Cálculo prorrateado**: `(precioMensual / 30) × días`
- **Checkbox de impresión**: Coste extra por reserva
- **Resumen de costes**: Desglose detallado
- Formateo de moneda en español (USD)

### 📅 **Calendario de Reservas**
- **Dos inputs de fecha**: Inicio y Fin (exclusivo)
- **Validación de fechas**: Fin debe ser posterior al inicio
- **Cálculo automático**: Precio y total se actualizan en tiempo real
- **Sin campo "Guests"**: Cumple con los requisitos
- **Fecha mínima**: No se pueden seleccionar fechas pasadas

### 🎨 **Diseño y UX**
- **Componentes accesibles**: Labels asociados, aria-labels
- **Responsive**: Grid adaptativo para móvil/desktop
- **Diseño limpio**: Cards redondeadas, sombras suaves
- **Colores oficiales**: Paleta de StellarMotion
- **Transiciones**: Hover effects y animaciones suaves

## 🏗️ Estructura de Archivos

```
app/
├── product/
│   └── [slug]/
│       ├── page.tsx          # Página principal del producto
│       └── not-found.tsx     # Página 404 para productos
├── api/
│   ├── products/
│   │   └── [slug]/
│   │       └── route.ts      # API mock de productos
│   └── reservations/
│       └── route.ts          # API mock de reservas

components/
└── product/
    ├── ImageCarousel.tsx     # Carrusel de imágenes
    ├── Features.tsx          # Bloque de características
    └── BookingCard.tsx       # Tarjeta de reserva

types/
└── product.ts                # Interfaces TypeScript

app/
└── globals.css               # Utilidad .no-scrollbar
```

## 🔧 Componentes Principales

### **ImageCarousel.tsx**
- **Cliente**: Usa hooks de React para estado y refs
- **Funcionalidades**: Scroll snap, navegación, indicadores
- **Accesibilidad**: aria-labels en botones de navegación
- **Responsive**: Adaptativo a diferentes tamaños de pantalla

### **Features.tsx**
- **Server-friendly**: No usa hooks ni estado
- **Grid responsive**: 2-3 columnas según breakpoint
- **Iconos**: Lucide React para consistencia visual
- **Tags**: Sistema de chips con colores oficiales

### **BookingCard.tsx**
- **Cliente**: Estado local para fechas y validaciones
- **Cálculos**: Prorrateo automático y totales
- **Validaciones**: Fechas válidas, rangos correctos
- **API**: POST a `/api/reservations` con manejo de errores

## 🌐 APIs Implementadas

### **GET /api/products/[slug]**
```typescript
// Devuelve un Product mock con:
{
  id: "prod_001",
  title: "Valla Publicitaria Premium en Avenida Principal",
  pricePerMonth: 1450,
  printingCost: 320,
  // ... resto de propiedades
}
```

### **POST /api/reservations**
```typescript
// Recibe:
{
  productId: string,
  start: string,        // YYYY-MM-DD
  end: string,          // YYYY-MM-DD (exclusivo)
  includePrinting: boolean
}

// Responde:
{
  ok: true,
  reservationId: string
}
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Grid Adaptativo**: 1 columna en móvil, 3 en desktop
- **Sticky Sidebar**: BookingCard se mantiene visible al hacer scroll
- **Touch Friendly**: Carrusel optimizado para gestos táctiles

## ♿ Accesibilidad

- **Labels asociados**: Inputs con labels descriptivos
- **Aria-labels**: Botones de navegación del carrusel
- **Contraste**: Colores que cumplen estándares WCAG
- **Navegación por teclado**: Todos los elementos son focusables
- **Textos alternativos**: Imágenes con alt descriptivos

## 🧪 Testing Manual

### **Caso de Prueba Principal**
- **Producto**: 1450 USD/mes
- **Fechas**: 2025-09-01 a 2025-09-11 (10 días)
- **Prorrateo**: (1450 / 30) × 10 = 483.33 USD
- **Impresión**: 320 USD
- **Total**: 803.33 USD ✅

### **Validaciones**
- ✅ Mismo día inicio/fin → Botón deshabilitado
- ✅ Fecha fin anterior → Mensaje de error
- ✅ Fechas válidas → Cálculo correcto
- ✅ Checkbox impresión → Suma al total
- ✅ API mock → Respuesta exitosa

## 🚀 Cómo Usar

### **1. Navegar a un producto**
```
/product/cualquier-slug
```

### **2. Ver el carrusel**
- Scroll horizontal con mouse/trackpad
- Botones de navegación al hacer hover
- Indicadores en la parte inferior

### **3. Hacer una reserva**
- Seleccionar fechas de inicio y fin
- Marcar checkbox de impresión (opcional)
- Ver cálculo automático del total
- Hacer clic en "Reservar ahora"

### **4. Explorar características**
- Grid de características del soporte
- Tags del producto
- Mapa de ubicación

## 🔮 Próximos Pasos

### **TODO: Conectar a Backend Real**
- [ ] Reemplazar APIs mock con endpoints reales
- [ ] Integrar con base de datos de productos
- [ ] Sistema de autenticación para reservas
- [ ] Pagos y confirmaciones

### **Mejoras Futuras**
- [ ] Galería de imágenes con lightbox
- [ ] Sistema de reviews y ratings
- [ ] Filtros por ubicación y características
- [ ] Chat en vivo para consultas
- [ ] Notificaciones push para reservas

## 📋 Criterios de Aceptación

✅ **Página renderiza**: Título, carrusel, características, descripción, tags y mapa  
✅ **SEO implementado**: generateMetadata + JSON-LD válido  
✅ **Carrusel funcional**: Scroll snap + botones de navegación  
✅ **Reservas sin Guests**: Solo fechas, sin campo de huéspedes  
✅ **Cálculo prorrateado**: Precio por día × número de días  
✅ **Checkbox impresión**: Coste extra por reserva  
✅ **Mapa OpenStreetMap**: Sin API key, con marcador  
✅ **Responsive**: Funciona en móvil y desktop  
✅ **Accesible**: Labels, aria-labels, contraste  

## 🎯 Commit Sugerido

```bash
git add .
git commit -m "feat(product): página de detalle con carrusel, SEO, mapa y reservas con impresión opcional

- Implementa carrusel de imágenes con scroll snap y navegación
- Añade bloque de características con grid responsive
- Incluye SEO completo (metadatos + JSON-LD)
- Integra mapa OpenStreetMap embebido
- Sistema de reservas con cálculo prorrateado
- Checkbox de impresión de lona con coste extra
- Diseño responsive y accesible
- APIs mock para desarrollo
- Sin campo 'Guests' según especificaciones"
```

---

**Desarrollado con ❤️ para StellarMotion**  
*Next.js 14 + TypeScript + Tailwind CSS*
