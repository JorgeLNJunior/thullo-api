import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidCommentPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: string) {
    const list = await this.prisma.comment.findUnique({
      where: { id: value }
    })
    if (!list) throw new NotFoundException('comment not found')

    return value
  }
}
