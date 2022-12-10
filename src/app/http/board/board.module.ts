import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'
import { LabelService } from '@src/app/http/label/label.service'
import { ListService } from '@src/app/http/list/list.service'

import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { BoardLabelController } from './boardLabel.controller'
import { BoardListController } from './boardList.controller'
import { BoardMemberController } from './boardMember.controller'
import { IsUnsplashImageUrlConstraint } from './decorators/isUnsplashImageUrl.decorator'

@Module({
  controllers: [
    BoardController,
    BoardMemberController,
    BoardListController,
    BoardLabelController
  ],
  providers: [
    BoardService,
    UnsplashService,
    IsUnsplashImageUrlConstraint,
    ListService,
    LabelService
  ]
})
export class BoardModule {}
