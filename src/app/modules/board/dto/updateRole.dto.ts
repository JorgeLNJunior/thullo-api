import { IsEnum } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardRole } from '@prisma/client'

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: BoardRole,
    required: true
  })
  @IsEnum(BoardRole)
  role: BoardRole
}
