import { IsNumberString, IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindUsersQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  take?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  skip?: string
}
