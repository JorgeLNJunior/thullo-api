import { Module } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'

import { BoardController } from './board.controller'
import { BoardService } from './board.service'

@Module({
  controllers: [BoardController],
  providers: [BoardService, UnsplashService]
})
export class BoardModule {}