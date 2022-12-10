import { Module } from '@nestjs/common'
import { AuthModule } from '@src/app/http/auth/auth.module'
import { UserModule } from '@src/app/http/user/user.module'

import { AppController } from './app.controller'
import { BoardModule } from './app/http/board/board.module'
import { CardModule } from './app/http/card/card.module'
import { CommentModule } from './app/http/comment/comment.module'
import { LabelModule } from './app/http/label/label.module'
import { ListModule } from './app/http/list/list.module'
import { ConfigModule } from './modules/config.module'
import { PrismaModule } from './modules/prisma.module'
import { RateLimitModule } from './modules/rateLimit.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RateLimitModule,
    AuthModule,
    UserModule,
    BoardModule,
    ListModule,
    CardModule,
    CommentModule,
    LabelModule
  ],
  controllers: [AppController]
})
export class AppModule {}
