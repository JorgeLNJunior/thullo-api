import { BoardService } from '@modules/board/board.service'
import { CardService } from '@modules/card/card.service'
import { LabelService } from '@modules/label/label.service'
import { ListService } from '@modules/list/list.service'
import { MemberService } from '@modules/member/member.service'
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
