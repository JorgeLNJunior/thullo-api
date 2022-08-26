import { ApiProperty } from '@nestjs/swagger'

export class DeleteListResponse {
  @ApiProperty({ default: 'the list has been deleted' })
  message: string
}
