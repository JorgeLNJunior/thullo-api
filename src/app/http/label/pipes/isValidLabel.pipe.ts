import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidLabelPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(id: string) {
    const label = await this.prisma.label.findUnique({
      where: { id: id }
    })
    if (!label) throw new NotFoundException('label not found')

    return id
  }
}
