import 'dotenv/config';
import sonarqubeScanner from 'sonarqube-scanner';

async function runAnalysis() {
  const options = {};

  const token = process.env.SONAR_TOKEN || process.env.SONAR_AUTH_TOKEN;
  if (token) {
    options['sonar.token'] = token;
  }

  if (process.env.SONAR_HOST_URL) {
    options['sonar.host.url'] = process.env.SONAR_HOST_URL;
  }

  try {
    await sonarqubeScanner(
      {
        options,
      },
      (error) => {
        if (error) {
          console.error('❌ Error durante el análisis de SonarQube:', error);
          process.exit(1);
        }
        console.log('✅ ¡Análisis de SonarQube completado con éxito!');
      },
    );
  } catch (error) {
    console.error('❌ Error durante el análisis de SonarQube:', error);
    process.exit(1);
  }
}

runAnalysis();
