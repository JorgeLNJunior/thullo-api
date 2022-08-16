import { execSync } from 'child_process'

const DATABASE_URL = 'mysql://root:root@localhost:3306/thullo_test'

function executeAllMigrations() {
  execSync(`DATABASE_URL=${DATABASE_URL} npx prisma migrate deploy`)
}

function setTestEnvVariables() {
  process.env.DATABASE_URL = DATABASE_URL
  process.env.JWT_ACCESS_TOKEN_SECRET = 'fh37flsjf8'
}

export = () => {
  setTestEnvVariables()
  executeAllMigrations()
}
