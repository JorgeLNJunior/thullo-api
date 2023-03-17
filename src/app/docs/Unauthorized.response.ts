import { ApiProperty } from '@nestjs/swagger'

export class UnauthorizedResponse {
  @ApiProperty({ default: 401 })
  statusCode: number

  @ApiProperty({ default: 'Unauthorized' })
  error: string

  @ApiProperty({ example: 'error message' })
  message: string
}
