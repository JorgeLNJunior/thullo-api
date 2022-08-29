import { ApiProperty } from '@nestjs/swagger'

export class DeleteCardResponse {
  @ApiProperty({ default: 'the card has been deleted' })
  message: string
}
