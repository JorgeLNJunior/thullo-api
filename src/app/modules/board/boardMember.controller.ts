import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsValidUserPipe } from '@modules/user/pipes/isValidUser.pipe'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { MemberEntity } from './docs/member.entity'
import { MemberWithUserEntity } from './docs/memberWithUser.entity'
import { RemoveMemberResponse } from './docs/removeMember.response'
import { AddMemberDto } from './dto/addMember.dto'
import { UpdateMemberRoleDto } from './dto/updateRole.dto'
import { IsBoardAdminGuard } from './guards/isBoardAdmin.guard'
import { IsValidBoardPipe } from './pipes/isValidBoard.pipe'
import { FindBoardMembersQuery } from './query/findBoardMembers.query'

@ApiTags('Boards', 'Members')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/members')
export class BoardMemberController {
  constructor(private readonly boardService: BoardService) {}

  @ApiOperation({ summary: 'Find members from a board' })
  @ApiOkResponse({
    description: 'OK',
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
  @Get()
  async findMembers(
    @Param('boardId', IsValidBoardPipe) id: string,
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
  @Put(':userId')
  async addMember(
    @Param('boardId') boardId: string,
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
  @Delete(':userId')
  async removeMember(
    @Param('boardId') boardId: string,
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
  @Put(':userId/roles')
  async updateMemberRole(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto
  ) {
    return this.boardService.updateMemberRole(boardId, userId, dto)
  }
}
