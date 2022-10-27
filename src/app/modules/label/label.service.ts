import { Injectable } from '@nestjs/common'
import { Label } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { UpdateLabelDto } from './dto/updateLabel.dto'
import { LabelColor } from './labelColor.enum'

@Injectable()
export class LabelService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create all default board labels.
   * @param boardId The id of the board.
   */
  async createDefaultLabels(boardId: string): Promise<void> {
    const promises = Object.values(LabelColor).map(async (label) => {
      await this.prisma.label.create({
        data: {
          boardId: boardId,
          color: label
        }
      })
    })

    await Promise.all(promises)
  }

  /**
   * Update a board label.
   * @param id The id of the label.
   * @param dto The data to be updated.
   */
  async update(id: string, dto: UpdateLabelDto): Promise<Label> {
    return this.prisma.label.update({
      where: { id: id },
      data: dto
    })
  }
}
