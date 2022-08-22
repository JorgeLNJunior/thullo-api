import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class IsValidUserPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: value }
    })
    if (!user) throw new NotFoundException('user not found')

    return value
  }
}
