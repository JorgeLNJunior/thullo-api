import { Type } from '@nestjs/class-transformer'
import { IsEnum, IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardRole } from '@prisma/client'

export class FindBoardMembersQuery {
  @ApiProperty({ enum: BoardRole, required: false })
  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
