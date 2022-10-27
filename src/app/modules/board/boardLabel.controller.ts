import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { LabelEntity } from '@modules/label/docs/label.entity'
import { UpdateLabelDto } from '@modules/label/dto/updateLabel.dto'
import { LabelService } from '@modules/label/label.service'
import { IsValidLabelPipe } from '@modules/label/pipes/isValidLabel.pipe'
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
