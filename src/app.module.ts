import { AuthModule } from '@modules/auth/auth.module'
import { UserModule } from '@modules/user/user.module'
import { Module } from '@nestjs/common'

import { BoardModule } from './app/modules/board/board.module'
import { ConfigModule } from './modules/config.module'
import { PrismaModule } from './modules/prisma.module'
import { RateLimitModule } from './modules/rateLimit.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    RateLimitModule,
    UserModule,
    BoardModule
  ]
})
export class AppModule {}
