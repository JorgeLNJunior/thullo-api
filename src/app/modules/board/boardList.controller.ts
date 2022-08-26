import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsBoardMemberGuard } from '@modules/board/guards/isBoardMember.guard'
import { IsValidBoardPipe } from '@modules/board/pipes/isValidBoard.pipe'
import { ListEntity } from '@modules/list/docs/list.entity'
import { CreateListDto } from '@modules/list/dto/createList.dto'
import { UpdateListDto } from '@modules/list/dto/updateList.dto'
import { ListService } from '@modules/list/list.service'
import { IsValidListPipe } from '@modules/list/pipes/isValidList.pipe'
import {
  Body,
  Controller,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

@ApiTags('Boards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
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
  @UseGuards(IsBoardMemberGuard)
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
  @UseGuards(IsBoardMemberGuard)
  @Patch(':listId')
  update(
    @Param('boardId') boardId: string,
    @Param('listId', IsValidListPipe) listId: string,
    @Body() dto: UpdateListDto
  ) {
    return this.listService.update(boardId, listId, dto)
  }
}
