# 🚀 Guía de Ejecución y Análisis - SonarQube

Este documento detalla el orden exacto de pasos para ejecutar las pruebas, generar la cobertura de código y subir las métricas de **Riwi Cine NestJS API** a tu servidor local de SonarQube.

---

## 📋 Flujo de Trabajo Paso a Paso

### 1. Preparación y Pruebas Locales (Desde la raíz)

Instala las dependencias principales del proyecto:
```bash
npm install
```

Asegúrate de tener instaladas las dependencias necesarias para el escaneo dinámico:
```bash
npm install -D sonarqube-scanner dotenv
```

Ejecuta el linter para validar el formato del código:
```bash
npm run lint
```

Ejecuta tus pruebas unitarias:
```bash
npm test
```

Genera el reporte de cobertura de código (Vitest / Jest):
```bash
npm run test:cov
```

> 🔍 **Comprobación obligatoria:** Verifica visualmente que se haya generado el archivo en la siguiente ruta:
> `coverage/lcov.info`

---

### 2. Levantar e Inicializar SonarQube

Enciende tu contenedor local de SonarQube en segundo plano:
```bash
docker compose up -d sonarqube
```

Espera un par de minutos a que el servicio inicialice por completo y comprueba que esté disponible ingresando en tu navegador a:
👉 **[http://localhost:9000](http://localhost:9000)**

---

### 3. Configuración en la Interfaz Web de SonarQube

1. Inicia sesión en tu panel local (usuario por defecto: `admin` / `admin`).
2. Crea un nuevo proyecto de forma manual utilizando los siguientes datos exactos:
   * **Project Name:** `Riwi Cine NestJS API`
   * **Project Key:** `riwi-cine-nest`
3. Genera un token de análisis exclusivo para este proyecto.
4. Copia el código del token (debería empezar con el prefijo `squ_`).

---

### 4. Configuración Segura del Entorno

Abre el archivo **`.env`** ubicado en la raíz de tu proyecto y añade el token generado. *(Ya no es necesario configurar variables temporales en PowerShell)*:

```env
SONAR_TOKEN=tu_token_aqui_sin_comillas
```

---

### 5. Ejecutar el Análisis

Finalmente, inicia el escáner de código corriendo el script personalizado que interactúa nativamente con Node.js:

```bash
npm run sonar
```

Al finalizar, verás el mensaje `EXECUTION SUCCESS` en tu terminal y podrás refrescar tu panel en `http://localhost:9000` para ver todos los resultados, la deuda técnica y el porcentaje de cobertura de código de tu API.
