import { ListService } from '@modules/list/list.service'
import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'

import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { BoardListController } from './boardList.controller'
import { BoardMemberController } from './boardMember.controller'
import { IsUnsplashImageUrlConstraint } from './decorators/isUnsplashImageUrl.decorator'

@Module({
  controllers: [BoardController, BoardMemberController, BoardListController],
  providers: [
    BoardService,
    UnsplashService,
    IsUnsplashImageUrlConstraint,
    ListService
  ]
})
export class BoardModule {}
