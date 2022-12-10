import { Module } from '@nestjs/common'
import { ListService } from '@src/app/http/list/list.service'
import { MemberService } from '@src/app/http/member/member.service'

import { CardController } from './card.controller'
import { CardService } from './card.service'

@Module({
  controllers: [CardController],
  providers: [CardService, MemberService, ListService]
})
export class CardModule {}
