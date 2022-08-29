import { faker } from '@faker-js/faker'
import { Card } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

export class CardBuilder {
  private card: Card = {
    id: randomUUID(),
    title: faker.lorem.word(),
    description: faker.lorem.paragraph(),
    position: 0,
    listId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new Card.
   * @returns A `Card` object.
   */
  build(): Card {
    return this.card
  }

  /**
   * Set the position of the card.
   * @param position The position of the card.
   */
  setPosition(position: number): CardBuilder {
    this.card.position = position
    return this
  }

  /**
   * Set the owner of the list.
   * @param id The id of the user.
   */
  setList(id: string): CardBuilder {
    this.card.listId = id
    return this
  }

  /**
   * Persists the card in the database.
   * @returns A `Card` object.
   */
  async persist(prisma: PrismaService): Promise<Card> {
    return prisma.card.create({
      data: this.card
    })
  }
}
