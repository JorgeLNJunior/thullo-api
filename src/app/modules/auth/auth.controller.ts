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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { AuthService } from './auth.service'
import { LoginResponse } from './docs/login.response'
import { RefreshResponse } from './docs/refresh.response'
import { RevokeResponse } from './docs/revoke.response'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { RegisterUserDto } from './dto/registerUser.dto'
import { RevokeDto } from './dto/revoke.dto'
import { LocalAuthGuard } from './guards/localAuth.guard'

@ApiTags('Auth')
@Throttle(10, 60)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'Created', type: UserEntity })
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
    return await this.authService.login(req.user)
  }

  @ApiOkResponse({
    description: 'Refreshed',
    type: RefreshResponse
  })
  @ApiBadRequestResponse({
    description: 'Invalid token',
    type: BadRequestResponse
  })
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    const accessToken = await this.authService.refreshAccessToken(
      dto.refresh_token
    )
    return {
      access_token: accessToken
    }
  }

  @ApiOkResponse({
    description: 'Revoked',
    type: RevokeResponse
  })
  @ApiBadRequestResponse({
    description: 'Token not found',
    type: BadRequestResponse
  })
  @HttpCode(200)
  @Post('revoke')
  async revoke(@Body() dto: RevokeDto) {
    await this.authService.revoke(dto.refresh_token)
    return {
      message: 'the token has been revoked'
    }
  }
}
