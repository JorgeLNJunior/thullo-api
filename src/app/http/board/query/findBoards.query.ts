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

  @ApiProperty({ required: false, description: 'Include owner' })
  @IsOptional()
  @Type(() => Boolean)
  owner?: boolean

  @ApiProperty({ required: false, description: 'Include members' })
  @IsOptional()
  @Type(() => Boolean)
  members?: boolean

  @ApiProperty({ required: false, description: 'Include lists' })
  @IsOptional()
  @Type(() => Boolean)
  lists?: boolean

  @ApiProperty({ required: false, description: 'Include labels' })
  @IsOptional()
  @Type(() => Boolean)
  labels?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
