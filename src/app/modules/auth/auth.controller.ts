import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { AuthService } from './auth.service'
import { UserEntity } from './docs/user.entity'
import { RegisterUserDto } from './dto/registerUser.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ description: 'CREATED', type: UserEntity })
  @Throttle(10, 60)
  @Post('register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto)
  }
}
