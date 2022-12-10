import { ApiProperty } from '@nestjs/swagger'
import { List } from '@prisma/client'

export class ListEntity implements List {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  position: number

  @ApiProperty()
  boardId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
