import { Module } from '@nestjs/common'

import { AuthModule } from './app/modules/auth/auth.module'
import { ConfigModule } from './modules/config.module'
import { PrismaModule } from './modules/prisma.module'
import { RateLimitModule } from './modules/rateLimit.module'

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, RateLimitModule]
})
export class AppModule {}
