import { IsEnum, IsOptional, MaxLength } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardVisibility } from '@prisma/client'

import { IsUnsplashImageUrl } from '../decorators/isUnsplashImageUrl.decorator'

export class UpdateBoardDto {
  @ApiProperty({ maxLength: 30, required: false })
  @MaxLength(30)
  @IsOptional()
  title?: string

  @ApiProperty({ maxLength: 1500, required: false })
  @MaxLength(1500)
  @IsOptional()
  description?: string

  @ApiProperty({ required: false })
  @IsUnsplashImageUrl()
  @IsOptional()
  coverImage?: string

  @ApiProperty({ enum: BoardVisibility, required: false })
  @IsEnum(BoardVisibility)
  @IsOptional()
  visibility?: BoardVisibility
}
