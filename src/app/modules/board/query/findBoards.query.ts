import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsOptional, IsUUID } from 'class-validator'

export class FindBoardsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ownerId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  take?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  skip?: string
}
