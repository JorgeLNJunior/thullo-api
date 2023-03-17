import { execSync } from 'child_process'

function resetAllMigrations() {
  execSync('npx prisma migrate reset --force --skip-generate --skip-seed')
}

export = () => {
  resetAllMigrations()
}
