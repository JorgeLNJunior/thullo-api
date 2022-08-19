import { IsEnum, IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardRole } from '@prisma/client'

export class AddMemberDto {
  @ApiProperty({
    enum: BoardRole,
    default: BoardRole.MEMBER,
    required: false
  })
  @IsOptional()
  @IsEnum(BoardRole)
  role?: BoardRole
}
