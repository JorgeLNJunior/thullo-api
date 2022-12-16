import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
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
import { BadRequestResponse } from '@src/app/docs/BadRequest.response'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'
import { JwtAuthGuard } from '@src/app/http/auth/guards/JwtAuth.guard'

import { BoardService } from './board.service'
import { BoardEntity } from './docs/board.entity'
import { DeleteBoardResponse } from './docs/deleteBoard.response'
import { CreateBoardDto } from './dto/createBoard.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { IsBoardAdminGuard } from './guards/isBoardAdmin.guard'
import { FindBoardsQuery } from './query/findBoards.query'
import { FindOneBoardQuery } from './query/findOneBoard.query'

@ApiTags('Boards')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiOperation({ summary: 'Create a board' })
  @ApiCreatedResponse({ description: 'Created', type: BoardEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @Post()
  create(@Body() dto: CreateBoardDto, @Request() req) {
    return this.boardService.create(req.user.id, dto)
  }

  @ApiOperation({ summary: 'Find many boards' })
  @ApiOkResponse({ description: 'Ok', type: BoardEntity, isArray: true })
  @ApiBadRequestResponse({
    description: 'Query validation error',
    type: BadRequestResponse
  })
  @Get()
  findMany(@Query() query: FindBoardsQuery, @Req() req) {
    return this.boardService.findMany(query, req.user.id)
  }

  @ApiOperation({ summary: 'Find a board by ID' })
  @ApiOkResponse({ description: 'Ok', type: BoardEntity })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Get(':boardId')
  findOne(
    @Param('boardId') boardId: string,
    @Query() query: FindOneBoardQuery
  ) {
    return this.boardService.findOne(boardId, query)
  }

  @ApiOperation({ summary: 'Update a board' })
  @ApiOkResponse({ description: 'Deleted', type: BoardEntity })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Patch(':boardId')
  update(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto
  ) {
    return this.boardService.update(boardId, updateBoardDto)
  }

  @ApiOperation({ summary: 'Delete a board' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteBoardResponse })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Delete(':boardId')
  async delete(@Param('boardId') boardId: string) {
    await this.boardService.delete(boardId)
    return {
      message: 'the board has been deleted'
    }
  }
}
