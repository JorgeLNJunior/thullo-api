import { ApiProperty } from '@nestjs/swagger'

export class DeleteCommentResponse {
  @ApiProperty({ default: 'the comment has been deleted' })
  message: string
}
