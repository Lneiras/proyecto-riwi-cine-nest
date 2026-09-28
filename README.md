# 🎬 Plataforma Cine Riwi (Backend NestJS)

Backend del sistema de gestión cinematográfica para Riwi, desarrollado con **Node.js**, **NestJS**, **TypeORM**, **PostgreSQL** y **Docker**.

> **Nota sobre la migración desde Express:**
> Este proyecto corresponde a la migración de la arquitectura original basada en Express/Sequelize hacia **NestJS v12** con **TypeORM**, incorporando arquitectura modular por dominio, validación estricta de variables de entorno mediante `ConfigModule`, documentación OpenAPI interactiva vía `@nestjs/swagger`, y testing unificado con `Vitest` + `Supertest`.

---

## 📋 Tabla de Contenidos
1. [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Variables de Entorno por Ambiente](#-variables-de-entorno-por-ambiente)
4. [Levantamiento con Docker](#-levantamiento-con-docker)
5. [Ejecución en Desarrollo Local](#-ejecución-en-desarrollo-local)
6. [Endpoints Clave y Documentación](#-endpoints-clave-y-documentación)
7. [Base de Datos, Migraciones y Seeders](#-base-de-datos-migraciones-y-seeders)
8. [Pruebas Automatizadas y Calidad](#-pruebas-automatizadas-y-calidad)

---

## 🛠 Arquitectura y Tecnologías

- **Framework:** [NestJS 12](https://nestjs.com/) (Node.js v22/v24 en ESM)
- **Base de Datos:** [PostgreSQL 16](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/) con soporte de migraciones formales y carga automática de entidades
- **Contenedores:** [Docker](https://www.docker.com/) con build multi-stage y Docker Compose (`api`, `db`, `pgadmin`)
- **Seguridad y Utilidades:** [Helmet](https://helmetjs.github.io/), CORS habilitado, filtro global de excepciones (`AllExceptionsFilter`), interceptor de logging HTTP
- **Documentación API:** [Swagger / OpenAPI](https://swagger.io/) montado en `/api-docs`
- **Testing y Calidad:** [Vitest](https://vitest.dev/), Supertest, Oxlint y Prettier

---

## 📂 Estructura del Proyecto

```text
proyecto-riwi-cine-nest/
├── .github/workflows/          # Pipeline de Integración Continua (CI)
├── src/
│   ├── common/                 # Componentes transversales
│   │   ├── filters/            # Filtros globales de excepción (HttpException / 500)
│   │   └── interceptors/       # Interceptor de logging HTTP y tiempo de respuesta
│   ├── config/                 # Configuración de entorno y conexión
│   │   ├── env.validation.ts   # Esquema y validación fail-fast de variables de entorno
│   │   └── data-source.ts      # DataSource TypeORM para CLI y migraciones
│   ├── database/               # Persistencia avanzada
│   │   ├── migrations/         # Migraciones SQL generadas por TypeORM
│   │   └── seeds/              # Scripts de poblamiento inicial de datos
│   ├── health/                 # Módulo de Health Check
│   │   ├── health.controller.ts # GET /api/v1/health (200 OK / 503 DB Down)
│   │   └── health.service.ts    # Verificación de conexión activa a PostgreSQL
│   ├── location/               # Dominio de ubicaciones (países, departamentos, ciudades)
│   │   ├── controllers/
│   │   ├── dao/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── services/
│   ├── app.module.ts           # Módulo raíz (Config, TypeORM, Observabilidad)
│   └── main.ts                 # Bootstrap con Helmet, CORS, Swagger y Prefijo /api/v1
├── test/                       # Pruebas End-to-End (E2E)
├── docker-compose.yml          # Orquestación de servicios: api, db, pgadmin
├── Dockerfile                  # Multi-stage build optimizado (builder + production)
└── .env.example                # Plantilla de variables de entorno
```

---

## 🔐 Variables de Entorno por Ambiente

El sistema valida de forma estricta las variables requeridas al iniciar (`env.validation.ts`). Si falta alguna variable obligatoria (ej. `DB_PASSWORD`), el proceso se detiene inmediatamente mostrando un mensaje claro indicando qué variable falta.

| Variable | Tipo | Requerida | Valor por Defecto | Dev | QA / Staging | Prod | Descripción |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `PORT` | Number | No | `3000` | `3000` | `3000` | `3000` o asignado por el host | Puerto de escucha HTTP |
| `NODE_ENV` | String | No | `development` | `development` | `test` / `staging` | `production` | Ambiente de ejecución |
| `DB_HOST` | String | **Sí** | - | `localhost` (o `db` en docker) | `rds.qa.cine.internal` | `rds.prod.cine.internal` | Host del servidor PostgreSQL |
| `DB_PORT` | Number | No | `5432` | `5432` | `5432` | `5432` | Puerto del motor PostgreSQL |
| `DB_USERNAME` | String | **Sí** | - | `postgres` | `cine_qa_user` | `cine_prod_user` | Usuario de base de datos |
| `DB_PASSWORD` | String | **Sí** | - | `postgres123` | `ClaveSeguraQA` | `ClaveAltaSeguridadProd` | Contraseña de base de datos |
| `DB_DATABASE` | String | **Sí** | - | `postgres` | `cine_riwi_qa` | `cine_riwi_prod` | Nombre de la base de datos |
| `DB_SYNCHRONIZE` | Boolean | No | `false` | `true` | `false` | `false` | Sincronización automática de entidades (solo dev) |
| `PGADMIN_PORT` | Number | No | `5050` | `5050` | N/A | N/A | Puerto web para pgAdmin (dev) |
| `PGADMIN_DEFAULT_EMAIL` | String | No | `admin@riwi.com` | `admin@riwi.com` | N/A | N/A | Usuario administrador de pgAdmin |
| `PGADMIN_DEFAULT_PASSWORD` | String | No | `admin1234` | `admin1234` | N/A | N/A | Clave de acceso a pgAdmin |

---

## 🐳 Levantamiento con Docker

El archivo `docker-compose.yml` orquesta 3 servicios interconectados bajo la red `cine-network`:
- **`db`** (PostgreSQL 16 Alpine con healthcheck integrado)
- **`api`** (NestJS en build multi-stage alpine, depende de que `db` esté healthy)
- **`pgadmin`** (Herramienta visual de administración para PostgreSQL)

### 1. Clonar y preparar variables
```bash
cp .env.example .env
```

### 2. Levantar los contenedores
```bash
docker compose up -d --build
```

### 3. Verificar estado
- **API Health:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)
  - Usuario: `admin@riwi.com`
  - Contraseña: `admin1234`
  - Host de conexión al crear servidor en pgAdmin: `db` (o `database`), puerto `5432`.

### 4. Detener contenedores (preservando datos)
```bash
docker compose down
```

---

## 💻 Ejecución en Desarrollo Local

Si deseas ejecutar la base de datos en Docker y la aplicación directamente en tu máquina:

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar únicamente la base de datos y pgadmin
docker compose up -d db pgadmin

# 3. Compilar el proyecto
npm run build

# 4. Iniciar en modo desarrollo con recarga en caliente
npm run start:dev
```

---

## 🌐 Endpoints Clave y Documentación

Todos los endpoints de la API cuentan con prefijo global `/api/v1` (excepto la documentación Swagger):

### 1. Health Check
- **URL:** `GET /api/v1/health`
- **Descripción:** Verifica el tiempo de actividad y realiza una consulta activa (`SELECT 1`) a PostgreSQL.
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-25T01:00:00.000Z",
    "uptime": 12.34,
    "database": {
      "status": "up"
    }
  }
  ```
- **Fallo en BD (503 Service Unavailable):**
  ```json
  {
    "statusCode": 503,
    "timestamp": "2026-09-25T01:00:00.000Z",
    "path": "/api/v1/health",
    "method": "GET",
    "message": {
      "status": "error",
      "timestamp": "2026-09-25T01:00:00.000Z",
      "uptime": 12.34,
      "database": {
        "status": "down",
        "error": "Connection refused"
      }
    }
  }
  ```

### 2. Swagger UI (OpenAPI)
- **URL:** `http://localhost:3000/api-docs`
- Incluye la definición completa de modelos DTOs, esquemas y endpoints del dominio `Health` y `Locations`.

---

## 🗄 Base de Datos, Migraciones y Seeders

El proyecto soporta tanto sincronización de esquema (`DB_SYNCHRONIZE=true` en Dev) como migraciones formales versionadas mediante TypeORM:

```bash
# Generar una nueva migración basada en cambios de entidades
npm run migration:generate -- src/database/migrations/InitialMigration

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert

# Ejecutar seeder inicial (país, departamento, ciudad)
npm run seed
```

---

## 🧪 Pruebas Automatizadas y Calidad

El proyecto utiliza Vitest y Supertest con soporte nativo de TypeScript y módulos ESM:

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas End-to-End (E2E)
npm run test:e2e

# Cobertura de pruebas
npm run test:cov

# Análisis estático de código (Linter con Oxlint)
npm run lint

# Formateo de código con Prettier
npm run format
```

El pipeline de CI en [`.github/workflows/ci.yml`](.github/workflows/ci.yml) valida automáticamente en cada Pull Request y push a `main` y `develop`:
1. `npm run lint`
2. `npm run build`
3. `npm test`
4. `npm run test:e2e`
