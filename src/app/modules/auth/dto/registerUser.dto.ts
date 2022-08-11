import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

import { IsEmailAlreadyRegistered } from '../decorators/IsEmailAlreadyRegistered'

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @IsEmail()
  @IsEmailAlreadyRegistered()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}
