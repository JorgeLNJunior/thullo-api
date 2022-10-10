import { Type } from '@nestjs/class-transformer'
import { IsOptional, IsUUID } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindBoardsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
