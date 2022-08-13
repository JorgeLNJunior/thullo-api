import { Module } from '@nestjs/common'
import { BcryptService } from '@services/bcrypt.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IsEmailAlreadyRegisteredConstraint } from './decorators/IsEmailAlreadyRegistered'

@Module({
  controllers: [AuthController],
  providers: [AuthService, BcryptService, IsEmailAlreadyRegisteredConstraint]
})
export class AuthModule {}
