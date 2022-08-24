import { faker } from '@faker-js/faker'
import { Board } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

export class BoardBuilder {
  private board: Board = {
    id: randomUUID(),
    ownerId: randomUUID(),
    title: faker.lorem.word(),
    description: faker.lorem.sentence(),
    coverImage: faker.image.image(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new board.
   * @returns A `Board`object.
   */
  build(): Board {
    return this.board
  }

  /**
   * Set the owner of the board.
   * @param id The id of the user.
   */
  setOwner(id: string): BoardBuilder {
    this.board.ownerId = id
    return this
  }

  /**
   * Persists the board in the database.
   * @returns A `Board`object.
   */
  async persist(prisma: PrismaService): Promise<Board> {
    return prisma.board.create({
      data: this.board
    })
  }
}
