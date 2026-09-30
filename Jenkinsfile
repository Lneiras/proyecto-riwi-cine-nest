pipeline {
    agent {
        docker {
            image 'node:22'
        }
    }

    stages {

        stage('Install dependences'){
            steps {
                echo 'installing dependences...'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando pruebas...'
                sh 'npm test'
            }
        }

        stage('Check SonarScanner') {
            steps {
                sh 'which sonar-scanner'
                sh 'sonar-scanner --version'
            }
        }


        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=riwi-cine \
                          -Dsonar.sources=src
                    '''
                }
            }
        }

        stage('Hola') {
            steps {
                echo 'Jenkins está funcionando'
            }
        }

    }
}
