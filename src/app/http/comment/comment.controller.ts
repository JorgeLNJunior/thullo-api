import { BadRequestResponse } from '@docs/BadRequest.response'
import { ForbiddenResponse } from '@docs/Forbidden.response'
import { NotFoundResponse } from '@docs/NotFound.response'
import { UnauthorizedResponse } from '@docs/Unauthorized.response'
import { JwtAuthGuard } from '@http/auth/guards/JwtAuth.guard'
import { BoardService } from '@http/board/board.service'
import { CardService } from '@http/card/card.service'
import { ListService } from '@http/list/list.service'
import { MemberService } from '@http/member/member.service'
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'

import { CommentService } from './comment.service'
import { CommentEntity } from './docs/comment.entity'
import { DeleteCommentResponse } from './docs/deleteComment.response'
import { CreateCommentDto } from './dto/createComment.dto'
import { UpdateCommentDto } from './dto/updateComment.dto'
import { IsValidCommentPipe } from './pipes/isValidComment.pipe'
import { CommentByCardIdQuery } from './query/commentByCardId.query'

@ApiTags('Cards', 'Comments')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('cards/:cardId/comments')
export class CommentController {
  constructor(
    private readonly boardService: BoardService,
    private readonly cardService: CardService,
    private readonly commentService: CommentService,
    private readonly listService: ListService,
    private readonly memberService: MemberService
  ) {}

  @ApiOperation({ summary: 'Create a comment in a card' })
  @ApiCreatedResponse({ description: 'Created', type: CommentEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Card not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Post()
  async create(
    @Param('cardId') cardId: string,
    @Body() dto: CreateCommentDto,
    @Request() req
  ) {
    const card = await this.cardService.findById(cardId)
    if (!card) throw new NotFoundException('card not found')

    const list = await this.listService.findById(card.listId)
    const board = await this.boardService.findById(list.boardId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    return this.commentService.create(cardId, req.user.id, dto)
  }

  @ApiOperation({ summary: 'Find comments by card id' })
  @ApiCreatedResponse({ description: 'OK', type: CommentEntity, isArray: true })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Card not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Get()
  async findByCardId(
    @Param('cardId') cardId: string,
    @Query() query: CommentByCardIdQuery,
    @Request() req
  ) {
    const card = await this.cardService.findById(cardId)
    if (!card) throw new NotFoundException('card not found')

    const list = await this.listService.findById(card.listId)
    const board = await this.boardService.findById(list.boardId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    return this.commentService.findByCardId(cardId, query)
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiCreatedResponse({ description: 'Updated', type: CommentEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Card not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Patch(':commentId')
  async update(
    @Param('cardId') cardId: string,
    @Param('commentId', IsValidCommentPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
    @Request() req
  ) {
    const card = await this.cardService.findById(cardId)
    if (!card) throw new NotFoundException('card not found')

    const list = await this.listService.findById(card.listId)
    const board = await this.boardService.findById(list.boardId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    const isCommentAuthor = await this.commentService.isCommentAuthor(
      commentId,
      req.user.id
    )
    if (!isCommentAuthor) {
      throw new ForbiddenException('you are not the comment author')
    }

    return this.commentService.update(commentId, dto)
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiCreatedResponse({ description: 'Deleted', type: DeleteCommentResponse })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'Card not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Delete(':commentId')
  async delete(
    @Param('cardId') cardId: string,
    @Param('commentId', IsValidCommentPipe) commentId: string,
    @Request() req
  ) {
    const card = await this.cardService.findById(cardId)
    if (!card) throw new NotFoundException('card not found')

    const list = await this.listService.findById(card.listId)
    const board = await this.boardService.findById(list.boardId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    const isCommentAuthor = await this.commentService.isCommentAuthor(
      commentId,
      req.user.id
    )
    if (!isCommentAuthor) {
      throw new ForbiddenException('you are not the comment author')
    }

    await this.commentService.delete(commentId)

    return { message: 'the comment has been deleted' }
  }
}
