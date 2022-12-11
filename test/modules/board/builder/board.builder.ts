import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { Board, BoardVisibility } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

export class BoardBuilder {
  private board: Board = {
    id: randomUUID(),
    ownerId: randomUUID(),
    title: faker.lorem.word(),
    description: faker.lorem.sentence(),
    coverImage: faker.image.image(),
    visibility: BoardVisibility.PUBLIC,
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
   * @param id The id of the board.
   */
  setOwner(id: string): BoardBuilder {
    this.board.ownerId = id
    return this
  }

  /**
   * Set the visibility of the board.
   * @param visibility The visibility of the board.
   */
  setVisibility(visibility: BoardVisibility): BoardBuilder {
    this.board.visibility = visibility
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
