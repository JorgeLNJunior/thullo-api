import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import {
  Body,
  Controller,
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
  ApiNotFoundResponse,
  ApiTags
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'

import { BoardService } from './board.service'
import { BoardEntity } from './docs/board.entity'
import { CreateBoardDto } from './dto/createBoard.dto'

@ApiTags('Boards')
@ApiBearerAuth()
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

  // @Get()
  // findAll() {
  //   return this.boardService.findAll()
  // }

  @ApiCreatedResponse({ description: 'Ok', type: BoardEntity })
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.boardService.remove(+id)
  // }
}
