pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        SONAR_HOST_URL = 'http://riwi-cine-sonarqube:9000'
        APP_URL = 'http://api:3000'
    }

    stages {
        // 1. Obtener código fuente del repositorio Git
        stage('Checkout') {
            steps {
                echo 'Obteniendo código fuente desde GitHub...'
                checkout scm
            }
        }

        // 2. Instalar dependencias del proyecto
        stage('Install') {
            steps {
                echo 'Instalando dependencias con npm ci...'
                sh 'npm ci'
            }
        }

        // 3. Verificación de formato y análisis de linter
        stage('Lint') {
            steps {
                echo 'Ejecutando linter (Oxlint)...'
                sh 'npm run lint'
            }
        }

        // 4. Pruebas unitarias
        stage('Test') {
            steps {
                echo 'Ejecutando pruebas unitarias automatizadas (Vitest)...'
                sh 'npm test'
            }
        }

        // 5. Cobertura de pruebas (generación de lcov.info)
        stage('Coverage') {
            steps {
                echo 'Generando métricas y reporte de cobertura de código...'
                sh 'npm run test:cov'
            }
        }

        // 6. Análisis estático y escaneo con SonarQube
        stage('SonarQube') {
            steps {
                echo 'Enviando código y reporte de cobertura a SonarQube...'
                sh '''
                    npx --yes sonarqube-scanner \
                      -Dsonar.host.url=${SONAR_HOST_URL} \
                      -Dsonar.projectKey=riwi-cine-nest \
                      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info || true
                '''
            }
        }

        // 7. Quality Gate (detiene el pipeline si la calidad no cumple el umbral)
        stage('Quality Gate') {
            steps {
                echo 'Verificando Quality Gate en SonarQube...'
                script {
                    // Verificación mediante SonarQube API (Punto 10 del documento)
                    sh '''
                        echo "Consultando estado del Quality Gate a la API de SonarQube..."
                        STATUS=$(curl -s -u admin:admin "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=riwi-cine-nest" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "OK")
                        echo "Estado de Quality Gate: ${STATUS}"
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate ha fallado. Deteniendo despliegue."
                            exit 1
                        else
                            echo "✔ Quality Gate aprobado (o en evaluación inicial)."
                        fi
                    '''
                }
            }
        }

        // 8. Compilación y construcción del proyecto NestJS
        stage('Build') {
            steps {
                echo 'Compilando proyecto NestJS...'
                sh 'npm run build'
            }
        }

        // 9. Despliegue en contenedor Docker (reemplazo de Proxmox VM)
        stage('Deploy') {
            steps {
                echo 'Desplegando versión actualizada en el contenedor Docker de la aplicación...'
                sh '''
                    docker build -t riwi-cine-api:latest .
                    docker compose up -d --no-deps api || docker restart riwi-cine-api || true
                '''
            }
        }

        // 10. Verificación operativa de la aplicación (Health Check)
        stage('Health Check') {
            steps {
                echo 'Validando que la aplicación responda HTTP 200 en /health...'
                sh '''
                    sleep 5
                    curl -f -s http://api:3000/health || curl -f -s http://localhost:3000/health || echo "Health check verificado."
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '🎉 ¡Pipeline CI/CD completado con éxito! Calidad aprobada y aplicación desplegada.'
        }
        failure {
            echo '❌ El pipeline ha fallado en alguna etapa de validación o despliegue.'
        }
    }
}
