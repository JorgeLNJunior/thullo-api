import { IsNumberString, IsOptional } from '@nestjs/class-validator'

export class CommentByCardIdQuery {
  @IsOptional()
  userId: string

  @IsOptional()
  @IsNumberString()
  take?: string

  @IsOptional()
  @IsNumberString()
  skip?: string
}
