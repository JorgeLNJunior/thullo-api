import { ApiProperty } from '@nestjs/swagger'
import { Card } from '@prisma/client'

export class CardEntity implements Card {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  position: number

  @ApiProperty()
  listId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
