import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { IsValidBoardPipe } from '@modules/board/pipes/isValidBoard.pipe'
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { ListEntity } from './docs/list.entity'
import { CreateListDto } from './dto/createList.dto'
import { ListService } from './list.service'

@ApiTags('Boards', 'Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @ApiOperation({ summary: 'Create a new list at last position' })
  @ApiCreatedResponse({ description: 'Created', type: ListEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @Post()
  create(
    @Param('boardId', IsValidBoardPipe) boardId: string,
    @Body() dto: CreateListDto
  ) {
    return this.listService.create(boardId, dto)
  }

  // @Get()
  // findAll() {
  //   return this.listService.findAll()
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.listService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
  //   return this.listService.update(+id, updateListDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.listService.remove(+id)
  // }
}
