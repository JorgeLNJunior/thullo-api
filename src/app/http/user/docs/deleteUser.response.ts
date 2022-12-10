import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserResponse {
  @ApiProperty({ default: `The user has been deleted` })
  message: string
}
