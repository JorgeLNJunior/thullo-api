import { ApiProperty } from '@nestjs/swagger'

export class NotFoundResponse {
  @ApiProperty({ default: 404 })
  statusCode: number

  @ApiProperty({ default: 'Not Found' })
  error: string

  @ApiProperty({ example: 'resource not found' })
  message: string
}
