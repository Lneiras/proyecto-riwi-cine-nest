pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'DEPLOY_FROM_DEVOPS_PROJECT',
            defaultValue: false,
            description: 'Permite desplegar manualmente la rama DevOps-project. main se despliega automaticamente.'
        )
    }

    environment {
        CI = 'true'
        SONAR_PROJECT_KEY = 'riwi-cine-nest'
        DEPLOY_COMPOSE_FILE = 'docker-compose.deploy.yml'
        DEPLOY_PROJECT_NAME = 'riwi-cine-deploy'
        DEPLOY_PORT = '3001'
        DEPLOY_DB_NAME = 'cine_riwi'
        SHOULD_DEPLOY = 'false'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Obteniendo codigo fuente del repositorio...'
                checkout scm
                script {
                    def detectedBranch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''

                    if (!detectedBranch) {
                        detectedBranch = sh(
                            script: 'git name-rev --name-only HEAD 2>/dev/null || true',
                            returnStdout: true
                        ).trim()
                    }

                    detectedBranch = detectedBranch
                        .replaceFirst('^refs/heads/', '')
                        .replaceFirst('^remotes/origin/', '')
                        .replaceFirst('^origin/', '')

                    def isPullRequest = env.CHANGE_ID?.trim()
                    def deployMain = !isPullRequest && detectedBranch == 'main'
                    def deployDevOps = !isPullRequest &&
                        detectedBranch == 'DevOps-project' &&
                        params.DEPLOY_FROM_DEVOPS_PROJECT

                    env.SHOULD_DEPLOY = (deployMain || deployDevOps).toString()
                    echo "Rama detectada: ${detectedBranch ?: 'desconocida'}; despliegue habilitado: ${env.SHOULD_DEPLOY}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Instalando dependencias de forma reproducible...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo 'Ejecutando ESLint...'
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                echo 'Ejecutando pruebas unitarias...'
                sh 'npm test'
            }
        }

        stage('Coverage') {
            steps {
                echo 'Generando cobertura LCOV...'
                sh 'npm run test:cov'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Enviando el analisis a SonarQube...'
                withSonarQubeEnv('SonarQube') {
                    sh 'npm run sonar'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Esperando el Quality Gate del analisis actual...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Compilando la aplicacion NestJS...'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                expression { env.SHOULD_DEPLOY == 'true' }
            }
            steps {
                echo 'Construyendo y actualizando el despliegue Docker...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'riwi-cine-db',
                        usernameVariable: 'DEPLOY_DB_USERNAME',
                        passwordVariable: 'DEPLOY_DB_PASSWORD'
                    ),
                    string(
                        credentialsId: 'riwi-cine-jwt-secret',
                        variable: 'DEPLOY_JWT_SECRET'
                    ),
                    string(
                        credentialsId: 'riwi-cine-jwt-refresh-secret',
                        variable: 'DEPLOY_JWT_REFRESH_SECRET'
                    )
                ]) {
                    sh '''
                        set +x
                        umask 077
                        {
                            printf 'DB_USERNAME=%s\n' "$DEPLOY_DB_USERNAME"
                            printf 'DB_PASSWORD=%s\n' "$DEPLOY_DB_PASSWORD"
                            printf 'DB_DATABASE=%s\n' "$DEPLOY_DB_NAME"
                            printf 'JWT_SECRET=%s\n' "$DEPLOY_JWT_SECRET"
                            printf 'JWT_REFRESH_SECRET=%s\n' "$DEPLOY_JWT_REFRESH_SECRET"
                            printf 'DEPLOY_PORT=%s\n' "$DEPLOY_PORT"
                            printf 'IMAGE_TAG=%s\n' "$BUILD_NUMBER"
                        } > .env.deploy

                        docker compose \
                            --project-name "$DEPLOY_PROJECT_NAME" \
                            --env-file .env.deploy \
                            --file "$DEPLOY_COMPOSE_FILE" \
                            build --pull api

                        docker compose \
                            --project-name "$DEPLOY_PROJECT_NAME" \
                            --env-file .env.deploy \
                            --file "$DEPLOY_COMPOSE_FILE" \
                            up -d --no-build --remove-orphans
                    '''
                }
            }
        }

        stage('Health Check') {
            when {
                expression { env.SHOULD_DEPLOY == 'true' }
            }
            steps {
                echo 'Verificando GET /api/v1/health (HTTP 200, API y base de datos operativas)...'
                sh '''
                    set +x
                    attempt=1
                    max_attempts=12

                    while [ "$attempt" -le "$max_attempts" ]; do
                        if docker compose \
                            --project-name "$DEPLOY_PROJECT_NAME" \
                            --env-file .env.deploy \
                            --file "$DEPLOY_COMPOSE_FILE" \
                            exec -T api node -e '
                                fetch("http://127.0.0.1:3000/api/v1/health")
                                  .then(async (response) => {
                                    const body = await response.json();
                                    if (response.status !== 200 || body.status !== "ok" || body.database?.status !== "up") {
                                      throw new Error(`Health check invalido: HTTP ${response.status}`);
                                    }
                                    console.log("Health check OK: HTTP 200, status=ok, database=up");
                                  })
                                  .catch((error) => { console.error(error.message); process.exit(1); });
                            '; then
                            exit 0
                        fi

                        echo "API aun no disponible (intento $attempt/$max_attempts)."
                        attempt=$((attempt + 1))
                        sleep 5
                    done

                    echo 'El Health Check no fue satisfactorio.' >&2
                    docker compose \
                        --project-name "$DEPLOY_PROJECT_NAME" \
                        --env-file .env.deploy \
                        --file "$DEPLOY_COMPOSE_FILE" \
                        logs --no-color --tail=100 api db
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f .env.deploy'
            echo 'Fin del pipeline CI/CD.'
        }
        success {
            echo 'Pipeline completado: las validaciones requeridas fueron superadas.'
        }
        failure {
            echo 'Pipeline fallido. No se ejecutan etapas posteriores a una validacion fallida.'
        }
    }
}
