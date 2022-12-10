import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'
import { JwtAuthGuard } from '@src/app/http/auth/guards/JwtAuth.guard'
import { LabelEntity } from '@src/app/http/label/docs/label.entity'
import { UpdateLabelDto } from '@src/app/http/label/dto/updateLabel.dto'
import { LabelService } from '@src/app/http/label/label.service'
import { IsValidLabelPipe } from '@src/app/http/label/pipes/isValidLabel.pipe'

import { IsBoardMemberGuard } from './guards/isBoardMember.guard'

@ApiTags('Boards', 'Labels')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard, IsBoardMemberGuard)
@Controller('boards/:boardId/labels')
export class BoardLabelController {
  constructor(private labelService: LabelService) {}

  @ApiOperation({ summary: 'Update a label' })
  @ApiOkResponse({ description: 'Updated', type: LabelEntity })
  @ApiNotFoundResponse({
    description: 'Label not found',
    type: NotFoundResponse
  })
  @Patch(':labelId')
  update(
    @Param('labelId', IsValidLabelPipe) id: string,
    @Body() dto: UpdateLabelDto
  ) {
    return this.labelService.update(id, dto)
  }
}
