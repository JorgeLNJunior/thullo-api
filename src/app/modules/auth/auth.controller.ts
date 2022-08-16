import { UserEntity } from '@modules/user/docs/user.entity'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterUserDto } from './dto/registerUser.dto'

@ApiTags('Auth')
@Throttle(10, 60)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ description: 'CREATED', type: UserEntity })
  @Post('register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto)
  }

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(@Request() req, @Body() dto: LoginDto) {
    const token = await this.authService.login(req.user)
    return {
      access_token: token
    }
  }
}
