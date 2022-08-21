import { IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { IsUnsplashImageUrl } from '../decorators/isUnsplashImageUrl.decorator'

export class UpdateBoardDto {
  @ApiProperty({ maxLength: 30 })
  @MaxLength(30)
  @IsOptional()
  title?: string

  @ApiProperty({ maxLength: 1500 })
  @MaxLength(1500)
  @IsOptional()
  description?: string

  @ApiProperty()
  @IsUnsplashImageUrl()
  @IsOptional()
  coverImage?: string
}
