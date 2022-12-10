import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCardDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  @ApiProperty({ maxLength: 1500, required: false })
  description?: string
}
