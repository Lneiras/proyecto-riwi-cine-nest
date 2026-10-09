# Día 5: CD y despliegue automatizado con Jenkins y Docker

## 1. Objetivo

Extender la integración continua existente hasta un flujo seguro de entrega y
despliegue:

```text
GitHub -> Jenkins -> Checkout -> npm ci -> Lint -> Tests -> Coverage
       -> SonarQube -> Quality Gate -> Build -> Docker Deploy -> Health Check
```

El despliegue solo se habilita automáticamente para `main`. La rama
`DevOps-project` se puede probar manualmente activando el parámetro
`DEPLOY_FROM_DEVOPS_PROJECT`. Los pull requests y las demás ramas nunca
despliegan.

## 2. Continuous Delivery y Continuous Deployment

- **Continuous Delivery** deja cada cambio aprobado listo para desplegar y
  permite una autorización manual. Es el comportamiento usado para
  `DevOps-project`.
- **Continuous Deployment** publica automáticamente cada cambio que supera
  todos los controles. Es el comportamiento preparado para `main`.

El orden de etapas de Jenkins hace que cualquier fallo de lint, pruebas,
cobertura, SonarQube, Quality Gate o compilación impida llegar a `Deploy`.

## 3. Arquitectura Docker

`docker-compose.yml` mantiene la infraestructura de desarrollo y CI:
Jenkins, SonarQube, sus bases de datos, pgAdmin y la API de desarrollo. Todos
usan la red Compose `cine-network`. Jenkins monta
`/var/run/docker.sock`, por lo que el Docker CLI del contenedor controla el
Docker Engine del host. Este acceso equivale a privilegios administrativos
sobre Docker y debe limitarse a administradores del job.

SonarQube se fija en `26.9.0.129388-community`. La etiqueta histórica
`lts-community` resolvía a 9.9.8 y su analizador omitía el código al no
entender las opciones de TypeScript 6.

Si ya existe un volumen creado por SonarQube 9.9, no se debe recrear el
contenedor directamente con 26.9: primero hay que respaldar PostgreSQL y los
volúmenes y seguir la ruta de actualización soportada por SonarSource, o
inicializar volúmenes nuevos. El cambio de imagen es directo únicamente para
una instalación nueva.

El Compose adopta la segunda opción segura: SonarQube 26.9 usa los volúmenes
`riwi-cine-sonar26-*`. Los volúmenes históricos creados por Compose para
9.9 no se eliminan ni se migran automáticamente y pueden conservarse para
respaldo o rollback.

`docker-compose.deploy.yml` es un proyecto separado:

```text
Jenkins --Docker socket--> proyecto riwi-cine-deploy
                         |-- api (NestJS, host:3001 -> container:3000)
                         `-- db  (PostgreSQL 16)
                              `-- volumen riwi-cine-deploy-postgres-data
```

No define nombres fijos de contenedor. La red y el volumen tienen nombres
estables, no colisionan con CI y el pipeline nunca ejecuta `down -v`.
`--remove-orphans` solo afecta servicios del proyecto
`riwi-cine-deploy`; no puede recrear ni eliminar Jenkins o SonarQube.

## 4. Etapas nuevas y controles

- **Build:** ejecuta `npm run build` después del Quality Gate.
- **Deploy:** crea un archivo temporal `.env.deploy` con permisos
  restrictivos, construye la imagen multi-stage y ejecuta
  `docker compose up -d --no-build --remove-orphans`.
- **Health Check:** realiza hasta 12 intentos, separados por 5 segundos,
  contra `GET /api/v1/health` desde el contenedor de la API. Exige HTTP 200,
  `status=ok` y `database.status=up`. Ante el último fallo muestra los
  logs y termina el pipeline con error.

El endpoint correcto incluye el prefijo global configurado en NestJS:
`/api/v1/health`.

El Quality Gate usa `waitForQualityGate abortPipeline: true` sin capturar
excepciones. Así un estado rechazado, un timeout o un webhook mal configurado
detienen el pipeline. El script `npm run sonar:gate`, disponible para
diagnóstico manual, lee `.scannerwork/report-task.txt`, espera la tarea CE
exacta y consulta por su `analysisId`; nunca consulta simplemente el último
resultado del proyecto.

## 5. Archivos del Día 5

- `Jenkinsfile`: pipeline CI/CD, control de ramas, credenciales, despliegue
  y health check.
