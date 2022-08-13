import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // findAll() {
  //   return `This action returns all user`
  // }

  async findOne(id: string) {
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
