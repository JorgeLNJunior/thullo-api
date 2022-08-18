import { ApiProperty } from '@nestjs/swagger'
import { Board } from '@prisma/client'

export class BoardEntity implements Board {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  coverImage: string

  @ApiProperty()
  ownerId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
