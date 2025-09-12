# StellarMotion

Plataforma completa de gestión de espacios publicitarios y reservas con panel de administración integral.

## 🚀 Deployment

### Configuración Inicial

1. **Variables de Entorno**

   Crea un archivo `.env.local` en la raíz del proyecto:

   ```bash
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY="tu-api-key-de-google-maps"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
   
   # Base de Datos
   # Desarrollo local (SQLite)
   DATABASE_URL="file:./dev.db"

   # Producción (Supabase Postgres)
   # DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   
   # Opcional
   GOOGLE_MAPS_SERVER_KEY="tu-server-key-para-web-services"
   NEXT_PUBLIC_GOOGLE_MAP_ID="tu-map-id"
   ```

2. **Configuración de Google Maps**

   En la consola de Google Cloud:

   - Habilita las APIs: Maps JavaScript API, Places API, Geocoding API
   - Crea una API Key con restricciones para aplicaciones web
   - Referrers permitidos:
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     https://*.vercel.app
     https://*.vusercontent.net
     https://tu-dominio.com
     ```

3. **Base de Datos**

   #### Opción A: PostgreSQL Local
   ```bash
   # Instalar PostgreSQL
   brew install postgresql  # macOS
   sudo apt-get install postgresql  # Ubuntu
   
   # Crear base de datos
   createdb stellarmotion
   
   # Actualizar DATABASE_URL en .env.local
   DATABASE_URL="postgresql://tu-usuario@localhost:5432/stellarmotion"
   ```

   #### Opción B: Supabase
   1. Crea un proyecto en [supabase.com](https://supabase.com)
   2. Copia la URL y anon key a tu `.env.local`
   3. Usa la URL de la base de datos de Supabase

4. **Instalación y Configuración**

   ```bash
   # Instalar dependencias
   npm install
   
   # Limpiar cache de Next.js
   rm -rf .next
   
   # Generar cliente de Prisma
   npx prisma generate
   
   # Ejecutar migraciones
   npx prisma migrate dev
   
   # Poblar base de datos con datos de ejemplo
   npx prisma db seed
   
   # Iniciar servidor de desarrollo
   npm run dev
   ```

5. **Despliegue en Vercel**
   - Conecta tu repositorio de GitHub
   - Configura las variables de entorno
   - Deploy automático en cada push

   Nota sobre base de datos en Vercel:
   - En Vercel, configura `DATABASE_URL` con la URL de conexión de Supabase (PostgreSQL) desde el panel de Supabase.
   - En desarrollo local, puedes usar SQLite con `DATABASE_URL="file:./dev.db"` para no depender de servicios externos.

### Variables de Entorno

#### Archivos de Entorno

- **`.env.local`**: Variables para desarrollo local (no versionar)
- **`.env.development`**: Variables específicas para entorno de desarrollo
- **`.env.production`**: Variables para producción (no versionar)
- **`.env.example`**: Plantilla con todas las variables necesarias (versionar)

#### Uso de Variables

```bash
# Desarrollo local
cp .env.example .env.local
# Editar .env.local con tus valores reales

# Desarrollo
cp .env.example .env.development
# Configurar variables específicas de desarrollo

