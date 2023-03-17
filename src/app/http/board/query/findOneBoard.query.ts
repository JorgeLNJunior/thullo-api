import { Type } from '@nestjs/class-transformer'
import { IsOptional } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FindOneBoardQuery {
  @ApiProperty({ required: false, description: 'Include owner' })
  @IsOptional()
  @Type(() => Boolean)
  owner?: boolean

  @ApiProperty({ required: false, description: 'Include members' })
  @IsOptional()
  @Type(() => Boolean)
  members?: boolean

  @ApiProperty({ required: false, description: 'Include lists' })
  @IsOptional()
  @Type(() => Boolean)
  lists?: boolean

  @ApiProperty({ required: false, description: 'Include labels' })
  @IsOptional()
  @Type(() => Boolean)
  labels?: boolean
}
