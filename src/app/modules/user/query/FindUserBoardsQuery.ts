import { Type } from '@nestjs/class-transformer'
import { IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindUserBoardsQuery {
  @IsOptional()
  @ApiProperty({ enum: ['OWNER', 'MEMBER'], required: false })
  rule?: 'OWNER' | 'MEMBER'

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => Number)
  take?: number

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => Number)
  skip?: number
}
