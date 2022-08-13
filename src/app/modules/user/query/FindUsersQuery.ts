import { IsNumberString, IsOptional } from 'class-validator'

export class FindUsersQuery {
  @IsOptional()
  name?: string

  @IsOptional()
  email?: string

  @IsOptional()
  @IsNumberString()
  take?: string

  @IsOptional()
  @IsNumberString()
  skip?: string
}
