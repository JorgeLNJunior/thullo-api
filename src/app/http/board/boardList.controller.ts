import { BadRequestResponse } from '@docs/BadRequest.response'
import { ForbiddenResponse } from '@docs/Forbidden.response'
import { NotFoundResponse } from '@docs/NotFound.response'
import { UnauthorizedResponse } from '@docs/Unauthorized.response'
import { JwtAuthGuard } from '@http/auth/guards/JwtAuth.guard'
import { IsBoardMemberGuard } from '@http/board/guards/isBoardMember.guard'
import { IsValidBoardPipe } from '@http/board/pipes/isValidBoard.pipe'
import { DeleteListResponse } from '@http/list/docs/deleteList.response'
import { ListEntity } from '@http/list/docs/list.entity'
import { CreateListDto } from '@http/list/dto/createList.dto'
import { UpdateListDto } from '@http/list/dto/updateList.dto'
import { ListService } from '@http/list/list.service'
import { IsValidListPipe } from '@http/list/pipes/isValidList.pipe'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'

@ApiTags('Boards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
@UseGuards(JwtAuthGuard, IsBoardMemberGuard)
@Controller('boards/:boardId/lists')
export class BoardListController {
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
  create(@Param('boardId') boardId: string, @Body() dto: CreateListDto) {
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

  @ApiOperation({ summary: 'Update a board list' })
  @ApiOkResponse({ description: 'Updated', type: ListEntity })
  @ApiNotFoundResponse({
    description: 'Board not or list found',
    type: NotFoundResponse
  })
  @Patch(':listId')
  update(
    @Param('boardId') boardId: string,
    @Param('listId', IsValidListPipe) listId: string,
    @Body() dto: UpdateListDto
  ) {
    return this.listService.update(boardId, listId, dto)
  }

  @ApiOperation({ summary: 'Delete a list' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteListResponse })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @Delete(':listId')
  async remove(@Param('listId', IsValidListPipe) listId: string) {
    await this.listService.delete(listId)
    return {
      message: 'the list has been deleted'
    }
  }
}
