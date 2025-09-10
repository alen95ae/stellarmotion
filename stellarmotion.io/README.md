# StellarMotion

Plataforma completa de gestión de espacios publicitarios y reservas con panel de administración integral.

## 🚀 Deployment

### Configuración Inicial

1. **Variables de Entorno**
   ```bash
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY="tu-api-key-de-google-maps"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
   
   # Base de Datos
   DATABASE_URL="postgresql://usuario:password@localhost:5432/stellarmotion"
   ```

2. **Instalación**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Despliegue en Vercel**
   - Conecta tu repositorio de GitHub
   - Configura las variables de entorno
   - Deploy automático en cada push

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
stellarmotion.io/
├── app/                    # Páginas de Next.js
│   ├── api/               # API Routes
│   ├── panel/             # Panel de administración
│   ├── product/           # Páginas de productos
│   └── propietario/       # Páginas de propietarios
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
├── prisma/                # Esquema de base de datos
└── public/                # Archivos estáticos
```

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

## 🧭 Navegación

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

## 🔧 Solución de Problemas

### Errores Comunes

- **"Invalid hook call"**: Verifica que los componentes tengan `'use client'`
- **"Google Maps not loaded"**: Revisa la API key y referrers
- **"Database connection failed"**: Verifica `DATABASE_URL`
- **"Categories not loading"**: Ejecuta `npm run db:seed`

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