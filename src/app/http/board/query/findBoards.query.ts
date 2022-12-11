import { Type } from '@nestjs/class-transformer'
import { IsEnum, IsOptional, IsUUID } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardVisibility } from '@prisma/client'

export class FindBoardsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
