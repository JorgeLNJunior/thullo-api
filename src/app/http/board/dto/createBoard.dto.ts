import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength
} from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardVisibility } from '@prisma/client'

import { IsUnsplashImageUrl } from '../decorators/isUnsplashImageUrl.decorator'

export class CreateBoardDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmpty()
  @MaxLength(30)
  title: string

  @ApiProperty({ maxLength: 1500 })
  @IsNotEmpty()
  @MaxLength(1500)
  description: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUnsplashImageUrl()
  coverImage?: string

  @ApiProperty({ required: false, default: BoardVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility
}
