import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async isBoardMember(userId: string, boardId: string): Promise<boolean> {
    const isMember = await this.prisma.member.findFirst({
      where: {
        userId: userId,
        boardId: boardId
      }
    })

    if (isMember) return true
    return false
  }
}
