import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class CanDeleteBoardGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userId = request.user.id
    const boardIdParam = request.params.id

    const board = await this.prisma.board.findUnique({
      where: { id: boardIdParam }
    })

    if (board && board.ownerId !== userId) {
      throw new ForbiddenException('you do not have delete rights')
    }

    return true
  }
}
