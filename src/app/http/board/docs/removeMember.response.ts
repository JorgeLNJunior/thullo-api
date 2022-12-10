import { ApiProperty } from '@nestjs/swagger'

export class RemoveMemberResponse {
  @ApiProperty({ default: 'the member has been removed' })
  message: string
}
