import { UserEntity } from '@modules/user/docs/user.entity'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { AuthService } from './auth.service'
import { LoginResponse } from './docs/login.response'
import { LoginDto } from './dto/login.dto'
import { RegisterUserDto } from './dto/registerUser.dto'
import { LocalAuthGuard } from './guards/localAuth.guard'

@ApiTags('Auth')
@Throttle(10, 60)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ description: 'Created', type: UserEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @Post('register')
  registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.registerUser(dto)
  }

  @ApiOkResponse({
    description: 'Created',
    type: LoginResponse
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid password',
    type: UnauthorizedResponse
  })
  @ApiBadRequestResponse({
    description: 'Email not registered',
    type: BadRequestResponse
  })
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(@Request() req, @Body() _dto: LoginDto) {
    const token = await this.authService.login(req.user)
    return {
      access_token: token
    }
  }
}
