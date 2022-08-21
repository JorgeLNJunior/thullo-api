import { IsNotEmpty, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateBoardDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmpty()
  @MaxLength(30)
  title: string

  @ApiProperty({ maxLength: 1500 })
  @IsNotEmpty()
  @MaxLength(1500)
  description: string
}
