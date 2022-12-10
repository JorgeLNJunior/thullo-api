import { ApiProperty } from '@nestjs/swagger'
import { BoardRole, Prisma, User } from '@prisma/client'
import { UserEntity } from '@src/app/http/user/docs/user.entity'

type MemberWithUser = Prisma.MemberGetPayload<{
  include: { user: true }
}>

export class MemberWithUserEntity implements MemberWithUser {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  boardId: string

  @ApiProperty()
  role: BoardRole

  @ApiProperty({ type: UserEntity })
  user: User

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
