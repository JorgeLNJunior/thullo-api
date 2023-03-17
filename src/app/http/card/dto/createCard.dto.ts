import { IsNotEmpty, IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCardDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmpty()
  @MaxLength(30)
  title: string

  @ApiProperty({ maxLength: 1500, required: false })
  @IsOptional()
  @MaxLength(1500)
  description?: string
}
