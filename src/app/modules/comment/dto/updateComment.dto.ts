import { IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCommentDto {
  @ApiProperty({ maxLength: 500 })
  @IsOptional()
  @MaxLength(500)
  content?: string
}
