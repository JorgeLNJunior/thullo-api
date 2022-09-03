import { IsNotEmpty, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCommentDto {
  @ApiProperty({ maxLength: 500 })
  @IsNotEmpty()
  @MaxLength(500)
  content: string
}
