import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { RegisterUserDto } from './dto/registerUser.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto)
  }
}
