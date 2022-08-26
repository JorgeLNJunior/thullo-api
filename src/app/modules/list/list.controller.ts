import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsBoardMemberGuard } from '@modules/board/guards/isBoardMember.guard'
import { Controller, Delete, Param, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { DeleteListResponse } from './docs/deleteList.response'
import { ListService } from './list.service'
import { IsValidListPipe } from './pipes/isValidList.pipe'

@ApiTags('Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  // @ApiOperation({ summary: 'Delete a list' })
  // @ApiOkResponse({ description: 'Deleted', type: DeleteListResponse })
  // @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  // @ApiNotFoundResponse({
  //   description: 'List not found',
  //   type: NotFoundResponse
  // })
  // @UseGuards(IsBoardMemberGuard)
  // @Delete(':listId')
  // async remove(@Param('listId', IsValidListPipe) listId: string) {
  //   await this.listService.delete(listId)
  //   return {
  //     message: 'the list has been deleted'
  //   }
  // }
}
