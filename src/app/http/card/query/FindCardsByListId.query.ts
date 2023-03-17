import { Type } from '@nestjs/class-transformer'
import { IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindCardsByListIdQuery {
  @ApiProperty({ required: false, description: 'Include comments' })
  @IsOptional()
  @Type(() => Boolean)
  comments?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  take?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  skip?: number
}