- `docker-compose.deploy.yml`: runtime aislado de API y PostgreSQL.
- `Dockerfile`: instalaciones reproducibles con `npm ci`.
- `docker/jenkins/Dockerfile`: añade Docker Compose CLI y Buildx.
- `scripts/check-quality-gate.js`: valida el análisis actual, no uno antiguo.
- `src/main.ts`: conserva `health` bajo el prefijo global para que el
  endpoint real sea `/api/v1/health`.
- `package.json`, `package-lock.json` y los archivos `vitest.config*`:
  usan la resolución nativa de paths de Vite y eliminan un peer dependency
  incompatible con TypeScript 6 y npm 10.
- `.env.example`, `.gitignore` y `.dockerignore`: ejemplos seguros y
  exclusión del archivo temporal.
- `README.md`: enlace a esta guía.

## 6. Jenkins Credentials

En **Manage Jenkins > Credentials > System > Global credentials**, crear:

| ID | Tipo | Contenido |
| --- | --- | --- |
| `sonar-token` | Secret text | Token de análisis de SonarQube |
| `riwi-cine-db` | Username with password | Usuario y clave PostgreSQL de despliegue |
| `riwi-cine-jwt-secret` | Secret text | Secreto aleatorio para access tokens |
| `riwi-cine-jwt-refresh-secret` | Secret text | Secreto aleatorio distinto para refresh tokens |

No incluir secretos en el Jenkinsfile ni en Git. Jenkins enmascara las
variables y el pipeline usa `set +x` para no imprimir comandos con valores.
El archivo temporal se elimina en `post { always { ... } }`.

En **Manage Jenkins > System > SonarQube servers**, crear el servidor
`SonarQube`, URL `http://riwi-cine-sonarqube:9000`, y asociar
`sonar-token`.

## 7. Variables de despliegue

Las obligatorias son `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`,
`JWT_SECRET` y `JWT_REFRESH_SECRET`. El Compose fija
`NODE_ENV=production` y `DB_SYNCHRONIZE=false`. Variables opcionales:
`DEPLOY_PORT` (3001), `APP_IMAGE`, `IMAGE_TAG`, `JWT_EXPIRES_IN` y
`JWT_REFRESH_EXPIRES_IN`.

El Compose de despliegue no posee valores predeterminados para secretos.

## 8. Construir la imagen

Con un `.env.deploy` local no versionado:

```bash
docker compose --project-name riwi-cine-deploy \
  --env-file .env.deploy \
  --file docker-compose.deploy.yml build api
```

El Dockerfile compila con Node 22 y la imagen final solo instala dependencias
de producción.

## 9. Despliegue manual

Crear `.env.deploy` con valores reales fuera de Git:

```dotenv
DB_USERNAME=cine_app
DB_PASSWORD=<valor-secreto>
DB_DATABASE=cine_riwi
JWT_SECRET=<valor-aleatorio-largo>
JWT_REFRESH_SECRET=<otro-valor-aleatorio-largo>
DEPLOY_PORT=3001
IMAGE_TAG=manual
```

Validar y desplegar:

```bash
docker compose -p riwi-cine-deploy --env-file .env.deploy \
  -f docker-compose.deploy.yml config --quiet
docker compose -p riwi-cine-deploy --env-file .env.deploy \
  -f docker-compose.deploy.yml up -d --build
```

Para actualizar se repite el último comando. Para detener sin borrar datos:

```bash
docker compose -p riwi-cine-deploy --env-file .env.deploy \
  -f docker-compose.deploy.yml down
```

No usar `down -v`: eliminaría el volumen persistente de PostgreSQL.

## 10. Preparar base de datos y migraciones

Producción nunca usa sincronización automática. Antes del primer despliegue se
deben generar y revisar migraciones contra una base de desarrollo:

```bash
npm run build
npm run migration:generate -- src/database/migrations/InitialMigration
```

La migración revisada debe quedar versionada. Después de levantar el runtime:

```bash
docker compose -p riwi-cine-deploy --env-file .env.deploy \
  -f docker-compose.deploy.yml exec -T api npm run migration:run
```

Actualmente el proyecto tiene configurado TypeORM para buscar
`dist/database/migrations/*.js`, pero no contiene una migración inicial
versionada. Generarla con el esquema definitivo es un requisito previo para
usar las funciones de negocio en una base vacía.

## 11. Ejecutar mediante Jenkins

Reconstruir una vez la imagen de Jenkins para instalar Compose CLI y Buildx,
sin tocar SonarQube:

```bash
docker compose build jenkins
docker compose up -d --no-deps jenkins
docker exec riwi-cine-jenkins docker compose version
docker exec riwi-cine-jenkins docker buildx version
```

