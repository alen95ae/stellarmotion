# StellarMotion - Guía de Despliegue

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY="tu-api-key-de-google-maps"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"

# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/stellarmotion"

# Opcional
GOOGLE_MAPS_SERVER_KEY="tu-server-key-para-web-services"
NEXT_PUBLIC_GOOGLE_MAP_ID="tu-map-id"
```

### 2. Configuración de Google Maps

En la consola de Google Cloud:

1. Habilita las APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

2. Crea una API Key con las siguientes restricciones:
   - **Aplicaciones web**: Solo sitios web específicos
   - **Referrers permitidos**:
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     https://*.vercel.app
     https://*.vusercontent.net
     https://tu-dominio.com
     ```

### 3. Base de Datos

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

### 4. Instalación y Configuración

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

## Estructura del Proyecto

```
stellarmotion.io/
├── app/                    # Next.js App Router
│   ├── api/               # APIs
│   ├── buscar-un-espacio/ # Página de búsqueda
│   ├── product/           # Páginas de productos
│   └── page.tsx           # Página principal
├── components/             # Componentes React
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades y configuraciones
├── prisma/                 # Schema y seed de base de datos
└── types/                  # Tipos TypeScript
```

## Características Implementadas

### ✅ Completado
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

### 🔄 En Progreso
- [ ] Integración completa con Google Maps
- [ ] Componentes de mapa y búsqueda de lugares
- [ ] Sistema de reservas

### 📋 Pendiente
- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Sistema de pagos
- [ ] Notificaciones

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Base de datos
npx prisma studio        # Abrir interfaz de base de datos
npx prisma migrate dev   # Crear y aplicar migración
npx prisma generate      # Regenerar cliente
npx prisma db seed       # Ejecutar seed

# Limpieza
rm -rf .next            # Limpiar cache de Next.js
rm -rf node_modules     # Eliminar dependencias
npm install             # Reinstalar dependencias
```

## Solución de Problemas

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

## Despliegue en Producción

### Vercel (Recomendado)
1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push

### Otros Proveedores
- **Netlify**: Similar a Vercel
- **Railway**: Para aplicaciones full-stack
- **DigitalOcean**: Para control total del servidor

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.
