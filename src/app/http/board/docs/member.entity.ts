import { ApiProperty } from '@nestjs/swagger'
import { BoardRole, Member } from '@prisma/client'

export class MemberEntity implements Member {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  boardId: string

  @ApiProperty({ enum: BoardRole })
  role: BoardRole

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
