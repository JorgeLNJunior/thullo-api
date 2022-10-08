import { IsNumberString, IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindUserBoardsQuery {
  @IsOptional()
  @ApiProperty({ enum: ['OWNER', 'MEMBER'], required: false })
  rule?: 'OWNER' | 'MEMBER'

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  take?: string

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ required: false })
  skip?: string
}
