import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'

import { DeleteUserResponse } from './docs/deleteUser.response'
import { UserEntity } from './docs/user.entity'
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto)
  // }

  @UseGuards(CanModifyUserGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id)
    return {
      message: 'The user has been deleted'
    }
  }
}
