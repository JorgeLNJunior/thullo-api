import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsValidUserPipe } from '@modules/user/pipes/isValidUser.pipe'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { MemberWithUserEntity } from './docs/memberWithUser.entity'
import { RemoveMemberResponse } from './docs/removeMember.response'
import { AddMemberDto } from './dto/addMember.dto'
import { CreateBoardDto } from './dto/createBoard.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { UpdateMemberRoleDto } from './dto/updateRole.dto'
import { IsBoardAdminGuard } from './guards/isBoardAdmin.guard'
import { IsValidBoardPipe } from './pipes/isValidBoard.pipe'
import { FindBoardMembersQuery } from './query/findBoardMembers.query'
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
  findMany(@Query() query: FindBoardsQuery) {
    return this.boardService.findMany(query)
  }

  @ApiOperation({ summary: 'Find a board by ID' })
  @ApiOkResponse({ description: 'Ok', type: BoardEntity })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findById(id)
  }

  @ApiOperation({ summary: 'Update a board' })
  @ApiOkResponse({ description: 'Deleted', type: BoardEntity })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(id, updateBoardDto)
  }

  @ApiOperation({ summary: 'Delete a board' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteBoardResponse })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.boardService.delete(id)
    return {
      message: 'the board has been deleted'
    }
  }

  @ApiOperation({ summary: 'Find members from a board' })
  @ApiOkResponse({
    description: 'Member added',
    type: MemberWithUserEntity,
    isArray: true
  })
  @ApiBadRequestResponse({
    description: 'Invalid params',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @Get(':id/members')
  async findMembers(
    @Param(':id', IsValidBoardPipe) id: string,
    @Query() query?: FindBoardMembersQuery
  ) {
    return this.boardService.findMembers(id, query)
  }

  @ApiOperation({ summary: 'Add a member to a board' })
  @ApiBody({ type: AddMemberDto, required: false })
  @ApiOkResponse({ description: 'Member added', type: MemberEntity })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board or user not found',
    type: NotFoundResponse
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Put(':id/members/:userId')
  async addMember(
    @Param('id') boardId: string,
    @Param('userId', IsValidUserPipe) userId: string,
    @Body() dto: AddMemberDto
  ) {
    return this.boardService.addMember(boardId, userId, dto)
  }

  @ApiOperation({ summary: 'Remove a member from a board' })
  @ApiOkResponse({ description: 'Member removed', type: RemoveMemberResponse })
  @ApiBadRequestResponse({
    description: 'Invalid userId param',
    type: BadRequestResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string
  ) {
    await this.boardService.removeMember(boardId, userId)
    return {
      message: 'the member has been removed'
    }
  }

  @ApiOperation({ summary: 'Update a member role' })
  @ApiOkResponse({
    description: 'Member role updated',
    type: MemberEntity
  })
  @ApiBadRequestResponse({
    description: 'Invalid userId param',
    type: BadRequestResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({
    description: 'Board not found',
    type: NotFoundResponse
  })
  @UseGuards(IsBoardAdminGuard)
  @Put(':id/members/:userId/roles')
  async updateMemberRole(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto
  ) {
    return this.boardService.updateMemberRole(boardId, userId, dto)
  }
}
