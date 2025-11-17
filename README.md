# Refolder - SaaS de Gestión para Obras y Reformas

SaaS completo para la gestión integral de obras y reformas, construido con Next.js 15, React 19, TypeScript, TailwindCSS y Supabase.

## 🚀 Stack Tecnológico

- **Next.js 15.1** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **TailwindCSS 3.4** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI de alta calidad
- **Supabase** - Backend como servicio (BaaS)

## 📁 Estructura del Proyecto

```
refolder/
├── app/                    # App Router de Next.js
│   ├── auth/              # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Rutas del dashboard
│   │   ├── obras/
│   │   ├── clientes/
│   │   ├── presupuestos/
│   │   └── proveedores/
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   ├── layout/           # Componentes de layout
│   ├── obras/            # Componentes de obras
│   └── clientes/         # Componentes de clientes
├── lib/                  # Utilidades y configuraciones
│   ├── supabase/         # Clientes de Supabase
│   │   ├── client.ts     # Cliente para cliente (browser)
│   │   └── server.ts     # Cliente para servidor
│   └── utils.ts          # Utilidades generales
├── hooks/                # Custom React hooks
├── types/                # Tipos TypeScript
│   └── index.ts          # Tipos principales
└── public/               # Archivos estáticos
```

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Edita `.env.local` y agrega tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🔧 Configuración de Supabase

Este proyecto utiliza Supabase para:
- Autenticación de usuarios
- Base de datos PostgreSQL
- Almacenamiento de archivos
- APIs en tiempo real

Asegúrate de tener un proyecto de Supabase configurado y las credenciales correctas en `.env.local`.

## 📦 Componentes UI

El proyecto utiliza shadcn/ui para los componentes. Para agregar nuevos componentes:

```bash
npx shadcn@latest add [component-name]
```

## 🎨 Personalización

Los estilos se pueden personalizar en:
- `app/globals.css` - Variables CSS y estilos globales
- `tailwind.config.ts` - Configuración de TailwindCSS

## 📄 Licencia

Este proyecto es privado y confidencial.
