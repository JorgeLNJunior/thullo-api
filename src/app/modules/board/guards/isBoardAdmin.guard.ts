import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { BoardRole } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsBoardAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const autenticatedUserId = request.user.id
    const boardIdParam = request.params.id

    // Board validation
    const board = await this.prisma.board.findUnique({
      where: { id: boardIdParam }
    })
    if (!board) throw new NotFoundException('board not found')

    // Authenticated user validation
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
