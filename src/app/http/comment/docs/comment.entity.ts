import { ApiProperty } from '@nestjs/swagger'
import { Comment } from '@prisma/client'

export class CommentEntity implements Comment {
  @ApiProperty()
  id: string

  @ApiProperty()
  content: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  cardId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