Instalar los plugins **Pipeline**, **Git**, **GitHub**, **Credentials
Binding** y **SonarQube Scanner for Jenkins**. Crear un Pipeline Multibranch
o un job “Pipeline script from SCM” que use este repositorio y
`Jenkinsfile`.

- En `main`: una ejecución aprobada despliega automáticamente.
- En `DevOps-project`: usar **Build with Parameters** y marcar
  `DEPLOY_FROM_DEVOPS_PROJECT`.
- En otra rama o PR: se ejecuta CI y se omiten Deploy/Health Check.

## 12. Webhooks y automatización

En SonarQube crear el webhook:
`http://riwi-cine-jenkins:8080/sonarqube-webhook/`. La barra final es
obligatoria.

En GitHub, **Settings > Webhooks > Add webhook**:

- Payload URL: `https://<jenkins-publico>/github-webhook/`.
- Content type: `application/json`.
- Evento: push (y pull requests si se desea validar PR).
- Secret: configurarlo en GitHub/Jenkins si la instalación lo soporta.

En Jenkins habilitar **GitHub hook trigger for GITScm polling**, o usar
Multibranch con escaneo por webhook. Jenkins debe ser alcanzable desde
GitHub; `localhost` no sirve para un webhook de GitHub.com. Una alternativa
de laboratorio es **Poll SCM**, pero añade demora.

Proteger `main` en GitHub con pull request obligatorio, al menos una
aprobación y los checks de CI requeridos. De ese modo un push a `main`
representa un cambio revisado antes de activar Continuous Deployment.

Comprobar la entrega en la pestaña **Recent Deliveries** de GitHub y verificar
que un push aprobado a `main` genere un build. El guard del Jenkinsfile es
la protección adicional que evita despliegues de features y PR.

## 13. Verificar el Health Check

Desde el host:

```bash
curl --fail http://localhost:3001/api/v1/health
```

La respuesta debe ser HTTP 200 y contener:

```json
{"status":"ok","database":{"status":"up"}}
```

También se puede revisar:

```bash
docker compose -p riwi-cine-deploy --env-file .env.deploy \
  -f docker-compose.deploy.yml ps
```

## 14. Diagnóstico frecuente

- **`docker: permission denied`:** confirmar el socket montado y que el
  contenedor Jenkins se ejecuta con permisos suficientes. No exponer el
  socket a jobs no confiables.
- **Falta Compose o Buildx:** reconstruir Jenkins con
  `docker-compose-plugin` y `docker-buildx-plugin`.
- **Quality Gate timeout:** comprobar el webhook de SonarQube, su entrega y
  el nombre exacto del servidor `SonarQube` en Jenkins.
- **El análisis omite TypeScript:** comprobar que SonarQube no sea la antigua
  versión 9.9 y que el log muestre todos los archivos TypeScript analizados.
- **Credencial no encontrada:** los IDs deben coincidir exactamente con la
  tabla anterior y estar en el alcance del job.
- **Puerto 3001 ocupado:** cambiar `DEPLOY_PORT` de manera coordinada.
- **API unhealthy:** ejecutar `docker compose ... logs api db`; confirmar
  credenciales, salud de PostgreSQL y migraciones.
- **Imagen antigua:** revisar que `IMAGE_TAG` sea el número de build actual
  y que la etapa Docker build haya terminado.
- **Datos ausentes tras recrear:** confirmar que existe el volumen
  `riwi-cine-deploy-postgres-data` y que nadie ejecutó `down -v`.

## 15. Evidencias para el instructor

Capturar:

1. Stage View completo en verde, incluyendo Build, Deploy y Health Check.
2. Consola del Quality Gate mostrando el análisis actual aprobado.
3. `docker compose ... ps` con `api` y `db` healthy.
4. Respuesta HTTP 200 de `/api/v1/health`.
5. Volumen persistente listado con `docker volume inspect`.
6. Nueva ejecución tras un push aprobado a `main`.
7. Ejemplo controlado donde un test o Quality Gate falla y Deploy queda
   omitido.
8. Configuración de credenciales mostrando solo IDs, nunca sus valores.

## 16. Criterio de aceptación

El repositorio implementa el flujo y sus protecciones. La demostración final
requiere un Docker Engine activo, Jenkins con plugins/credenciales, SonarQube
con webhook y acceso entrante desde GitHub. Esas configuraciones externas no
se pueden versionar ni sustituir con secretos de ejemplo.
