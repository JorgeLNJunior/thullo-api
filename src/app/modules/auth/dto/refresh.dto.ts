import { IsJWT } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshDto {
  @ApiProperty()
  @IsJWT()
  refresh_token: string
}
