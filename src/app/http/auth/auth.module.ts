import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { BcryptService } from '@services/bcrypt.service'
import { UnsplashService } from '@services/unsplash.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IsEmailAlreadyRegisteredConstraint } from './decorators/IsEmailAlreadyRegistered'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: '1h'
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BcryptService,
    UnsplashService,
    IsEmailAlreadyRegisteredConstraint,
    LocalStrategy,
    JwtStrategy
  ]
})
export class AuthModule {}
