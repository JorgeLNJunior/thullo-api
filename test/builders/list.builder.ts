import { faker } from '@faker-js/faker'
import { List } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

export class ListBuilder {
  private list: List = {
    id: randomUUID(),
    title: faker.lorem.word(),
    position: 1,
    boardId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new list.
   * @returns A `List`object.
   */
  build(): List {
    return this.list
  }

  /**
   * Set the owner of the list.
   * @param id The id of the user.
   */
  setBoard(id: string): ListBuilder {
    this.list.boardId = id
    return this
  }

  /**
   * Persists the list in the database.
   * @returns A `List`object.
   */
  async persist(prisma: PrismaService): Promise<List> {
    return prisma.list.create({
      data: this.list
    })
  }
}
