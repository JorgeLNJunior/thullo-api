import { JwtAuthGuard } from '@modules/auth/guards/JwtAuth.guard'
import { BoardEntity } from '@modules/board/docs/board.entity'
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
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { BadRequestResponse } from '@src/app/docs/BadRequest.reponse'
import { ForbiddenResponse } from '@src/app/docs/Forbidden.response'
import { NotFoundResponse } from '@src/app/docs/NotFound.response'
import { UnauthorizedResponse } from '@src/app/docs/Unauthorized.response'

import { DeleteUserResponse } from './docs/deleteUser.response'
import { UserEntity } from './docs/user.entity'
import { UpdateUserDto } from './dto/updateUser.dto'
import { CanModifyUserGuard } from './guards/canModifyUser.guard'
import { IsValidUserPipe } from './pipes/isValidUser.pipe'
import { FindUserBoardsQuery } from './query/FindUserBoardsQuery'
import { FindUsersQuery } from './query/FindUsersQuery'
import { UserService } from './user.service'

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized',
  type: UnauthorizedResponse
})
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Find many users' })
  @ApiOkResponse({ description: 'OK', type: UserEntity, isArray: true })
  @Get()
  findMany(@Query() query: FindUsersQuery) {
    return this.userService.findMany(query)
  }

  @ApiOperation({ summary: 'Find a user by ID' })
  @ApiOkResponse({ description: 'OK', type: UserEntity })
  @ApiNotFoundResponse({
    description: 'NOT FOUND',
    type: NotFoundResponse
  })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id)
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ description: 'Updated', type: UserEntity })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: BadRequestResponse
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @UseGuards(CanModifyUserGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto)
  }

  @ApiOperation({ summary: 'Delete a user' })
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

  @ApiOperation({ summary: 'Find user boards' })
  @ApiOkResponse({ description: 'OK', type: BoardEntity, isArray: true })
  @ApiNotFoundResponse({
    description: 'User Not Found',
    type: NotFoundResponse
  })
  @Get(':id/boards')
  boards(
    @Param('id', IsValidUserPipe) id: string,
    @Query() query: FindUserBoardsQuery
  ) {
    return this.userService.boards(id, query)
  }
}
