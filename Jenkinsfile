pipeline {
    agent any {
        docker {
            image 'node:22'
            args '-u root'
        }
    }

    stages {

        stage('Install dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando pruebas...'
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'

                        echo "SonarScanner encontrado en: ${scannerHome}"

                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=riwi-cine \
                              -Dsonar.sources=src
                        """
                    }
                }
            }
        }

        stage('Hola') {
            steps {
                echo 'Pipeline terminado correctamente'
            }
        }
    }
}
