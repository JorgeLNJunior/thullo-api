import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

import { FindUsersQuery } from './query/FindUsersQuery'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findMany(query: FindUsersQuery) {
    return this.prisma.user.findMany({
      where: {
        name: query.name
      },
      take: Number(query.take) || 20,
      skip: Number(query.skip)
    })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } })

    if (user) return user

    throw new NotFoundException('user not found')
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`
  // }
}
