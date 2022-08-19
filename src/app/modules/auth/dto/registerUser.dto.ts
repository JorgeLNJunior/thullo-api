import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength
} from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { IsEmailAlreadyRegistered } from '../decorators/IsEmailAlreadyRegistered'

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsEmailAlreadyRegistered()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}
