import { Allow } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty()
  @Allow()
  email: string

  @ApiProperty()
  @Allow()
  password: string
}
