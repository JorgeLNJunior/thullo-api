import { Module } from '@nestjs/common'
import { ConfigModule as Config } from '@nestjs/config'
import * as Joi from 'joi'

@Module({
  imports: [
    Config.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required()
      })
    })
  ]
})
export class ConfigModule {}
