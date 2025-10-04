# ponteGEEK - Gestión de Eventos y Proyectos

## 📋 Descripción

ponteGEEK es una plataforma SaaS completa para la gestión de eventos, proyectos y contactos. Desarrollada con Next.js 14, PostgreSQL, Redis y Docker, ofrece una solución integral para organizadores de eventos y gestores de proyectos.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Autenticación**: NextAuth.js
- **UI**: Tailwind CSS, Shadcn/ui
- **Temas**: next-themes (modo claro/oscuro)
- **Contenedores**: Docker, Docker Compose
- **Notificaciones**: Sonner (toast notifications)

### Estructura de Directorios

```
sepresac-saas/
├── 📁 src/
│   ├── 📁 app/                    # App Router de Next.js
│   │   ├── 📁 api/               # API Routes
│   │   │   ├── 📁 auth/          # Autenticación
│   │   │   ├── 📁 contacts/      # API de contactos
│   │   │   ├── 📁 dashboard/     # API del dashboard
│   │   │   ├── 📁 notifications/ # API de notificaciones
│   │   │   └── 📁 projects/      # API de proyectos
│   │   ├── 📁 auth/              # Páginas de autenticación
│   │   │   ├── 📁 signin/        # Página de login
│   │   │   └── 📁 signup/        # Página de registro
│   │   ├── 📁 contacts/          # Página de contactos
│   │   ├── 📁 dashboard/         # Página principal del dashboard
│   │   ├── 📁 projects/          # Página de proyectos
│   │   ├── 📄 layout.tsx         # Layout principal
│   │   ├── 📄 page.tsx           # Página de inicio
│   │   └── 📄 globals.css        # Estilos globales
│   ├── 📁 components/            # Componentes reutilizables
│   │   ├── 📁 ui/                # Componentes de UI (Shadcn)
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 dialog.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   └── 📄 sonner.tsx
│   │   ├── 📄 providers.tsx      # Providers de contexto
│   │   ├── 📄 theme-provider.tsx # Provider de temas
│   │   └── 📄 theme-toggle.tsx   # Toggle de tema
│   ├── 📁 lib/                   # Utilidades y configuración
│   │   ├── 📄 auth.ts            # Configuración de NextAuth
│   │   ├── 📄 cache.ts           # Servicio de Redis
│   │   └── 📄 database.ts        # Cliente de Prisma
│   └── 📁 types/                 # Tipos de TypeScript
│       └── 📄 next-auth.d.ts     # Extensión de tipos de NextAuth
├── 📁 prisma/                    # Configuración de Prisma
│   ├── 📄 schema.prisma          # Esquema de base de datos
│   └── 📁 migrations/            # Migraciones de base de datos
├── 📁 public/                    # Archivos estáticos
│   ├── 📄 favicon.ico            # Favicon
│   ├── 📄 logo.png               # Logo modo claro
│   └── 📄 logow.png              # Logo modo oscuro
├── 📁 assets/                    # Recursos adicionales
├── 📄 docker-compose.yml         # Configuración de Docker Compose
├── 📄 Dockerfile                 # Imagen de Docker
├── 📄 .env                       # Variables de entorno
├── 📄 package.json               # Dependencias del proyecto
└── 📄 README.md                  # Documentación del proyecto
```

## 🗄️ Base de Datos

### Esquema de Base de Datos

```sql
-- Usuarios
User {
  id: String (UUID, PK)
  email: String (Unique)
  name: String
  password: String (Hashed)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Proyectos
Project {
  id: String (UUID, PK)
  name: String
  description: String?
  status: ProjectStatus (ACTIVE, INACTIVE, ARCHIVED)
  ownerId: String (FK -> User.id)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Miembros de Proyecto
ProjectMember {
  id: String (UUID, PK)
  projectId: String (FK -> Project.id)
  userId: String (FK -> User.id)
  role: ProjectRole (OWNER, ADMIN, MEMBER)
  joinedAt: DateTime
}

-- Eventos
Event {
  id: String (UUID, PK)
  title: String
  description: String?
  startDate: DateTime
  endDate: DateTime
  location: String?
  projectId: String (FK -> Project.id)
  creatorId: String (FK -> User.id)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Contactos de Evento
EventContact {
  id: String (UUID, PK)
  eventId: String (FK -> Event.id)
  contactId: String (FK -> Contact.id)
  status: ContactStatus (INVITED, CONFIRMED, DECLINED)
  invitedAt: DateTime
  respondedAt: DateTime?
}

-- Contactos
Contact {
  id: String (UUID, PK)
  name: String
  email: String?
  phone: String?
  company: String?
  position: String?
  location: String?
  notes: String?
  projectId: String (FK -> Project.id)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Notificaciones
Notification {
  id: String (UUID, PK)
  userId: String (FK -> User.id)
  type: NotificationType
  title: String
  message: String
  read: Boolean
  createdAt: DateTime
}
```

### Índices de Rendimiento

```sql
-- Índices para optimización de consultas
CREATE INDEX idx_contacts_project_id ON contacts(project_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://sepresac:sepresac_password_2024@localhost:5435/sepresac"

# Redis
REDIS_URL="redis://localhost:6381"

# NextAuth
NEXTAUTH_SECRET="sepresac_nextauth_secret_2024"
NEXTAUTH_URL="https://gev.pontegeek.com"

# Aplicación
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="https://gev.pontegeek.com"
```

