import { IsNumber, IsOptional, IsString } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCardDto {
  @ApiProperty({ maxLength: 30 })
  @IsOptional()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  @ApiProperty({ maxLength: 1500, required: false })
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  position?: number
}
