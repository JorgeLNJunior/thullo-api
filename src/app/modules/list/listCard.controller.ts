import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { CardService } from '@modules/card/card.service'
import { CardEntity } from '@modules/card/docs/card.entity'
import { CreateCardDto } from '@modules/card/dto/createCard.dto'
import { MemberService } from '@modules/member/member.service'
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
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
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { ListService } from './list.service'
import { IsValidListPipe } from './pipes/isValidList.pipe'

@ApiTags('Cards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('lists/:listId/cards')
export class ListCardController {
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

    return this.listService.findCards(listId)
  }

  // @Get()
  // findAll() {
  //   return this.cardService.findAll()
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.cardService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
  //   return this.cardService.update(+id, updateCardDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cardService.remove(+id)
  // }
}
