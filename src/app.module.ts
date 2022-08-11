import { Module } from '@nestjs/common'

import { AuthModule } from './app/modules/auth/auth.module'
import { ConfigModule } from './modules/config.module'
import { PrismaModule } from './modules/prisma.module'

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule]
})
export class AppModule {}
