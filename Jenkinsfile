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
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando pruebas...'
                sh 'npm test'
            }
        }

        stage('Hola') {
            steps {
                echo 'Jenkins está funcionando'
            }
        }

    }
}
