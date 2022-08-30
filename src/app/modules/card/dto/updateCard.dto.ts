import { IsNumber, IsOptional } from '@nestjs/class-validator'
import { ApiProperty, PartialType } from '@nestjs/swagger'

import { CreateCardDto } from './createCard.dto'

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  position: number
}
