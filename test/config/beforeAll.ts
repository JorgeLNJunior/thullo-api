import { execSync } from 'child_process'

import { DATABASE_URL, JWT_ACCESS_TOKEN_SECRET } from './envVars'

function executeAllMigrations() {
  execSync(`DATABASE_URL=${DATABASE_URL} npx prisma migrate deploy`)
}

function setTestEnvVariables() {
  process.env.DATABASE_URL = DATABASE_URL
  process.env.JWT_ACCESS_TOKEN_SECRET = JWT_ACCESS_TOKEN_SECRET
}

export = () => {
  setTestEnvVariables()
  executeAllMigrations()
}
