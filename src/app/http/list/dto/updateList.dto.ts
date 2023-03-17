import { IsInt, IsOptional, MaxLength, Min } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateListDto {
  @ApiProperty({ maxLength: 30, required: false })
  @MaxLength(30)
  @IsOptional()
  title?: string

  @ApiProperty({ minimum: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}