# Producción
cp .env.example .env.production
# Configurar variables de producción
```

## 📦 Product

### Características Principales

- 🏢 **Gestión de espacios publicitarios** con CRUD completo
- 📍 **Búsqueda por ubicación** con mapas interactivos
- 📅 **Sistema de reservas** con calendario y validaciones
- 💰 **Facturación automática** con cálculo de impuestos
- 🗺️ **Integración con Google Maps** y OpenStreetMap
- 📊 **Métricas y reportes** en tiempo real

### Tecnologías

- **Frontend**: Next.js 15.2.4, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Base de datos**: Prisma ORM + SQLite/PostgreSQL
- **Mapas**: Google Maps API, OpenStreetMap
- **UI Components**: Radix UI, Lucide React

### Estructura del Proyecto

```
stellarmotion/
├── stellarmotion.io/          # Frontend web
│   ├── app/                   # Páginas de Next.js
│   │   ├── api/               # API Routes
│   │   ├── panel/             # Panel de administración
│   │   ├── product/           # Páginas de productos
│   │   └── propietario/       # Páginas de propietarios
│   ├── components/            # Componentes reutilizables
│   ├── lib/                   # Utilidades y configuración
│   ├── prisma/                # Esquema de base de datos
│   └── public/                # Archivos estáticos
├── stellarmotion.erp/         # Backend ERP
│   ├── app/                   # API y páginas del ERP
│   ├── components/            # Componentes del dashboard
│   └── prisma/                # Esquema de base de datos
└── docs/                      # Documentación histórica
```

### Características Implementadas

#### ✅ Completado
- [x] Estándares de ENV unificados
- [x] Validación de variables de entorno con Zod
- [x] Separación cliente/servidor (no más errores de hooks)
- [x] Loader de Google Maps sin import { google }
- [x] Categorías unificadas (Home ↔ Buscar)
- [x] Navegación con parámetros de URL
- [x] Filtros con slider de precio
- [x] Grid responsivo (1/2/3 columnas)
- [x] Cards que enlazan a fichas de producto
- [x] Fichas de producto con SSR
- [x] UI pulida con iconos consistentes
- [x] Base de datos unificada (Prisma + Supabase)
- [x] APIs para productos y categorías
- [x] Seed con datos de ejemplo

#### 🔄 En Progreso
- [ ] Integración completa con Google Maps
- [ ] Componentes de mapa y búsqueda de lugares
- [ ] Sistema de reservas

#### 📋 Pendiente
- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Sistema de pagos
- [ ] Notificaciones

## 🖥 Dashboard

### Módulos Implementados

1. **🏠 Inicio** - Dashboard general con KPIs y métricas
2. **📺 Soportes** - CRUD completo de soportes publicitarios
3. **📅 Reservas** - Gestión de reservas con estados
4. **👥 Clientes** - Base de datos de clientes
5. **💰 Facturación** - Generación automática de facturas
6. **📈 Métricas** - Gráficas de rendimiento
7. **🔧 Mantenimiento** - Sistema de tickets
8. **🗺️ Mapa** - Vista interactiva de soportes
9. **📨 Mensajería** - Centro de notificaciones
10. **⚙️ Ajustes** - Configuración del sistema

### APIs Disponibles

- **Reservas**: `GET/POST/PUT /api/reservas`
- **Clientes**: `GET/POST/PUT/DELETE /api/clientes`
- **Facturación**: `GET/POST/PUT /api/facturacion`
- **Mantenimiento**: `GET/POST/PUT/DELETE /api/mantenimiento`
- **Mensajería**: `GET/POST/PUT/DELETE /api/mensajeria`
- **Configuración**: `GET/POST/PUT/DELETE /api/ajustes`

### Características del Dashboard

#### ✅ **Módulos Implementados**

1. **🏠 Inicio** (`/panel/inicio`)
   - Dashboard general con KPIs
   - Total soportes (disponibles/ocupados/reservados)
   - Ingresos del mes
   - Reservas próximas a vencer
   - Gráfica de ocupación mensual
   - Mini-mapa con soportes por estado

2. **📺 Soportes** (`/panel/soportes`)
   - CRUD completo de soportes publicitarios
   - Filtros avanzados por categoría, estado, ubicación
   - Acciones masivas y exportación
   - Gestión de imágenes

3. **📅 Reservas** (`/panel/reservas`)
   - CRUD de reservas con estados (pendiente/confirmada/activa/completada/cancelada)
   - Vista de calendario para reservas
   - Gestión de períodos y montos
   - Integración con clientes y soportes

4. **👥 Clientes** (`/panel/clientes`)
   - Base de datos completa de clientes
   - Información fiscal (NIT, dirección)
   - Historial de reservas y facturación
   - Estados activos/inactivos

5. **💰 Facturación** (`/panel/facturacion`)
   - Generación automática de facturas
   - Estados: pendiente/enviada/pagada/vencida/cancelada
   - Cálculo automático de impuestos (IVA 13%)
   - Exportación a PDF (preparado)
   - Control de vencimientos

6. **📈 Métricas** (`/panel/metricas`)
   - Gráficas de ingresos por mes
   - Ocupación por tipo de soporte
   - Ranking de clientes por gasto
   - Tendencias y proyecciones
   - KPIs de rendimiento

7. **🔧 Mantenimiento** (`/panel/mantenimiento`)
   - Sistema de tickets de incidencias
   - Prioridades: baja/media/alta/urgente
   - Estados: pendiente/en progreso/resuelto/cancelado
   - Asignación de técnicos
   - Historial de mantenimiento

8. **🗺️ Mapa** (`/panel/mapa`)
   - Mapa interactivo con ubicación de soportes
   - Marcadores coloreados por disponibilidad
   - Filtros por zona geográfica
   - Vista detallada de cada soporte

9. **📨 Mensajería** (`/panel/mensajeria`)
   - Centro de notificaciones del sistema
   - Tipos: reservas/facturas/mantenimiento/sistema
   - Estados leído/no leído
   - Configuración de alertas

10. **⚙️ Ajustes** (`/panel/ajustes`)
    - Configuración del propietario/empresa
    - Datos fiscales y facturación
    - Gestión de usuarios y roles
    - Configuración de notificaciones

## 🧭 Navegación / Tests

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 3001)
npm run build            # Construcción para producción
npm run start            # Servidor de producción
npm run lint             # Linter

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:generate      # Generar cliente Prisma
npm run db:seed          # Poblar base de datos
npm run type-check       # Verificación de tipos
```

