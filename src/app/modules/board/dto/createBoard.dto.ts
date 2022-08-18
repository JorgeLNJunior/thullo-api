import { MaxLength } from 'class-validator'

export class CreateBoardDto {
  @MaxLength(30)
  title: string

  @MaxLength(1500)
  description: string
}
