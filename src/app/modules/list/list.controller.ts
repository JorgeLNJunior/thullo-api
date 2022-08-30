import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { ListEntity } from './docs/list.entity'
import { ListService } from './list.service'

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

  @ApiOperation({ summary: 'Find a list' })
  @ApiOkResponse({ description: 'OK', type: ListEntity })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @Get(':listId')
  findById(@Param('listId') listId: string) {
    return this.listService.findById(listId)
  }
}
