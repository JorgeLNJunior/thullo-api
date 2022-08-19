import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { BoardService } from './board.service'
import { BoardEntity } from './docs/board.entity'
import { DeleteBoardResponse } from './docs/deleteBoard.response'
import { MemberEntity } from './docs/member.entity'
import { AddMemberDto } from './dto/addMember.dto'
import { CreateBoardDto } from './dto/createBoard.dto'
import { CanAddMembersGuard } from './guards/canAddMembers.guard'
import { CanDeleteBoardGuard } from './guards/canDeleteBoard.guard'
import { FindBoardsQuery } from './query/findBoards.query'

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

  @ApiCreatedResponse({ description: 'Created', type: BoardEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @Post()
  create(@Body() dto: CreateBoardDto, @Request() req) {
    return this.boardService.create(req.user.id, dto)
  }

  @ApiOkResponse({ description: 'Ok', type: BoardEntity, isArray: true })
  @ApiBadRequestResponse({
    description: 'Query validation error',
    type: BadRequestResponse
  })
  @Get()
  findMany(@Query() query: FindBoardsQuery) {
    return this.boardService.findMany(query)
  }

  @ApiOkResponse({ description: 'Ok', type: BoardEntity })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findById(id)
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
  //   return this.boardService.update(+id, updateBoardDto)
  // }

  @ApiOkResponse({ description: 'Deleted', type: DeleteBoardResponse })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiBadRequestResponse({
    description: 'Invalid board id',
    type: BadRequestResponse
  })
  @UseGuards(CanDeleteBoardGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.boardService.delete(id)
    return {
      message: 'the board has been deleted'
    }
  }

  @ApiOperation({ summary: 'Add a member to a board' })
  @ApiBody({ type: AddMemberDto, required: false })
  @ApiOkResponse({ description: 'Member added', type: MemberEntity })
  @ApiBadRequestResponse({
    description: 'Invalid params',
    type: BadRequestResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @UseGuards(CanAddMembersGuard)
  @Put(':id/members/:userId')
  async addMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Body() dto?: AddMemberDto
  ) {
    return this.boardService.addMember(boardId, userId, dto)
  }
}
