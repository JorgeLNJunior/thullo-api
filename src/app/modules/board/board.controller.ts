import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'

import { BoardService } from './board.service'
import { CreateBoardDto } from './dto/createBoard.dto'

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() dto: CreateBoardDto, @Request() req) {
    return this.boardService.create(req.user.id, dto)
  }

  // @Get()
  // findAll() {
  //   return this.boardService.findAll()
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.boardService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
  //   return this.boardService.update(+id, updateBoardDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.boardService.remove(+id)
  // }
}
