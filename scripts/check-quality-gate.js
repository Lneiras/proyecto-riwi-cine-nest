import 'dotenv/config';

const hostUrl = (process.env.SONAR_HOST_URL || 'http://localhost:9000').replace(/\/$/, '');
const token = process.env.SONAR_TOKEN || process.env.SONAR_AUTH_TOKEN || '';
const projectKey = process.env.SONAR_PROJECT_KEY || 'riwi-cine-nest';

async function checkQualityGate() {
  console.log(`\n🔍 Verificando Quality Gate en SonarQube para el proyecto: ${projectKey}`);
  console.log(`🌐 Servidor: ${hostUrl}\n`);

  const headers = {};
  if (token) {
    const authHeader = Buffer.from(`${token}:`).toString('base64');
    headers['Authorization'] = `Basic ${authHeader}`;
  }

  const endpoint = `${hostUrl}/api/qualitygates/project_status?projectKey=${encodeURIComponent(projectKey)}`;

  const maxAttempts = 12;
  const delayMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(endpoint, { headers });

      if (response.status === 404) {
        console.error(`❌ Proyecto "${projectKey}" no encontrado en SonarQube.`);
        console.error('Asegúrate de haber ejecutado primero el análisis ("npm run sonar").');
        process.exit(1);
      }

      if (response.status === 401 || response.status === 403) {
        console.error('❌ Error de autenticación con SonarQube. Verifica SONAR_TOKEN.');
        process.exit(1);
      }

      if (!response.ok) {
        console.error(`❌ Respuesta inesperada de SonarQube: HTTP ${response.status}`);
        process.exit(1);
      }

      const data = await response.json();
      const status = data?.projectStatus?.status;

      if (!status) {
        console.log(`⏳ Esperando resultado del análisis (intento ${attempt}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      if (status === 'OK') {
        console.log('✅ ========================================================');
        console.log('   QUALITY GATE: PASSED (OK)');
        console.log('==========================================================');
        console.log('Todas las condiciones de calidad fueron satisfechas exitosamente.\n');
        process.exit(0);
      } else {
        console.error('❌ ========================================================');
        console.error(`   QUALITY GATE: FAILED (${status})`);
        console.error('==========================================================');
        const conditions = data?.projectStatus?.conditions || [];
        const failedConditions = conditions.filter((c) => c.status !== 'OK');

        if (failedConditions.length > 0) {
          console.error('\nCondiciones que no superaron el umbral:');
          failedConditions.forEach((c) => {
            console.error(
              `  - [${c.metricKey}] Valor actual: ${c.actualValue} | Umbral requerido: ${c.errorThreshold} (${c.comparator})`,
            );
          });
        }
        console.error('\nEl pipeline no puede continuar al despliegue.');
        process.exit(1);
      }
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`❌ Error al conectar con SonarQube (${hostUrl}):`, err.message);
        process.exit(1);
      }
      console.log(`⏳ Conectando con SonarQube (intento ${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error('❌ Tiempo de espera agotado para el estado del Quality Gate.');
  process.exit(1);
}

checkQualityGate();
