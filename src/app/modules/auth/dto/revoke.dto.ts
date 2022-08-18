import { ApiProperty } from '@nestjs/swagger'
import { IsJWT } from 'class-validator'

export class RevokeDto {
  @ApiProperty()
  @IsJWT()
  refresh_token: string
}
