import { IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateLabelDto {
  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @MaxLength(20)
  title: string
}
