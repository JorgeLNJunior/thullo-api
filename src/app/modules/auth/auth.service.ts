import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'
import { BcryptService } from 'src/app/services/bcrypt.service'

import { RegisterUserDto } from './dto/registerUser.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private bcrypt: BcryptService) {}

  async registerUser(dto: RegisterUserDto): Promise<User> {
    dto.password = await this.bcrypt.hash(dto.password)

    return this.prisma.user.create({
      data: dto
    })
  }
}
