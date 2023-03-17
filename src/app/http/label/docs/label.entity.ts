import { ApiProperty } from '@nestjs/swagger'
import { Label } from '@prisma/client'

import { LabelColor } from '../labelColor.enum'

export class LabelEntity implements Label {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: LabelColor })
  color: string

  @ApiProperty()
  title: string

  @ApiProperty()
  boardId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
