import { AssignmentModule } from '@http/assignment/assignment.module'
import { AuthModule } from '@http/auth/auth.module'
import { UserModule } from '@http/user/user.module'
import { Module } from '@nestjs/common'

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
    LabelModule,
    AssignmentModule
  ],
  controllers: [AppController]
})
export class AppModule {}
