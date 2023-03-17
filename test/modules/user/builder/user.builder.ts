import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

export class UserBuilder {
  private user: User = {
    id: randomUUID(),
    email: faker.internet.email(randomUUID()),
    name: faker.internet.userName(),
    password: faker.internet.password(6),
    profileImage: faker.internet.avatar(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new user.
   * @returns A `User`object.
   */
  build(): User {
    return this.user
  }

  /**
   * Persists the user in the database.
   * @returns A `User`object.
   */
  async persist(prisma: PrismaService): Promise<User> {
    return prisma.user.create({
      data: this.user
    })
  }
}
