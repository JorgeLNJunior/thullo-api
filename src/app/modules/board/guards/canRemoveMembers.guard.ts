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
export class CanRemoveMembersGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const autenticatedUserId = request.user.id
    const boardIdParam = request.params.id
    const userIdParam = request.params.userId

    // User to be removed validation
    const isMember = await this.prisma.member.findFirst({
      where: {
        boardId: boardIdParam,
        userId: userIdParam
      }
    })
    if (!isMember) {
      throw new BadRequestException([
        'this user is is not a member of this board'
      ])
    }

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
