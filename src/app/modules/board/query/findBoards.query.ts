import { IsNumberString, IsOptional, IsUUID } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

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
