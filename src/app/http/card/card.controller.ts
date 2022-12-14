import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { CardService } from '@src/app/http/card/card.service'
import { CardEntity } from '@src/app/http/card/docs/card.entity'
import { DeleteCardResponse } from '@src/app/http/card/docs/delete.response'
import { CreateCardDto } from '@src/app/http/card/dto/createCard.dto'
import { UpdateCardDto } from '@src/app/http/card/dto/updateCard.dto'
import { IsValidCardPipe } from '@src/app/http/card/pipes/isValidCard.pipe'
import { MemberService } from '@src/app/http/member/member.service'

import { ListService } from '../list/list.service'
import { IsValidListPipe } from '../list/pipes/isValidList.pipe'
import { FindCardsByListIdQuery } from './query/FindCardsByListId.query'

@ApiTags('Cards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('lists/:listId/cards')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly listService: ListService,
    private readonly memberService: MemberService
  ) {}

  @ApiOperation({ summary: 'Create a card at last position' })
  @ApiCreatedResponse({ description: 'Created', type: CardEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Post()
  async create(
    @Param('listId', IsValidListPipe) listId: string,
    @Body() createCardDto: CreateCardDto,
    @Request() req
  ) {
    const board = await this.listService.findBoardByListId(listId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    return this.cardService.create(listId, createCardDto)
  }

  @ApiOperation({ summary: 'Find all cards from a list' })
  @ApiOkResponse({
    description: 'Created',
    type: CardEntity,
    isArray: true
  })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Get()
  async findCardsByListId(
    @Param('listId', IsValidListPipe) listId: string,
    @Query() query: FindCardsByListIdQuery,
    @Request() req
  ) {
    const board = await this.listService.findBoardByListId(listId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    return this.listService.findCards(listId, query)
  }

  @ApiOperation({ summary: 'Update a card' })
  @ApiOkResponse({
    description: 'Updated',
    type: CardEntity
  })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Patch(':cardId')
  async update(
    @Param('listId', IsValidListPipe) listId: string,
    @Param('cardId', IsValidCardPipe) cardId: string,
    @Body() dto: UpdateCardDto,
    @Request() req
  ) {
    const board = await this.listService.findBoardByListId(listId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    await this.cardService.update(cardId, dto)

    return {
      message: 'the card has been deleted'
    }
  }

  @ApiOperation({ summary: 'Delete a card' })
  @ApiOkResponse({
    description: 'Deleted',
    type: DeleteCardResponse
  })
  @ApiNotFoundResponse({
    description: 'List not found',
    type: NotFoundResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @Delete(':cardId')
  async delete(
    @Param('listId', IsValidListPipe) listId: string,
    @Param('cardId', IsValidCardPipe) cardId: string,
    @Request() req
  ) {
    const board = await this.listService.findBoardByListId(listId)

    const isBoardMember = await this.memberService.isBoardMember(
      req.user.id,
      board.id
    )
    if (!isBoardMember) {
      throw new ForbiddenException('you are not a member of this board')
    }

    await this.cardService.delete(cardId)

    return {
      message: 'the card has been deleted'
    }
  }
}
