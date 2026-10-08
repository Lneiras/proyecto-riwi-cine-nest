import 'dotenv/config';
import sonarqubeScanner from 'sonarqube-scanner';

async function runAnalysis() {
  try {
    await sonarqubeScanner({
      options: {
        'sonar.token': process.env.SONAR_TOKEN,
        'sonar.login': process.env.SONAR_TOKEN
      }
    }, () => {}); // <--- Esta función vacía evita el TypeError interno
    console.log('¡Análisis completado con éxito!');
  } catch (error) {
    console.error('Error durante el análisis:', error);
  }
}

runAnalysis();
