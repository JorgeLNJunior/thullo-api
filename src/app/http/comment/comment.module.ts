import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'
import { BoardService } from '@src/app/http/board/board.service'
import { CardService } from '@src/app/http/card/card.service'
import { LabelService } from '@src/app/http/label/label.service'
import { ListService } from '@src/app/http/list/list.service'
import { MemberService } from '@src/app/http/member/member.service'

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