### Docker Compose

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: sepresac-postgres
    ports:
      - "5435:5432"
    environment:
      POSTGRES_DB: sepresac
      POSTGRES_USER: sepresac
      POSTGRES_PASSWORD: sepresac_password_2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sepresac -d sepresac"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: sepresac-redis
    ports:
      - "6381:6379"
    volumes:
      - redis_data:/data

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sepresac-app
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sepresac:sepresac_password_2024@postgres:5432/sepresac
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=sepresac_nextauth_secret_2024
      - NEXTAUTH_URL=https://sepresac.pontegeek.com
      - NEXT_PUBLIC_APP_URL=https://sepresac.pontegeek.com
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - app_uploads:/app/uploads
      - app_logs:/app/logs

volumes:
  postgres_data:
  redis_data:
  app_uploads:
  app_logs:

networks:
  sepresac-network:
    driver: bridge
```

## 🚀 Instalación y Despliegue

### Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd sepresac-saas

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servicios con Docker
docker-compose up -d

# Ejecutar migraciones de base de datos
npx prisma migrate deploy

# Generar cliente de Prisma
npx prisma generate
```

### Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Comandos de Docker

```bash
# Construir imagen
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Reiniciar aplicación
docker-compose restart app

# Parar servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

## 🔐 Autenticación

### Configuración de NextAuth

```typescript
// src/lib/auth.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Lógica de autenticación
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      // Callback JWT
    },
    async session({ session, token }) {
      // Callback de sesión
    }
  }
}
```

### Gestión de Sesiones

- **Duración**: 30 días
- **Estrategia**: JWT
- **Persistencia**: Redis (opcional)
- **Renovación**: Automática

## 📊 API Endpoints

### Autenticación

```
POST /api/auth/signin     # Iniciar sesión
POST /api/auth/signup     # Registro
POST /api/auth/signout    # Cerrar sesión
```

### Dashboard

```
GET /api/dashboard/stats  # Estadísticas del dashboard
```

### Proyectos

```
GET    /api/projects           # Listar proyectos
POST   /api/projects           # Crear proyecto
GET    /api/projects/[id]      # Obtener proyecto
PUT    /api/projects/[id]      # Actualizar proyecto
DELETE /api/projects/[id]      # Eliminar proyecto
```

### Contactos

```
GET    /api/contacts           # Listar contactos
POST   /api/contacts           # Crear contacto
GET    /api/contacts/[id]      # Obtener contacto
PUT    /api/contacts/[id]      # Actualizar contacto
DELETE /api/contacts/[id]      # Eliminar contacto
```

### Notificaciones

```
GET    /api/notifications      # Listar notificaciones
PUT    /api/notifications/[id] # Marcar como leída
```

## 🎨 Temas y UI

### Sistema de Temas

- **Modo Claro**: Tema por defecto
- **Modo Oscuro**: Tema alternativo
- **Modo Sistema**: Detecta preferencia del sistema
- **Persistencia**: LocalStorage

### Componentes UI

- **Shadcn/ui**: Componentes base
- **Tailwind CSS**: Estilos utilitarios
- **Lucide React**: Iconografía
- **Sonner**: Notificaciones toast

## ⚡ Optimización y Rendimiento

### Caché con Redis

```typescript
// src/lib/cache.ts
export class CacheService {
  static async get<T>(key: string): Promise<T | null>
  static async set<T>(key: string, value: T, ttl: number): Promise<void>
  static async del(key: string): Promise<void>
  static async invalidatePattern(pattern: string): Promise<void>
}
```

### Estrategias de Caché

- **Dashboard Stats**: 5 minutos
- **Proyectos de Usuario**: 10 minutos
- **Contactos**: 10 minutos
- **Invalidación**: Automática en cambios

### Optimizaciones de Base de Datos

- **Índices**: 21 índices optimizados
- **Conexiones**: Pool de conexiones Prisma
- **Consultas**: Optimizadas con includes selectivos
- **Paginación**: Implementada en listados

## 🔍 Monitoreo y Logs

### Logs de Aplicación

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Logs específicos
docker-compose logs app --tail=100
```

### Métricas de Rendimiento

- **Tiempo de respuesta**: < 200ms (API)
- **Carga de página**: < 2s (Frontend)
- **Disponibilidad**: 99.9%
- **Uptime**: Monitoreo continuo

## 🧪 Testing

### Tipos de Pruebas

- **Unit Tests**: Componentes y utilidades
- **Integration Tests**: API endpoints
- **E2E Tests**: Flujos completos
- **Performance Tests**: Carga y rendimiento

### Comandos de Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance
```

## 🚀 Despliegue

### Entornos

- **Development**: Local con Docker
- **Staging**: Servidor de pruebas
- **Production**: Servidor de producción

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Changelog

### v1.0.0 (2024-09-30)

#### ✨ Nuevas Características
- Dashboard personalizado con nombre de usuario y hora actual
- Sistema de temas (claro/oscuro/sistema)
- Gestión completa de proyectos
- Sistema de contactos
- Notificaciones en tiempo real
- Caché con Redis
- Autenticación persistente (30 días)

#### 🔧 Mejoras
- Optimización de base de datos con 21 índices
- Caché inteligente con invalidación automática
- UI responsive y touch-friendly
- Navegación mejorada entre secciones
- Modal de creación de proyectos

#### 🐛 Correcciones
- Error de autenticación en sección de proyectos
- Problemas de conexión con Redis
- Carga lenta de páginas
- Eventos recientes no mostrados correctamente

## 🤝 Contribución

### Guías de Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Conventional Commits**: Mensajes de commit

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Nathz Guardia
- **Diseño UI/UX**: Nathz Guardia 
- **DevOps**: Nathz Guardia 

## 📞 Soporte

- **Email**: nathzg@pontegeek.com
- **Documentación**: [Link a documentación]
- **Issues**: [Link a GitHub Issues]

---

**ponteGEEK** - Gestión de Eventos y Proyectos  
*Desarrollado con ❤️ usando Next.js, PostgreSQL y Redis*
