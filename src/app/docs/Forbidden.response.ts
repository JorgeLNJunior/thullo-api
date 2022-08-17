import { ApiProperty } from '@nestjs/swagger'

export class ForbiddenResponse {
  @ApiProperty({ default: 401 })
  statusCode: number

  @ApiProperty({ default: 'Forbidden' })
  error: string

  @ApiProperty({ example: 'error message' })
  message: string
}
