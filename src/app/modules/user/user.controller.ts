import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'

import { DeleteUserResponse } from './docs/deleteUser.response'
import { UserEntity } from './docs/user.entity'
import { UpdateUserDto } from './dto/updateUser.dto'
import { CanModifyUserGuard } from './guards/canModifyUser.guard'
import { FindUsersQuery } from './query/FindUsersQuery'
import { UserService } from './user.service'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ description: 'OK', type: UserEntity, isArray: true })
  @Get()
  findMany(@Query() query: FindUsersQuery) {
    return this.userService.findMany(query)
  }

  @ApiOkResponse({ description: 'OK', type: UserEntity })
  @ApiNotFoundResponse({
    description: 'NOT FOUND',
    type: NotFoundResponse
  })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id)
  }

  @UseGuards(CanModifyUserGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto)
  }

  @ApiOkResponse({ description: 'Deleted', type: DeleteUserResponse })
  @ApiBadRequestResponse({
    description: 'Invalid id',
    type: BadRequestResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @UseGuards(CanModifyUserGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id)
    return {
      message: 'The user has been deleted'
    }
  }
}
