import { IsNumber, IsOptional, MaxLength, Min } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCardDto {
  @ApiProperty({ maxLength: 30 })
  @IsOptional()
  @MaxLength(30)
  title?: string

  @IsOptional()
  @MaxLength(1500)
  @ApiProperty({ maxLength: 1500, required: false })
  description?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number
}
