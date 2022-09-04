import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { BoardService } from '@modules/board/board.service'
import { CardService } from '@modules/card/card.service'
import { ListService } from '@modules/list/list.service'
import { MemberService } from '@modules/member/member.service'
import {
  Body,
  Controller,
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
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { CommentService } from './comment.service'
import { CommentEntity } from './docs/comment.entity'
import { CreateCommentDto } from './dto/createComment.dto'
import { UpdateCommentDto } from './dto/updateComment.dto'
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
  @ApiCreatedResponse({ description: 'OK', type: CommentEntity })
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
    @Param('commentId') commentId: string,
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

  // @Get()
  // findAll() {
  //   return this.commentService.findAll()
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.commentService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
  //   return this.commentService.update(+id, updateCommentDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.commentService.remove(+id)
  // }
}
