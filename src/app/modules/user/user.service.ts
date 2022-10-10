import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Board } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { UpdateUserDto } from './dto/updateUser.dto'
import { FindUserBoardsQuery } from './query/FindUserBoardsQuery'
import { FindUsersQuery } from './query/FindUsersQuery'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findMany(query: FindUsersQuery) {
    return this.prisma.user.findMany({
      where: {
        name: query.name,
        email: query.email
      },
      take: query.take || 20,
      skip: query.skip || 0
    })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } })

    if (user) return user

    throw new NotFoundException('user not found')
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: id } })
    if (!user) throw new BadRequestException(['invalid user id'])

    return this.prisma.user.update({
      where: { id: id },
      data: dto
    })
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } })
    if (!user) throw new BadRequestException(['invalid user id'])

    await this.prisma.refreshToken.deleteMany({
      where: { userId: id }
    })
    await this.prisma.user.delete({
      where: { id: id }
    })
  }

  async boards(userId: string, query: FindUserBoardsQuery): Promise<Board[]> {
    if (query.rule === 'MEMBER') {
      return this.prisma.board.findMany({
        where: { members: { every: { userId: userId } } },
        take: query.take || 20,
        skip: query.skip || 0
      })
    }
    return this.prisma.board.findMany({
      where: { ownerId: userId },
      take: query.take || 20,
      skip: query.skip || 0
    })
  }
}
