import { ApiProperty } from '@nestjs/swagger'
import { Allow } from 'class-validator'

export class LoginDto {
  @ApiProperty()
  @Allow()
  email: string

  @ApiProperty()
  @Allow()
  password: string
}
