import { Type } from '@nestjs/class-transformer'
import { IsOptional } from '@nestjs/class-validator'
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
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
