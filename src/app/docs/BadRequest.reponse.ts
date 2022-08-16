import { ApiProperty } from '@nestjs/swagger'

export class BadRequestResponse {
  @ApiProperty({ default: 400 })
  statusCode: number

  @ApiProperty({ default: 'Bad Request' })
  error: string

  @ApiProperty({ example: ['validation message'] })
  message: string[]
}
