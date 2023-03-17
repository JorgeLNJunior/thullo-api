import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { LabelColor } from '@http/label/labelColor.enum'
import { Label } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

export class LabelBuilder {
  private label: Label = {
    id: randomUUID(),
    boardId: randomUUID(),
    title: faker.lorem.word(),
    color: LabelColor.BLUE,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new label.
   * @returns A `Label`object.
   */
  build(): Label {
    return this.label
  }

  /**
   * Set the color of the label.
   * @param color The label color.
   */
  setColor(color: LabelColor): LabelBuilder {
    this.label.color = color
    return this
  }

  /**
   * Set the label board.
   * @param id The id of the board.
   */
  setBoard(id: string): LabelBuilder {
    this.label.boardId = id
    return this
  }

  /**
   * Persists the label in the database.
   * @returns A `Label`object.
   */
  async persist(prisma: PrismaService): Promise<Label> {
    return prisma.label.create({
      data: this.label
    })
  }
}
