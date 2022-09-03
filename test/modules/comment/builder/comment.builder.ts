import { faker } from '@faker-js/faker'
import { Comment } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

export class CommentBuilder {
  private comment: Comment = {
    id: randomUUID(),
    content: faker.lorem.paragraph(),
    cardId: randomUUID(),
    userId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new Card.
   * @returns A `Card` object.
   */
  build(): Comment {
    return this.comment
  }

  /**
   * Set the card.
   * @param id The id of the card.
   */
  setCard(id: string): CommentBuilder {
    this.comment.cardId = id
    return this
  }

  /**
   * Set the user.
   * @param id The id of the user.
   */
  setUser(id: string): CommentBuilder {
    this.comment.userId = id
    return this
  }

  /**
   * Persists the comment in the database.
   * @returns A `Comment` object.
   */
  async persist(prisma: PrismaService): Promise<Comment> {
    return prisma.comment.create({
      data: this.comment
    })
  }
}
