import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'

import { BoardController } from './board.controller'
import { BoardService } from './board.service'
import { IsUnsplashImageUrlConstraint } from './decorators/isUnsplashImageUrl.decorator'

@Module({
  controllers: [BoardController],
  providers: [BoardService, UnsplashService, IsUnsplashImageUrlConstraint]
})
export class BoardModule {}
