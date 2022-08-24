import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsValidBoardPipe } from '@modules/board/pipes/isValidBoard.pipe'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { ListEntity } from './docs/list.entity'
import { CreateListDto } from './dto/createList.dto'
import { ListService } from './list.service'

@ApiTags('Boards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @ApiOperation({ summary: 'Create a new list at last position' })
  @ApiCreatedResponse({ description: 'Created', type: ListEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Post()
  create(
    @Param('boardId', IsValidBoardPipe) boardId: string,
    @Body() dto: CreateListDto
  ) {
    return this.listService.create(boardId, dto)
  }

  @ApiOperation({ summary: 'Find all lists of a board' })
  @ApiOkResponse({ description: 'OK', type: ListEntity, isArray: true })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Get()
  findBoardLists(@Param('boardId', IsValidBoardPipe) boardId: string) {
    return this.listService.findBoardLists(boardId)
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
  //   return this.listService.update(+id, updateListDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.listService.remove(+id)
  // }
}
