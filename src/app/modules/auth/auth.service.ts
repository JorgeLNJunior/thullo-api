import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { BcryptService } from '@services/bcrypt.service'
import { PrismaService } from 'nestjs-prisma'

import { RegisterUserDto } from './dto/registerUser.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private bcrypt: BcryptService
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<User> {
    dto.password = await this.bcrypt.hash(dto.password)

    return this.prisma.user.create({
      data: dto
    })
  }

  async login(user: User) {
    const payload = { user_id: user.id }
    return this.jwtService.sign(payload)
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email }
    })

    if (!user) throw new BadRequestException(['email not registered'])

    const isSamePassword = await this.bcrypt.compare(password, user.password)

    if (!isSamePassword) throw new UnauthorizedException('invalid password')

    return user
  }
}
