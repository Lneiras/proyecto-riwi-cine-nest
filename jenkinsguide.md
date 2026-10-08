# 🚀 Guía de Configuración y Ejecución - Jenkins CI (Día 4)

Este documento detalla el paso a paso para configurar **Jenkins**, enlazarlo con **GitHub** y **SonarQube** en Docker, y poner en marcha el pipeline de **Integración Continua (CI)** para **Riwi Cine NestJS API**.

---

## 🏗 Arquitectura de Red y Contenedores

Todos los servicios conviven bajo la red Docker `cine-network`:
- **Jenkins:** `http://localhost:8080` (nombre interno en red: `http://riwi-cine-jenkins:8080`)
- **SonarQube:** `http://localhost:9000` (nombre interno en red: `http://riwi-cine-sonarqube:9000`)
- **API NestJS:** `http://localhost:3000`
- **PostgreSQL App:** `riwi-cine-db:5432`
- **PostgreSQL Sonar:** `riwi-cine-sonar-db:5432`

---

## 📋 Flujo de Trabajo del Pipeline CI

El pipeline implementado en el [`Jenkinsfile`](./Jenkinsfile) ejecuta estrictamente las siguientes etapas:

```text
       ┌──────────────┐
       │   Checkout   │ (Descarga el código desde Git)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │   Install    │ (npm ci / dependencias limpias)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │     Lint     │ (ESLint: validación de código limpio)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │  Unit Tests  │ (Vitest: 33 pruebas unitarias)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │   Coverage   │ (Genera reporte LCOV en coverage/lcov.info)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │  SonarQube   │ (Envía métricas a SonarQube)
       └──────┬───────┘
              ▼
       ┌──────────────┐
       │ Quality Gate │ (Verifica umbrales; detiene el pipeline si falla)
       └──────────────┘
```

---

## 🛠 Paso 1: Levantar los Contenedores con Docker

Inicia los servicios necesarios en segundo plano:

```bash
docker compose up -d jenkins sonarqube sonar-db
```

Comprueba que los contenedores estén activos:
```bash
docker compose ps
```

---

## 🔑 Paso 2: Desbloqueo Inicial de Jenkins

1. Abre tu navegador e ingresa a: **[http://localhost:8080](http://localhost:8080)**.
2. Para obtener la contraseña de administrador inicial, ejecuta en tu terminal:
   ```bash
   docker exec riwi-cine-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Pega la clave en la pantalla de desbloqueo.
4. Selecciona **"Install suggested plugins"** (Instalar plugins sugeridos).
5. Crea tu usuario administrador y finaliza la configuración inicial.

---

## 🔌 Paso 3: Instalación de Plugins Requeridos en Jenkins

1. En el panel de Jenkins, ve a: **Administrar Jenkins** (`Manage Jenkins`) ➔ **Plugins** ➔ **Available plugins** (Plugins disponibles).
2. Busca e instala:
   - **SonarQube Scanner** (ID: `sonar`)
   - **NodeJS** (opcional si se requiere gestionar versiones adicionales)
3. Reinicia Jenkins si el instalador lo solicita (o marca la casilla "Restart Jenkins when installation is complete").

---

## 🔐 Paso 4: Configurar Credenciales y Conexión con SonarQube

### 4.1. Guardar el Token de SonarQube en Jenkins
1. En SonarQube (`http://localhost:9000`), ve a **My Account** ➔ **Security** y genera un token (tipo *User Token* o *Global Analysis Token*). Copia el token (empieza con `squ_`).
2. En Jenkins, ve a **Administrar Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials (unrestricted)**.
3. Haz clic en **Add Credentials**:
   - **Kind:** `Secret text`
   - **Secret:** *(pega tu token squ_...)*
   - **ID:** `sonar-token`
   - **Description:** `Token de autenticación para SonarQube`
4. Clic en **Create**.

### 4.2. Configurar el Servidor SonarQube en Jenkins
1. Ve a **Administrar Jenkins** ➔ **System**.
2. Desplázate hasta la sección **SonarQube servers**:
   - Marca **Enable injection of SonarQube server configuration as build environment variables**.
   - Haz clic en **Add SonarQube**:
     - **Name:** `SonarQube` *(debe llamarse exactamente así para coincidir con `withSonarQubeEnv('SonarQube')`)*
     - **Server URL:** `http://riwi-cine-sonarqube:9000` *(o `http://localhost:9000` si ejecutas Jenkins fuera de Docker)*
     - **Server authentication token:** Selecciona el credencial `sonar-token` creado en el paso anterior.
3. Haz clic en **Apply** y **Save**.

### 4.3. Configurar Webhook en SonarQube (Para Quality Gate Instantáneo)
1. En la interfaz web de SonarQube (`http://localhost:9000`):
   - Ve a **Administration** ➔ **Configuration** ➔ **Webhooks**.
   - Haz clic en **Create**:
     - **Name:** `Jenkins-CI`
     - **URL:** `http://riwi-cine-jenkins:8080/sonarqube-webhook/`
   - Clic en **Create**.

> 💡 **Nota:** Si por alguna razón el webhook no está configurado, el `Jenkinsfile` incluye automáticamente un mecanismo de respaldo (`fallback`) que consulta directamente la API REST de SonarQube (`GET /api/qualitygates/project_status`), garantizando que la validación nunca se quede bloqueada.

---

## 📦 Paso 5: Crear el Job de Pipeline en Jenkins

1. En el panel principal de Jenkins, haz clic en **New Item** (Nueva Tarea).
2. Ingresa el nombre del job: `riwi-cine-ci`.
3. Selecciona el tipo: **Pipeline** y presiona **OK**.
4. En la configuración del Pipeline:
   - Ve a la sección **Build Triggers**:
     - Para ejecución automática local/polling: Marca **Poll SCM** e ingresa el cron `H/5 * * * *` (cada 5 minutos), o
     - Para GitHub Webhook: Marca **GitHub hook trigger for GITScm polling**.
   - En la sección **Pipeline**:
     - **Definition:** `Pipeline script from SCM`
     - **SCM:** `Git`
     - **Repository URL:** `https://github.com/Lneiras/proyecto-riwi-cine-nest.git`
     - **Branch Specifier:** `*/DevOps-project` (o tu rama de trabajo)
     - **Script Path:** `Jenkinsfile`
5. Haz clic en **Save**.

---

## 🚀 Paso 6: Ejecutar y Probar el Pipeline

1. Haz clic en **Build Now** (Construir ahora) en el menú lateral izquierdo del job.
2. Observa la vista en etapas (**Stage View**):
   - `Checkout` ➔ Verde
   - `Install dependencies` ➔ Verde
   - `Lint` ➔ Verde
   - `Unit Tests` ➔ Verde
   - `Coverage` ➔ Verde
   - `SonarQube Analysis` ➔ Verde
   - `Quality Gate` ➔ Verde (Aprobado)
3. Si alguna etapa falla (por ejemplo, si introduces un error de sintaxis en `src/` o rompes una prueba unitaria), Jenkins detendrá inmediatamente el pipeline, marcará la etapa en **Rojo** y no permitirá avanzar al despliegue.
