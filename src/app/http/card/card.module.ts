import { ListService } from '@http/list/list.service'
import { MemberService } from '@http/member/member.service'
import { Module } from '@nestjs/common'

import { CardController } from './card.controller'
import { CardService } from './card.service'

@Module({
  controllers: [CardController],
  providers: [CardService, MemberService, ListService]
})
export class CardModule {}
