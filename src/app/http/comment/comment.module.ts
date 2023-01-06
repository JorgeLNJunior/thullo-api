import { BoardService } from '@http/board/board.service'
import { CardService } from '@http/card/card.service'
import { LabelService } from '@http/label/label.service'
import { ListService } from '@http/list/list.service'
import { MemberService } from '@http/member/member.service'
import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'

import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    BoardService,
    ListService,
    MemberService,
    CardService,
    UnsplashService,
    LabelService
  ]
})
export class CommentModule {}
