import { IsInt, IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateListDto {
  @ApiProperty({ maxLength: 30 })
  @MaxLength(30)
  @IsOptional()
  title: string

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @IsOptional()
  position: number
}
