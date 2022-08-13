import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsOptional } from 'class-validator'

export class FindUsersQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  take?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  skip?: string
}
