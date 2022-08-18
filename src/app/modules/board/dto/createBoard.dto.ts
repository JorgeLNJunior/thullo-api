import { ApiProperty } from '@nestjs/swagger'
import { MaxLength } from 'class-validator'

export class CreateBoardDto {
  @ApiProperty({ maxLength: 30 })
  @MaxLength(30)
  title: string

  @ApiProperty({ maxLength: 1500 })
  @MaxLength(1500)
  description: string
}
