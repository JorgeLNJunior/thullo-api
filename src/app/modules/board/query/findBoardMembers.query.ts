import { IsEnum, IsNumberString } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardRole } from '@prisma/client'

export class FindBoardMembersQuery {
  @ApiProperty({ enum: BoardRole, required: false })
  @IsEnum(BoardRole)
  role?: BoardRole

  @ApiProperty({ required: false })
  @IsNumberString()
  take?: string

  @ApiProperty({ required: false })
  @IsNumberString()
  skip?: string
}
