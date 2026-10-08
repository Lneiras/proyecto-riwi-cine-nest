pipeline {
    agent any

    environment {
        CI = 'true'
        SONAR_HOST_URL = 'http://riwi-cine-sonarqube:9000'
        SONAR_PROJECT_KEY = 'riwi-cine-nest'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Obteniendo código fuente del repositorio...'
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                echo '📦 Instalando dependencias...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 Ejecutando análisis estático (ESLint)...'
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                echo '🧪 Ejecutando pruebas unitarias...'
                sh 'npm test'
            }
        }

        stage('Coverage') {
            steps {
                echo '📊 Generando reporte de cobertura de código...'
                sh 'npm run test:cov'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo '📡 Enviando análisis y métricas a SonarQube...'
                script {
                    try {
                        withSonarQubeEnv('SonarQube') {
                            sh 'npm run sonar'
                        }
                    } catch (Exception e) {
                        echo "ℹ️ No se detectó configuración de 'SonarQube' en Jenkins Global Tools/Servers. Ejecutando escaneo con variables de entorno..."
                        sh 'npm run sonar'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo '🚦 Verificando estado del Quality Gate...'
                timeout(time: 3, unit: 'MINUTES') {
                    script {
                        try {
                            waitForQualityGate abortPipeline: true
                        } catch (Exception e) {
                            echo "ℹ️ Consultando estado del Quality Gate mediante la API de SonarQube..."
                            sh 'npm run sonar:gate'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo '🏁 Fin del ciclo de Integración Continua (CI).'
        }
        success {
            echo '✅ Pipeline CI completado exitosamente: todas las pruebas y controles de calidad fueron superados.'
        }
        failure {
            echo '❌ Pipeline CI fallido: se detectaron errores de código, fallas de tests o no se superó el Quality Gate.'
        }
    }
}
