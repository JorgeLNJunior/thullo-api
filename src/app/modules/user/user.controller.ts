import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'

import { UserEntity } from './docs/user.entity'
import { FindUsersQuery } from './query/FindUsersQuery'
import { UserService } from './user.service'

@ApiTags('Users')
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id)
  // }
}
