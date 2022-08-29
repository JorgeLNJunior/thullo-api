import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidCardPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: value }
    })
    if (!card) throw new NotFoundException('card not found')

    return value
  }
}
