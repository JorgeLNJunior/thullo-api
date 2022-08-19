import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { BoardRole } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class CanAddMembersGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const autenticatedUserId = request.user.id
    const boardIdParam = request.params.id
    const userIdParam = request.params.userId

    const user = await this.prisma.user.findUnique({
      where: { id: userIdParam }
    })
    if (!user) throw new BadRequestException(['user not found'])

    const board = await this.prisma.board.findUnique({
      where: { id: boardIdParam }
    })
    if (!board) throw new BadRequestException(['board not found'])

    const isAlreadymember = await this.prisma.member.findFirst({
      where: {
        boardId: boardIdParam,
        userId: userIdParam
      }
    })
    if (isAlreadymember) {
      throw new BadRequestException([
        'this user is already a member of this board'
      ])
    }

    const member = await this.prisma.member.findFirst({
      where: {
        boardId: boardIdParam,
        userId: autenticatedUserId
      }
    })

    if (!member) {
      throw new ForbiddenException('you are not a member of this board')
    }
    if (member.role !== BoardRole.ADMIN) {
      throw new ForbiddenException('you are not an administrator of this board')
    }

    return true
  }
}
