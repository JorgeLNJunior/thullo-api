import { BoardRole, Member } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

export class MemberBuilder {
  private member: Member = {
    id: randomUUID(),
    role: BoardRole.MEMBER,
    boardId: randomUUID(),
    userId: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  /**
   * Build a new member.
   * @returns A `Member`object.
   */
  build(): Member {
    return this.member
  }

  /**
   * Set the board of the member object.
   * @param id The id of the board.
   */
  setBoard(id: string): MemberBuilder {
    this.member.boardId = id
    return this
  }

  /**
   * Set the user of the member object.
   * @param id The id of the user.
   */
  setUser(id: string): MemberBuilder {
    this.member.userId = id
    return this
  }

  /**
   * Set the member role.
   * @param role The role to be set.
   */
  setRole(role: BoardRole): MemberBuilder {
    this.member.role = role
    return this
  }

  /**
   * Persists the member in the database.
   * @returns A `Member`object.
   */
  async persist(prisma: PrismaService): Promise<Member> {
    return prisma.member.create({
      data: this.member
    })
  }
}
