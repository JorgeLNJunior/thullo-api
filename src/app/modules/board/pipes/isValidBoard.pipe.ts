import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidBoardPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: string) {
    const board = this.prisma.board.findUnique({
      where: { id: value }
    })
    if (!board) throw new NotFoundException('board not found')

    return value
  }
}
