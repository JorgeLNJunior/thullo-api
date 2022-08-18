import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { BcryptService } from '@services/bcrypt.service'
import { UnsplashService } from '@services/unsplash.service'
import { PrismaService } from 'nestjs-prisma'

import { RegisterUserDto } from './dto/registerUser.dto'
import { RefreshToken } from './interfaces/tokens.interface'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private bcrypt: BcryptService,
    private config: ConfigService,
    private unsplash: UnsplashService
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<User> {
    dto.password = await this.bcrypt.hash(dto.password)

    const profileImage = await this.unsplash.findRandomUserAvatar()

    return this.prisma.user.create({
      data: {
        profileImage: profileImage,
        ...dto
      }
    })
  }

  async login(user: User) {
    const payload = { user_id: user.id }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1w',
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET')
    })

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { userId: user.id }
    })
    if (storedToken) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } })
    }

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id }
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    }
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

  async refreshAccessToken(refreshToken: string) {
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_TOKEN_SECRET')
      })

      const decoded: RefreshToken = this.jwtService.decode(refreshToken) as any

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: { userId: decoded.user_id }
      })

      if (storedToken.token !== refreshToken)
        throw new ForbiddenException('invalid refresh token')

      const payload = { user_id: decoded.user_id }

      return this.jwtService.sign(payload)
    } catch (error) {
      if (error.name === 'JsonWebTokenError')
        throw new BadRequestException(error.message)

      throw error
    }
  }

  /**
   * Revoke a refresh token.
   * @throws `BadRequestException` - Token not found.
   * @param token The refresh token to be revoked.
   */
  async revoke(token: string) {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { token: token }
    })

    if (!storedToken) throw new BadRequestException(['token not found'])

    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id }
    })
  }
}
