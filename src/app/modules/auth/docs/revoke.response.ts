import { ApiProperty } from '@nestjs/swagger'

export class RevokeResponse {
  @ApiProperty({ default: 'the token has been revoked' })
  message: string
}
