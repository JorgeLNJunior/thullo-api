import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidListPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: value }
    })
    if (!list) throw new NotFoundException('list not found')

    return value
  }
}
