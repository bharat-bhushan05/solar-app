pipeline {
    agent {label 'linux'}

    environment {
        NODE_ENV = "test"
        APP_NAME = "solar-app"
        NPM_CONFIG_AUDIT = "false"
        NPM_CONFIG_FUND = "false"
        MONGO_URI = "mongodb+srv://cluster1.5esnosv.mongodb.net/?appName=Cluster1"

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
                        sh 'mkdir -p dependency-check-report'
                        
                        dependencyCheck additionalArguments: '''                                
                                --scan .
                                --format ALL
                                --out dependency-check-report
                                --prettyPrint''', nvdCredentialsId: 'nvd-api-key', odcInstallation: 'OWASP-DepCheck-12-1-5'
                         dependencyCheckPublisher(pattern: 'dependency-check-report/dependency-check-report.xml',failedTotalCritical: 1 )
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
        stage('Unit testing'){ 
            steps{
                    withCredentials([usernamePassword(
                    credentialsId: 'mongo-db-credentials', 
                    passwordVariable: 'MONGO_PASSWORD', 
                    usernameVariable: 'MONGO_USERNAME'
                )]){    
                    sh '''
                        echo "Running Unit Tests..."
                        export MONGO_USERNAME=$MONGO_USERNAME
                        export MONGO_PASSWORD=$MONGO_PASSWORD
                        npm test
                    '''}
                }
        }
        stage('Code coverage'){
            steps{
                sh '''
                    echo "Generating Code Coverage Report..."
                    npm run coverage
                '''
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Code Coverage Report'
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
