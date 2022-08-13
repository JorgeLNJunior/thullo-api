import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  PartialType
} from '@nestjs/swagger'

import { UserEntity } from './docs/user.entity'
import { UserService } from './user.service'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // findAll() {
  //   return this.userService.findAll()
  // }

  @ApiOkResponse({ description: 'OK', type: UserEntity })
  @ApiNotFoundResponse({
    description: 'NOT FOUND',
    type: NotFoundException // ! find a way to use exceptions here !
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
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
