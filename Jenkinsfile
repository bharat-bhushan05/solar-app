pipeline {
    agent {label 'linux'}

    environment {
        NODE_ENV = "test"
        APP_NAME = "solar-app"
        NPM_CONFIG_AUDIT = "false"
        NPM_CONFIG_FUND = "false"
    }

    tools {
        nodejs "nodejs-22-6-0" 
    }

    stages {
        stage('Verify Node & NPM Version') {
            steps {
                sh '''
                    echo "Node Version:"
                    node -v

                    echo "NPM Version:"
                    npm -v
                '''}}

        /* ================================
           Fix Dependencies
        ================================= */
        stage('Install & Fix Dependencies') {
            steps {
                sh '''
                    npm cache clean --force
                    npm install
                    npm dedupe
                '''
            }
        }

        /* ================================
           Dependency Scanning (Parallel)
        ================================= */
        stage('Dependency Scanning') {
            parallel {

                /* ---------- OWASP Dependency Check ---------- */
                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck additionalArguments: '''
                            --scan .
                            --format XML,HTML
                            --out dependency-check-report
                        ''',
                        odcInstallation: 'OWASP-Dependency-Check'
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'dependency-check-report/**', fingerprint: true
                        }
                    }
                }

                /* ---------- NPM Dependency Audit ---------- */
                stage('NPM Dependency Audit & Fix') {
                    steps {
                        sh '''
                            echo "Running npm audit..."
                            npm audit || true

                            echo "Attempting automatic fixes..."
                            npm audit fix || true
                        '''
                    }
                }
            }
        }

        /* ================================
           Publish Reports
        ================================= */
        stage('Publish Reports') {
            steps {
                dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'

                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'dependency-check-report',
                    reportFiles: 'dependency-check-report.html',
                    reportName: 'OWASP Dependency Check Report'
                ])
            }
        }
    }

    /* ================================
       Post Actions
    ================================= */
    post {
        success {
            echo "✅ Pipeline completed successfully for ${APP_NAME}"
        }
        failure {
            echo "❌ Pipeline failed for ${APP_NAME}"
        }
        always {
            cleanWs()
        }
    }
}
