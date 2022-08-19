import { ApiProperty } from '@nestjs/swagger'

export class DeleteBoardResponse {
  @ApiProperty({ default: 'the board has been deleted' })
  message: string
}