### URLs Principales

- **Sitio Web**: `http://localhost:3001`
- **Panel Admin**: `http://localhost:3001/panel/inicio`
- **Búsqueda**: `http://localhost:3001/buscar-un-espacio`
- **Publicar**: `http://localhost:3001/publicar-espacio`
- **Backend ERP**: `http://localhost:3000`

### Comandos Útiles

```bash
# Limpieza
rm -rf .next            # Limpiar cache de Next.js
rm -rf node_modules     # Eliminar dependencias
npm install             # Reinstalar dependencias

# Base de datos
npx prisma studio       # Abrir interfaz de BD
npx prisma migrate dev  # Crear migración
npx prisma generate     # Regenerar cliente
```

### Testing Manual

#### **Caso de Prueba Principal**
- **Producto**: 1450 USD/mes
- **Fechas**: 2025-09-01 a 2025-09-11 (10 días)
- **Prorrateo**: (1450 / 30) × 10 = 483.33 USD
- **Impresión**: 320 USD
- **Total**: 803.33 USD ✅

#### **Validaciones**
- ✅ Mismo día inicio/fin → Botón deshabilitado
- ✅ Fecha fin anterior → Mensaje de error
- ✅ Fechas válidas → Cálculo correcto
- ✅ Checkbox impresión → Suma al total
- ✅ API mock → Respuesta exitosa

#### **Productos Disponibles para Testing**

1. **Producto 1 - Valla (ID: 1)**
   - **Ubicación**: La Paz, Bolivia
   - **Precio**: 850 USD/mes
   - **Impresión**: 250 USD
   - **Tipo**: Bipolar, Iluminado

2. **Producto 2 - Pantalla LED (ID: 2)**
   - **Ubicación**: Santa Cruz, Bolivia  
   - **Precio**: 1200 USD/mes
   - **Impresión**: No aplica (digital)
   - **Tipo**: Digital, LED

3. **Producto 3 - MUPI (ID: 3)**
   - **Ubicación**: Cochabamba, Bolivia
   - **Precio**: 450 USD/mes
   - **Impresión**: 180 USD
   - **Tipo**: Unipolar, Peatonal

## 🔧 Solución de Problemas

### Errores Comunes

- **"Invalid hook call"**: Verifica que los componentes tengan `'use client'`
- **"Google Maps not loaded"**: Revisa la API key y referrers
- **"Database connection failed"**: Verifica `DATABASE_URL`
- **"Categories not loading"**: Ejecuta `npm run db:seed`

### Error: "Invalid hook call"
- Asegúrate de que los componentes que usan hooks tengan `'use client'`
- Verifica que no haya duplicación de `<html>` o `<body>`

### Error: "Google Maps not loaded"
- Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` esté configurado
- Asegúrate de que los referrers estén permitidos en Google Cloud

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que PostgreSQL esté ejecutándose
- Ejecuta `npx prisma generate` después de cambios en el schema

### Error: "Categories not loading"
- Verifica que la base de datos tenga datos (ejecuta `npx prisma db seed`)
- Revisa los logs del servidor para errores de API

## 📊 Datos de Prueba

El sistema incluye datos completos:
- ✅ 3 clientes de ejemplo
- ✅ 6 soportes publicitarios
- ✅ 3 reservas en diferentes estados
- ✅ 2 facturas (pagada/pendiente)
- ✅ 2 tickets de mantenimiento
- ✅ 4 mensajes de notificación

## 🚀 Próximas Funcionalidades

- [ ] Calendario interactivo con react-big-calendar
- [ ] Exportación PDF de facturas
- [ ] Notificaciones push en tiempo real
- [ ] Integración de pagos online
- [ ] Reportes avanzados con filtros
- [ ] API de terceros para mapas reales

## 📋 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ para StellarMotion**  
*Next.js 15 + React 18 + TypeScript + Tailwind CSS*
