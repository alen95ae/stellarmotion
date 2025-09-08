# StellarMotion

Plataforma de gestión de espacios publicitarios y reservas.

## Características

- 🏢 Gestión de espacios publicitarios
- 📍 Búsqueda por ubicación
- 📅 Sistema de reservas
- 👥 Panel de administración
- 🗺️ Integración con mapas
- 💰 Sistema de facturación

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: Prisma + SQLite
- **Mapas**: Google Maps API / OpenStreetMap
- **UI Components**: shadcn/ui

## Estructura del Proyecto

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

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   # o
   pnpm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env.local
   ```

4. Inicializa la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter
- `npm run db:push` - Sincronizar esquema de BD
- `npm run db:seed` - Poblar base de datos

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
