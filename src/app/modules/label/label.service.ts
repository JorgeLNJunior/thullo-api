import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

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
}
