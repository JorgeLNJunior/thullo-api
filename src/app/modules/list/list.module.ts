import { CardService } from '@modules/card/card.service'
import { MemberService } from '@modules/member/member.service'
import { Module } from '@nestjs/common'

import { ListController } from './list.controller'
import { ListService } from './list.service'
import { ListCardController } from './listCard.controller'

@Module({
  controllers: [ListController, ListCardController],
  providers: [ListService, CardService, MemberService]
})
export class ListModule {}
