import { IsNotEmpty, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateListDto {
  @ApiProperty({ maxLength: 30 })
  @MaxLength(30)
  @IsNotEmpty()
  title: string
}
